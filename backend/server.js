const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

// Serve static frontend in production
if (isProduction) {
  const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║           CareerLens Backend - Starting Up               ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('[CONFIG] Port:', PORT);
console.log('[CONFIG] Supabase URL:', supabaseUrl ? supabaseUrl.slice(0, 30) + '...' : 'MISSING');
console.log('[CONFIG] Supabase Key Type:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE (secure)' : 'ANON (RLS applies)');
console.log('[CONFIG] Groq API Key:', process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.startsWith('gsk_') ? '✓ Configured' : 'MISSING');
console.log('[CONFIG] Gemini API Key:', process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith('AIza') ? '✓ Configured' : 'MISSING');

const supabase = createClient(supabaseUrl, supabaseKey);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[REQUEST] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

app.get('/health', (req, res) => {
  console.log('[HEALTH] Health check requested');
  res.json({ 
    status: 'ok', 
    message: 'CareerLens API is running', 
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Diagnostic: test DB connection
app.get('/api/db-test', async (req, res) => {
  console.log('[DB-TEST] Testing database connection...');
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    console.log('[DB-TEST] ✓ Database connection successful! Users count:', data[0]?.count);
    res.json({ status: 'DB connected', userCount: data[0]?.count, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('[DB-TEST] ✗ Database connection failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Save onboarding responses and generate report
app.post('/api/onboarding', async (req, res) => {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  [ONBOARDING] New submission received                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  try {
    const { userId, email, answers } = req.body;

    console.log('[ONBOARDING] 📋 User ID:', userId);
    console.log('[ONBOARDING] 📧 Email:', email || 'not provided');
    console.log('[ONBOARDING] 📝 Total answers:', Object.keys(answers || {}).length);

    if (!userId || !answers) {
      console.error('[ONBOARDING] ✗ Missing userId or answers');
      return res.status(400).json({ error: 'Missing userId or answers payload' });
    }

    // Step 1: Upsert user record to avoid FK constraint
    console.log('[ONBOARDING] 👤 [STEP 1/6] Upserting user to database...');
    const { error: userError } = await supabase
      .from('users')
      .upsert({ id: userId, email: email || '' }, { onConflict: 'id' });

    if (userError) {
      console.error('[ONBOARDING] ✗ User upsert failed:', userError.message);
    } else {
      console.log('[ONBOARDING] ✓ [STEP 1/6] User saved successfully');
    }

    // Step 2: Flatten answers — handle rating_grid keys
    const cleanedAnswers = {};
    for (const [key, value] of Object.entries(answers)) {
      const cleanKey = key.startsWith('skill_rating_') ? key.replace('skill_rating_', '') : key;
      cleanedAnswers[cleanKey] = value?.toString() || '';
    }
    console.log('[ONBOARDING] 🔧 [STEP 2/6] Processed', Object.keys(cleanedAnswers).length, 'answers');

    // Step 3: Insert answers into onboarding_answers table
    const insertData = Object.entries(cleanedAnswers).map(([key, value]) => ({
      user_id: userId,
      question_key: key,
      answer_text: value
    }));

    console.log('[ONBOARDING] 💾 [STEP 3/6] Saving answers to database...');
    const { error: insertError } = await supabase
      .from('onboarding_answers')
      .insert(insertData);

    if (insertError) {
      console.error('[ONBOARDING] ✗ Failed to save answers:', insertError.message);
      throw insertError;
    }
    console.log('[ONBOARDING] ✓ [STEP 3/6] Answers saved successfully');

    // Step 4: Extract signals from answers
    console.log('[ONBOARDING] 🔍 [STEP 4/6] Extracting behavioral signals...');
    const { extractSignals } = require('./utils/signalExtractor');
    const signals = extractSignals(cleanedAnswers);
    console.log('[ONBOARDING] 📊 Signals extracted:', JSON.stringify(signals));

    // Step 5: Generate AI report
    console.log('[ONBOARDING] 🤖 [STEP 5/6] Generating AI career report...');
    const { generateCareerReport } = require('./services/aiService');
    const reportData = await generateCareerReport(cleanedAnswers, signals);
    console.log('[ONBOARDING] ✓ [STEP 5/6] AI Report generated - Career Identity:', reportData?.career_identity);

    // Step 6: Save report to DB
    console.log('[ONBOARDING] 💾 [STEP 6/6] Saving report to database...');
    const { data: dbReport, error: reportError } = await supabase
      .from('career_reports')
      .insert({
        user_id: userId,
        career_identity: reportData.career_identity,
        career_identity_description: reportData.career_identity_description,
        top_matches: reportData.top_matches,
        strengths: reportData.strengths,
        misalignment_insight: reportData.misalignment_insight,
        shadow_career: reportData.shadow_career,
        skill_bridge: reportData.skill_bridge,
        skill_gap: reportData.skill_gap,
        roadmap: reportData.roadmap,
        day_in_life: reportData.day_in_life || [],
        indian_examples: reportData.indian_examples || []
      })
      .select()
      .single();

    if (reportError) {
      console.error('[ONBOARDING] ✗ Failed to save report:', reportError.message);
      throw reportError;
    }
    console.log('[ONBOARDING] ✓ [STEP 6/6] Report saved successfully! ID:', dbReport?.id);

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✓ ONBOARDING COMPLETED SUCCESSFULLY!                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    res.json({ message: 'Success', report: dbReport });
  } catch (error) {
    console.error('[ONBOARDING] ✗ FATAL ERROR:', error.message);
    res.status(500).json({ error: 'Failed to process onboarding data', details: error.message });
  }
});

// Fetch latest career report
app.get('/api/report/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log('[/api/report] Fetching report for userId:', userId);
  try {
    const { data: report, error } = await supabase
      .from('career_reports')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[/api/report] DB error:', error);
      throw error;
    }

    if (!report) {
      console.log('[/api/report] No report found for user');
      return res.status(404).json({ error: 'No report found.' });
    }

    console.log('[/api/report] Report found, identity:', report.career_identity);
    res.json({ report });
  } catch (error) {
    console.error('[/api/report] FATAL ERROR:', error);
    res.status(500).json({ error: 'Failed to fetch report.', details: error.message });
  }
});

// Save checkin
app.post('/api/checkin', async (req, res) => {
  console.log('[/api/checkin] called');
  try {
    const { userId, answers } = req.body;
    const { error } = await supabase.from('monthly_checkins').insert({
      user_id: userId,
      checkin_month: new Date().toISOString().slice(0, 10),
      answers: answers
    });
    if (error) throw error;
    res.json({ message: 'Checkin saved' });
  } catch (error) {
    console.error('[/api/checkin] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  ✓ CareerLens Backend Started Successfully!              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`[SERVER] Running on: http://localhost:${PORT}`);
  console.log(`[SERVER] Health API: http://localhost:${PORT}/health`);
  console.log(`[SERVER] DB Test API: http://localhost:${PORT}/api/db-test`);
  console.log(`[SERVER] Onboarding API: http://localhost:${PORT}/api/onboarding`);
  console.log(`[SERVER] Report API: http://localhost:${PORT}/api/report/:userId`);
  console.log(`[SERVER] Checkin API: http://localhost:${PORT}/api/checkin`);
  console.log('');
});
