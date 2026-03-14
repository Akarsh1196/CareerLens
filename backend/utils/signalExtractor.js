// Simple Keyword Matching Signal Extractor

const SIGNAL_CATEGORIES = {
  Finance: ['stock market', 'trading', 'money', 'investing', 'hedge fund', 'zerodha', 'markets', 'buffett', 'nikhil kamath', 'crypto', 'bitcoin', 'finance', 'economics'],
  Startup: ['founder', 'startup', 'build', 'product', 'pitch', 'funding', 'shark tank', 'y combinator', 'yc', 'saas', 'bootstrapped', 'mvp'],
  Tech: ['coding', 'programming', 'ai', 'machine learning', 'software', 'github', 'build apps', 'developer', 'python', 'javascript', 'react', 'code'],
  Strategy: ['suits', 'consulting', 'mckinsey', 'bcg', 'business strategy', 'negotiation', 'billions', 'bain', 'strategy', 'management', 'mba'],
  Creative: ['design', 'content', 'aesthetic', 'writing', 'video', 'photography', 'brand', 'ui/ux', 'art', 'creator', 'youtube', 'vlog'],
  People: ['leadership', 'team', 'communication', 'hr', 'culture', 'networking', 'psychology', 'sociology', 'teaching', 'coach'],
  Law: ['law', 'justice', 'policy', 'debate', 'rights', 'court', 'ias', 'upsc', 'legal', 'lawyer', 'political']
};

/**
 * Extracts signals from raw text onboarding answers.
 * Returns an object with the score (frequency) of each domain category.
 * 
 * @param {Object} onboardingAnswers - The key-value pair of question IDs to raw text answers.
 * @returns {Object} { Finance: 2, Tech: 5, ... } 
 */
function extractSignals(onboardingAnswers) {
  const signalScores = {
    Finance: 0,
    Startup: 0,
    Tech: 0,
    Strategy: 0,
    Creative: 0,
    People: 0,
    Law: 0
  };

  // Convert all answers to a single massive string for easy regex matching
  const corpus = Object.values(onboardingAnswers)
    .filter(val => typeof val === 'string')
    .map(val => val.toLowerCase())
    .join(' ');

  for (const [category, keywords] of Object.entries(SIGNAL_CATEGORIES)) {
    for (const keyword of keywords) {
      // Basic regex to find whole words or phrases, ignoring case
      // e.g. /\b(shark tank)\b/gi
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = corpus.match(regex);
      
      if (matches) {
        signalScores[category] += matches.length;
      }
    }
  }

  // Calculate percentages or keep raw counts? Raw counts are fine to pass to AI.
  return signalScores;
}

module.exports = { extractSignals, SIGNAL_CATEGORIES };
