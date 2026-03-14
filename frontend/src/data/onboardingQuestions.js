export const onboardingQuestions = [
  // Block 1 - Basic Context
  { id: 'name', block: 1, type: 'text', text: 'What’s your name?', placeholder: 'Type your name here...' },
  { id: 'age', block: 1, type: 'number', text: 'How old are you?', placeholder: 'e.g. 21' },
  { id: 'status', block: 1, type: 'select', text: 'What are you currently doing?', options: ['School', 'College', 'Working', 'Between things'] },
  { id: 'education', block: 1, type: 'text', text: 'What did you study or are currently studying?', placeholder: 'e.g. Computer Science, Economics...' },
  
  // Block 2 - Entertainment Fingerprint
  { id: 'movies_shows', block: 2, type: 'textarea', text: 'What are your top 3 favorite shows or movies?', placeholder: 'List 3 shows/movies...' },
  { id: 'youtube', block: 2, type: 'textarea', text: 'Which YouTube channels do you actually watch regularly?', placeholder: 'e.g. MKBHD, Ali Abdaal, historical documentaries...' },
  { id: 'podcasts', block: 2, type: 'textarea', text: 'Do you listen to any podcasts? If yes, which ones?', placeholder: 'You can skip if none', skippable: true },
  { id: 'documentary_book', block: 2, type: 'textarea', text: 'Name a documentary or book that genuinely impressed you.', placeholder: 'You can skip if none', skippable: true },

  // Block 3 - Curiosity Mapping
  { id: '11pm_google', block: 3, type: 'textarea', text: 'What do you randomly Google at 11pm when nobody’s watching?', placeholder: 'e.g. How do black holes work?' },
  { id: 'read_for_hours', block: 3, type: 'textarea', text: 'What topics could you read about for hours without getting bored?', placeholder: 'e.g. Psychology, startups, space...' },
  { id: 'social_content', block: 3, type: 'textarea', text: 'What kind of content do you follow on Instagram/Twitter?', placeholder: 'e.g. Design inspiration, tech news...' },

  // Block 4 - Free Time Behavior
  { id: 'last_weekend', block: 4, type: 'textarea', text: 'Last weekend when you had nothing planned, what did you actually end up doing?', placeholder: 'e.g. Went down a Wikipedia rabbit hole...' },
  { id: 'decompress', block: 4, type: 'textarea', text: 'When you’re stressed, what do you do to decompress?', placeholder: 'e.g. Play video games, go for a run...' },

  // Block 5 - Admiration Mapping
  { id: 'admire', block: 5, type: 'textarea', text: 'Who do you genuinely admire — can be anyone, any field?', placeholder: 'e.g. Naval Ravikant, Steve Jobs...' },
  { id: 'swap_lives', block: 5, type: 'textarea', text: 'If you could swap lives with anyone for one year, who would it be and why?', placeholder: 'Name someone and the reason...' },
  { id: 'jealous_career', block: 5, type: 'textarea', text: 'Whose career makes you think "I wish I was doing something like that"?', placeholder: 'Can be an influencer, a friend, CEO...' },

  // Block 6 - Frustration Signals
  { id: 'frustration', block: 6, type: 'textarea', text: 'What problem in the world genuinely bothers or frustrates you?', placeholder: 'e.g. Financial illiteracy in schools...' },
  { id: 'wish_existed', block: 6, type: 'textarea', text: 'What do you wish existed but doesn’t?', placeholder: 'e.g. An app that does X...' },

  // Block 7 - Peak Experience
  { id: 'lost_time', block: 7, type: 'textarea', text: 'Tell me about a time you completely lost track of time doing something — what were you doing?', placeholder: 'e.g. Editing a short video, coding a side project...' },
  { id: 'surprisingly_good', block: 7, type: 'textarea', text: 'What have you done in your life that other people said you were surprisingly good at?', placeholder: 'e.g. Explaining difficult concepts...' },

  // Block 8 - Skill Self-Rating
  { id: 'skill_rating', block: 8, type: 'rating_grid', text: 'Rate yourself 1–10 on each of these skills:', 
    skills: [
      { id: 'Communication', label: 'Communication' },
      { id: 'Coding', label: 'Coding / Technical ability' },
      { id: 'Analytical', label: 'Analytical thinking' },
      { id: 'Leadership', label: 'Leadership' },
      { id: 'Creativity', label: 'Creativity' },
      { id: 'Negotiation', label: 'Negotiation / Persuasion' },
      { id: 'AttentionToDetail', label: 'Attention to detail' },
      { id: 'RiskTolerance', label: 'Risk tolerance' }
    ] 
  }
];
