const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

console.log('[BOOT] Supabase URL:', supabaseUrl ? supabaseUrl.slice(0, 30) + '...' : 'MISSING');
console.log('[BOOT] Supabase Key Type:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE (secure)' : 'ANON (RLS applies)');

const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CareerLens API is running', port: PORT });
});

// Diagnostic: test DB connection
app.get('/api/db-test', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    res.json({ status: 'DB connected', data });
  } catch (err) {
    console.error('[DB-TEST] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Save onboarding responses and generate report
app.post('/api/onboarding', async (req, res) => {
  console.log('\n==== /api/onboarding called ====');
  try {
    const { userId, email, answers } = req.body;

    console.log('[STEP 0] userId:', userId);
    console.log('[STEP 0] email:', email);
    console.log('[STEP 0] answers keys:', Object.keys(answers || {}));

    if (!userId || !answers) {
      console.error('[STEP 0] MISSING userId or answers');
      return res.status(400).json({ error: 'Missing userId or answers payload' });
    }

    // Step 1: Upsert user record to avoid FK constraint
    console.log('[STEP 1] Upserting user to public.users...');
    const { error: userError } = await supabase
      .from('users')
      .upsert({ id: userId, email: email || '' }, { onConflict: 'id' });

    if (userError) {
      console.error('[STEP 1] User upsert error:', userError);
      // Don't throw — continue, user might already exist
    } else {
      console.log('[STEP 1] User upserted OK');
    }

    // Step 2: Flatten answers — handle rating_grid keys
    // Onboarding sends keys like "skill_rating_Communication", we clean them to just "Communication"
    const cleanedAnswers = {};
    for (const [key, value] of Object.entries(answers)) {
      const cleanKey = key.startsWith('skill_rating_') ? key.replace('skill_rating_', '') : key;
      cleanedAnswers[cleanKey] = value?.toString() || '';
    }
    console.log('[STEP 2] Cleaned answer keys:', Object.keys(cleanedAnswers));

    // Step 3: Insert answers into onboarding_answers table
    const insertData = Object.entries(cleanedAnswers).map(([key, value]) => ({
      user_id: userId,
      question_key: key,
      answer_text: value
    }));

    console.log('[STEP 3] Inserting', insertData.length, 'answers...');
    const { error: insertError } = await supabase
      .from('onboarding_answers')
      .insert(insertData);

    if (insertError) {
      console.error('[STEP 3] Insert answers error:', insertError);
      throw insertError;
    }
    console.log('[STEP 3] Answers saved OK');

    // Step 4: Extract signals from answers
    console.log('[STEP 4] Extracting signals...');
    const { extractSignals } = require('./utils/signalExtractor');
    const signals = extractSignals(cleanedAnswers);
    console.log('[STEP 4] Signals:', JSON.stringify(signals));

    // Step 5: Generate AI report
    console.log('[STEP 5] Calling OpenAI to generate report...');
    const { generateCareerReport } = require('./services/aiService');
    const reportData = await generateCareerReport(cleanedAnswers, signals);
    console.log('[STEP 5] AI report generated. Career identity:', reportData?.career_identity);

    // Step 6: Save report to DB
    console.log('[STEP 6] Saving report to career_reports...');
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
      console.error('[STEP 6] Report save error:', reportError);
      throw reportError;
    }
    console.log('[STEP 6] Report saved OK, id:', dbReport?.id);

    res.json({ message: 'Success', report: dbReport });
  } catch (error) {
    console.error('[/api/onboarding] FATAL ERROR:', error);
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
  console.log(`\n[BOOT] CareerLens backend running on http://localhost:${PORT}`);
  console.log('[BOOT] Health check: http://localhost:' + PORT + '/health');
  console.log('[BOOT] DB test: http://localhost:' + PORT + '/api/db-test\n');
});
