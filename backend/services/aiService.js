const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

const SYSTEM_PROMPT = `You are an expert career identity strategist. Your goal is to analyze a user's behavioral signals, raw answers, and keyword frequencies to generate a distinct "Career Identity" and personalized 12-month roadmap.

You MUST always return ONLY a valid JSON object matching the exact schema provided. Do not include markdown formatting like \`\`\`json or any other text before or after the JSON.

Domains you know about:
Tech: SWE, ML Engineer, Data Analyst, DevOps
Finance: Investment Banking, Quant Trading, Equity Research, VC Analyst
Business: Strategy Consultant, Founder's Office, Operations
Startups: Founder, Early-stage generalist, Growth
Creative: UI/UX Designer, Content Strategist, Brand
Law/Policy: Corporate Law, Public Policy, Compliance
Product: Product Manager, Product Analyst

Required JSON Schema:
{
  "career_identity": "String (e.g. 'Strategic Technologist')",
  "career_identity_description": "String (2-3 lines about who this person is naturally)",
  "top_matches": [
    {
      "title": "String (e.g. 'Product Manager')",
      "percentage": "Number (0-100)",
      "explanation": "String (1 line explanation based on their signals)"
    }
  ],
  "strengths": ["String", "String", "String"],
  "misalignment_insight": "String (Insight on education vs behavior gap)",
  "shadow_career": "String (What they'd likely be doing if they followed signals from the start)",
  "skill_bridge": "String (What they already have that transfers)",
  "skill_gap": "String (What's missing for their top match)",
  "roadmap": [
    {
      "month_range": "String (e.g. 'Months 1-2')",
      "title": "String (e.g. 'Foundational Knowledge')",
      "action_items": ["String", "String"]
    }
  ],
  "day_in_life": ["String", "String", "String", "String", "String"],
  "indian_examples": ["String (Name - Role)", "String (Name - Role)"]
}

IMPORTANT: top_matches must have exactly 4 items. strengths must have exactly 3 items. roadmap must have 4-6 items spanning 12 months. day_in_life must have 5-6 items. indian_examples must have 2-3 real Indian professionals.`;

const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
  'gemma2-9b-it'
];

const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite'];

function generateMockReport(answers) {
  const name = answers.name || 'User';
  const education = answers.education || 'General Studies';

  console.log('[AI] Using MOCK report (all AI providers failed)');

  return {
    career_identity: "The Strategic Builder",
    career_identity_description: `${name} is a natural systems thinker who bridges the gap between technical execution and strategic vision. Their curiosity spans product design, technology, and business — they don't just want to build things, they want to build the right things.`,
    top_matches: [
      { title: "Product Manager", percentage: 92, explanation: "Strong signals in product thinking, user empathy, and cross-functional communication." },
      { title: "Startup Founder", percentage: 85, explanation: "High risk tolerance combined with builder mentality and frustration with status quo." },
      { title: "Strategy Consultant", percentage: 78, explanation: "Analytical thinking and ability to break down complex problems into actionable frameworks." },
      { title: "UX Engineer", percentage: 72, explanation: "Intersection of technical skills with deep care for user experience and design details." }
    ],
    strengths: [
      "Translating technical complexity into simple, actionable narratives",
      "Systems thinking — seeing how individual pieces connect to the bigger picture",
      "Self-driven learning with a bias toward building and shipping"
    ],
    misalignment_insight: `${name} studied ${education}, but their behavioral signals point heavily toward product strategy and entrepreneurship. The gap isn't about knowledge — it's about self-permission to pursue what naturally excites them.`,
    shadow_career: "If they had followed their natural signals from the start, they'd likely be running a small product studio or working as a founding PM at an early-stage startup.",
    skill_bridge: "Technical foundation, analytical rigor, and communication skills transfer directly into product management and startup leadership.",
    skill_gap: "Formal product management frameworks (PRDs, roadmap prioritization), stakeholder management at scale, and go-to-market strategy experience.",
    roadmap: [
      {
        month_range: "Months 1-2",
        title: "Foundation & Frameworks",
        action_items: [
          "Complete a PM certification course (e.g., Product School or Reforge)",
          "Read 'Inspired' by Marty Cagan and 'The Mom Test' by Rob Fitzpatrick",
          "Start writing product teardowns on LinkedIn or a personal blog"
        ]
      },
      {
        month_range: "Months 3-4",
        title: "Build & Ship",
        action_items: [
          "Launch a side project solving a real problem you've identified",
          "Practice writing PRDs and user stories for existing products",
          "Join product communities (Mind the Product, Lenny's Newsletter Slack)"
        ]
      },
      {
        month_range: "Months 5-8",
        title: "Get Real Experience",
        action_items: [
          "Contribute to open-source projects in a PM/design capacity",
          "Take on a freelance product consulting gig or volunteer for a startup",
          "Build a portfolio of 3-4 product case studies with measurable outcomes"
        ]
      },
      {
        month_range: "Months 9-12",
        title: "Land & Launch",
        action_items: [
          "Apply to PM roles at startups (Series A-B) where you can have outsized impact",
          "Leverage your network for warm introductions to hiring managers",
          "Prepare for PM interviews: practice estimation, prioritization, and behavioral questions"
        ]
      }
    ],
    day_in_life: [
      "9:00 AM — Morning standup with engineering team, reviewing sprint progress",
      "10:30 AM — Deep work session: analyzing user feedback data and updating the product roadmap",
      "1:00 PM — Stakeholder meeting to align marketing and sales on upcoming feature launch",
      "3:00 PM — User research call with 2 customers to validate a new feature hypothesis",
      "5:00 PM — Writing a product spec for next quarter's key initiative"
    ],
    indian_examples: [
      "Kunal Shah - Founder of CRED, transitioned from philosophy to fintech product",
      "Nikhil Kamath - Co-founder of Zerodha, built India's largest trading platform",
      "Ankiti Bose - Former CEO of Zilingo, started in data analytics before moving to product leadership"
    ]
  };
}

