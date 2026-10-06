import Lesson from '../models/Lesson.js';
import SpeakingProfile from '../models/SpeakingProfile.js';

const LESSON_LIBRARY = {
  grammar: [
    {
      title: 'Subject-verb agreement',
      description: 'Make sure your verbs match your subjects in number and person.',
      content: {
        explanation:
          'In English, the verb must agree with the subject. Use "he/she goes" (not "he/she go"), "they are" (not "they is"), and "I have" (not "I has").',
        examples: [
          'She goes to work every day.',
          'They are working on the project.',
          'I have two ideas to share.',
        ],
        exercisePrompt:
          'Talk about a typical day in your life. Focus on using correct subject-verb agreement for he, she, they, and I.',
      },
    },
    {
      title: 'Articles: a, an, the',
      description: 'Use articles correctly to make your meaning clear.',
      content: {
        explanation:
          'Use "a" before consonant sounds, "an" before vowel sounds, and "the" for specific things both speaker and listener know about.',
        examples: [
          'I saw a movie yesterday.',
          'She is an engineer.',
          'The book you recommended was excellent.',
        ],
        exercisePrompt:
          'Describe an object in your room and explain why it is important to you. Pay attention to articles.',
      },
    },
    {
      title: 'Verb tense consistency',
      description: 'Keep your tenses consistent within a sentence or story.',
      content: {
        explanation:
          'When telling a story about the past, keep your verbs in the past tense unless you are making a general statement. Mixing tenses can confuse your listener.',
        examples: [
          'Yesterday I went to the park and met a friend.',
          'I was working when she called me.',
          'I have always enjoyed reading.',
        ],
        exercisePrompt:
          'Tell a short story about something that happened last week. Keep your verb tenses consistent.',
      },
    },
  ],
  fluency: [
    {
      title: 'Speaking in complete sentences',
      description: 'Avoid very short fragments and aim for complete ideas.',
      content: {
        explanation:
          'Fluency improves when you express ideas in complete sentences rather than short fragments. Practice connecting your thoughts with words like "because", "so", and "which means".',
        examples: [
          'I enjoy cooking because it helps me relax after work.',
          'The project was challenging, so I learned a lot from it.',
          'I moved to this city three years ago, which was a big change for me.',
        ],
        exercisePrompt:
          'Talk about a hobby you enjoy. Explain why you like it and how you got started, using complete sentences throughout.',
      },
    },
    {
      title: 'Smooth transitions',
      description: 'Connect your ideas so listeners can follow easily.',
      content: {
        explanation:
          'Transition words help your speech flow naturally. Use "first", "next", "for example", "on the other hand", and "in conclusion" to guide your listener.',
        examples: [
          'First, I want to talk about the problem. Then I will share my solution.',
          'For example, last month I faced a similar situation.',
          'On the other hand, there are some risks to consider.',
        ],
        exercisePrompt:
          'Explain a process you know well (like cooking a dish or planning a trip). Use transition words to connect each step.',
      },
    },
  ],
  vocabulary: [
    {
      title: 'Upgrading basic words',
      description: 'Replace common words with more precise alternatives.',
      content: {
        explanation:
          'Words like "good", "nice", "thing", and "big" are vague. More specific words make your speech clearer and more professional. For example, "effective" instead of "good", "significant" instead of "big".',
        examples: [
          'The new policy was effective in reducing costs.',
          'There was a significant improvement in our results.',
          'She gave an impressive presentation.',
        ],
        exercisePrompt:
          'Describe a recent achievement without using the words "good", "nice", "thing", or "big". Use more specific vocabulary instead.',
      },
    },
    {
      title: 'Vocabulary variety',
      description: 'Avoid repeating the same words in your response.',
      content: {
        explanation:
          'Using different words for the same idea shows language range. Instead of repeating "important" three times, try "crucial", "essential", and "key".',
        examples: [
          'Time management is crucial for productivity.',
          'Communication is essential in any team.',
          'One key factor is having clear goals.',
        ],
        exercisePrompt:
          'Talk about what makes a good leader. Use at least three different words that mean "important" without repeating any of them.',
      },
    },
  ],
  pacing: [
    {
      title: 'Steady speaking pace',
      description: 'Keep your words per minute in a comfortable range.',
      content: {
        explanation:
          'A comfortable speaking pace is between 110 and 160 words per minute. If you speak too fast, listeners cannot follow. If too slow, they may lose interest. Practice at a steady, natural rhythm.',
        examples: [
          'Take a breath between sentences to maintain pace.',
          'Pause briefly after important points to let ideas sink in.',
          'Aim for a rhythm that feels like a natural conversation.',
        ],
        exercisePrompt:
          'Talk about your favorite season for 60 seconds. Focus on keeping a steady, comfortable pace — not too fast and not too slow.',
      },
    },
  ],
  filler: [
    {
      title: 'Reducing filler words',
      description: 'Minimize um, uh, like, and you know.',
      content: {
        explanation:
          'Filler words like "um", "uh", "like", and "you know" can make your speech sound less confident. Practice pausing silently instead of filling the gap with a word.',
        examples: [
          'Instead of "um, I think that..." say "I think that..." with a brief pause.',
          'Replace "like, it was really good" with "it was genuinely impressive".',
          'A short silence is more powerful than a filler word.',
        ],
        exercisePrompt:
          'Talk about your weekend plans for 60 seconds. Focus on replacing every filler word with a brief pause.',
      },
    },
  ],
  repetition: [
    {
      title: 'Varied phrasing',
      description: 'Avoid repeating the same words or phrases.',
      content: {
        explanation:
          'Repeating the same phrase multiple times makes speech sound less polished. Practice using different words and sentence structures to express similar ideas.',
        examples: [
          'Instead of "I think... I think..." try "I believe... In my view...".',
          'Vary sentence openings: "Another point is...", "Additionally...", "What is more...".',
          'Use pronouns to avoid repeating nouns.',
        ],
        exercisePrompt:
          'Discuss the benefits of learning a new language. Use a different opening phrase for each point you make.',
      },
    },
  ],
};

export async function getRecommendedLessons(userId) {
  const profile = await SpeakingProfile.findOne({ user: userId });

  if (!profile || profile.sessionsAnalyzed === 0) {
    return [];
  }

  const weakness = profile.weakestSkill || 'fluency';
  const lessons = LESSON_LIBRARY[weakness] || LESSON_LIBRARY.fluency;

  const existing = await Lesson.find({
    user: userId,
    skill: weakness,
    status: { $in: ['assigned', 'in-progress'] },
  }).lean();

  const existingTitles = new Set(existing.map((l) => l.title));

  const toCreate = lessons.filter((l) => !existingTitles.has(l.title));

  if (toCreate.length > 0) {
    await Lesson.insertMany(
      toCreate.map((l) => ({
        user: userId,
        skill: weakness,
        title: l.title,
        description: l.description,
        content: l.content,
        status: 'assigned',
      }))
    );
  }

  return Lesson.find({
    user: userId,
    status: { $in: ['assigned', 'in-progress'] },
  })
    .sort({ createdAt: 1 })
    .lean();
}

export async function markLessonCompleted(userId, lessonId, scoreAfter) {
  return Lesson.findOneAndUpdate(
    { _id: lessonId, user: userId },
    { $set: { status: 'completed', scoreAfter } },
    { new: true }
  );
}