function parseJsonResponse(text) {
  let cleanJsonText = text.trim();
  if (cleanJsonText.startsWith('```')) {
    cleanJsonText = cleanJsonText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  }
  return JSON.parse(cleanJsonText);
}

async function tryGroq(groqApiKey, prompt) {
  const groqClient = new OpenAI({
    apiKey: groqApiKey.trim(),
    baseURL: 'https://api.groq.com/openai/v1'
  });

  for (const modelName of GROQ_MODELS) {
    try {
      console.log(`[Groq] Trying model: ${modelName}...`);
      
      const completion = await groqClient.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      });

      const reportText = completion.choices[0]?.message?.content;
      if (!reportText) {
        console.log(`[Groq] ${modelName} returned empty response`);
        continue;
      }

      console.log('[Groq] Response received, length:', reportText.length);
      const parsed = parseJsonResponse(reportText);
      console.log('[Groq] SUCCESS! Career identity:', parsed.career_identity);
      return parsed;
    } catch (error) {
      console.error(`[Groq] ${modelName} failed:`, error.message?.slice(0, 150));
      
      if (error.message?.includes('429') || error.message?.includes('rate_limit') || error.message?.includes('quota')) {
        console.log(`[Groq] Rate limited on ${modelName}, trying next model...`);
        continue;
      }
      if (error instanceof SyntaxError) {
        console.error(`[Groq] Bad JSON from ${modelName}, trying next model...`);
        continue;
      }
      continue;
    }
  }
  return null;
}

async function tryGemini(apiKey, prompt) {
  if (!apiKey || apiKey === 'your_gemini_api_key_here' || !apiKey.startsWith('AIza')) {
    console.log('[Gemini] No valid API key configured');
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`[Gemini] Trying model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const reportText = response.text().trim();

      if (!reportText) {
        console.log(`[Gemini] ${modelName} returned empty response`);
        continue;
      }

      console.log('[Gemini] Response received, length:', reportText.length);
      const parsed = parseJsonResponse(reportText);
      console.log('[Gemini] SUCCESS! Career identity:', parsed.career_identity);
      return parsed;
    } catch (error) {
      console.error(`[Gemini] ${modelName} failed:`, error.message?.slice(0, 150));

      if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        console.log(`[Gemini] Rate limited on ${modelName}, trying next model...`);
        continue;
      }
      if (error instanceof SyntaxError) {
        console.error(`[Gemini] Bad JSON from ${modelName}, trying next model...`);
        continue;
      }
      continue;
    }
  }
  return null;
}

async function generateCareerReport(answers, signals) {
  console.log('\n[AI] ════════════════════════════════════════════════════════════');
  console.log('[AI]           AI REPORT GENERATION STARTED                    ');
  console.log('[AI] ════════════════════════════════════════════════════════════');

  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  console.log('[AI] 📡 Groq API Key:', groqApiKey && groqApiKey.startsWith('gsk_') ? '✓ Configured' : '✗ Missing/Invalid');
  console.log('[AI] 📡 Gemini API Key:', geminiApiKey && geminiApiKey.startsWith('AIza') ? '✓ Configured' : '✗ Missing/Invalid');

  const userPrompt = `Now analyze the following user data to generate their career report:

Raw Answers:
${JSON.stringify(answers, null, 2)}

Extracted Behavioral Signals (Keyword Frequencies):
${JSON.stringify(signals, null, 2)}

Return ONLY valid JSON matching the schema above. No markdown, no extra text, no backticks.`;

  let result = null;

  if (groqApiKey && groqApiKey !== 'your_groq_api_key_here' && groqApiKey.startsWith('gsk_')) {
    console.log('[AI] 🔄 Trying Groq API (primary)...');
    result = await tryGroq(groqApiKey, userPrompt);
  } else {
    console.log('[AI] ⏭️  Skipping Groq (no valid API key)');
  }

  if (!result && geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here' && geminiApiKey.startsWith('AIza')) {
    console.log('[AI] 🔄 Groq failed/unavailable, trying Gemini (fallback)...');
    result = await tryGemini(geminiApiKey, userPrompt);
  }

  if (!result) {
    console.log('[AI] ⚠️  All AI providers failed. Using mock report.');
    return generateMockReport(answers);
  }

  console.log('[AI] ✓ AI Report generated successfully!');
  return result;
}

  if (!result && geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here' && geminiApiKey.startsWith('AIza')) {
    console.log('[AI] Groq failed or not available, trying Gemini as fallback...');
    result = await tryGemini(geminiApiKey, userPrompt);
  }

  if (!result) {
    console.log('[AI] All AI providers failed. Using mock report.');
    return generateMockReport(answers);
  }

  return result;
}

module.exports = { generateCareerReport };
