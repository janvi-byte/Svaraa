import SpeakingProfile from '../models/SpeakingProfile.js';
import Topic from '../models/Topic.js';
import SpeakingSession from '../models/SpeakingSession.js';

const WEAKNESS_CATEGORIES = {
  grammar: { categories: ['Storytelling', 'Personal', 'General'] },
  vocabulary: { categories: ['Ideas', 'Technology', 'General'] },
  fluency: { categories: ['Storytelling', 'Personal', 'Ideas'] },
  pacing: { categories: ['Ideas', 'Technology', 'General'] },
};

const DIFFICULTY_ORDER = ['Easy', 'Medium', 'Hard'];

const fallbackTopics = [
  { title: 'A perfect weekend', prompt: 'Tell us about your ideal way to spend a weekend.', difficulty: 'Easy', durationSeconds: 60, category: 'Storytelling' },
  { title: 'A bold decision', prompt: 'Share a decision that changed the way you see things.', difficulty: 'Medium', durationSeconds: 120, category: 'Personal' },
  { title: 'The future of work', prompt: 'What will work look like five years from now?', difficulty: 'Medium', durationSeconds: 120, category: 'Ideas' },
  { title: 'A skill everyone should learn', prompt: 'What is one skill you think everyone should learn and why?', difficulty: 'Easy', durationSeconds: 60, category: 'Ideas' },
  { title: 'Technology in daily life', prompt: 'How has technology changed your everyday life?', difficulty: 'Medium', durationSeconds: 120, category: 'Technology' },
  { title: 'A memorable mistake', prompt: 'Tell us about a mistake that taught you something valuable.', difficulty: 'Medium', durationSeconds: 120, category: 'Storytelling' },
  { title: 'Describe your hometown', prompt: 'Describe the place you grew up and what makes it special.', difficulty: 'Easy', durationSeconds: 60, category: 'Storytelling' },
  { title: 'A book that changed you', prompt: 'Talk about a book that influenced your thinking.', difficulty: 'Medium', durationSeconds: 120, category: 'Personal' },
  { title: 'Compare two cultures', prompt: 'Compare two cultures you have experienced. What surprised you?', difficulty: 'Hard', durationSeconds: 180, category: 'Ideas' },
  { title: 'Explain a complex topic simply', prompt: 'Pick a topic you understand well and explain it as if to a beginner.', difficulty: 'Hard', durationSeconds: 180, category: 'Ideas' },
  { title: 'A time you persuaded someone', prompt: "Describe a situation where you changed someone's mind.", difficulty: 'Medium', durationSeconds: 120, category: 'Storytelling' },
  { title: 'Your ideal workplace', prompt: 'Describe what your ideal workplace would look like and why.', difficulty: 'Easy', durationSeconds: 60, category: 'General' },
];

async function ensureTopicsExist() {
  await Topic.bulkWrite(
    fallbackTopics.map((topic) => ({
      updateOne: {
        filter: { title: topic.title },
        update: { $setOnInsert: topic },
        upsert: true,
      },
    }))
  );
}

async function getUsedTopicIds(userId) {
  const sessions = await SpeakingSession.find({ user: userId }).select('topic').lean();
  return new Set(sessions.map((s) => String(s.topic)));
}

export async function getAdaptiveTopic(userId, excludeTopicId = null) {
  await ensureTopicsExist();

  const profile = await SpeakingProfile.findOne({ user: userId });
  const allTopics = await Topic.find({ active: true }).lean();
  const usedTopicIds = await getUsedTopicIds(userId);

  let pool = allTopics.filter((t) => !usedTopicIds.has(String(t._id)));
  if (excludeTopicId) {
    pool = pool.filter((t) => String(t._id) !== String(excludeTopicId));
  }
  if (!pool.length) {
    pool = allTopics.filter((t) =>
      excludeTopicId ? String(t._id) !== String(excludeTopicId) : true
    );
  }
  if (!pool.length) {
    pool = allTopics;
  }
  if (!pool.length) {
    throw new Error('No active speaking topics are available.');
  }

  if (!profile || profile.sessionsAnalyzed < 3) {
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const targetDifficulty = profile.currentDifficulty || 'Easy';
  const weakness = profile.weakestSkill || 'fluency';
  const weaknessConfig = WEAKNESS_CATEGORIES[weakness] || WEAKNESS_CATEGORIES.fluency;

  let scored = pool.map((topic) => {
    let score = Math.random() * 10;
    if (topic.difficulty === targetDifficulty) {
      score += 30;
    } else if (
      DIFFICULTY_ORDER.indexOf(topic.difficulty) ===
      DIFFICULTY_ORDER.indexOf(targetDifficulty) + 1
    ) {
      score += 10;
    } else if (
      DIFFICULTY_ORDER.indexOf(topic.difficulty) ===
      DIFFICULTY_ORDER.indexOf(targetDifficulty) - 1
    ) {
      score += 5;
    }
    if (weaknessConfig.categories.includes(topic.category)) {
      score += 20;
    }
    if (profile.recentTopics) {
      const recentlyUsed = profile.recentTopics.some(
        (rt) => String(rt) === String(topic._id)
      );
      if (recentlyUsed) {
        score -= 25;
      }
    }
    return { topic, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const topCandidates = scored.slice(0, 3);
  return topCandidates[Math.floor(Math.random() * topCandidates.length)].topic;
}

export async function generateNextChallengeMessage(profile) {
  if (!profile || profile.sessionsAnalyzed === 0) {
    return 'Complete your first practice to get a personalized recommendation.';
  }

  const parts = [];
  if (profile.improvingSkill) {
    parts.push(`Your ${profile.improvingSkill} is improving`);
  }
  if (profile.weakestSkill) {
    if (parts.length) {
      parts.push(`, but ${profile.weakestSkill} remains your biggest weakness`);
    } else {
      parts.push(`Your ${profile.weakestSkill} is your biggest area to work on`);
    }
  }
  if (profile.decliningSkill && profile.decliningSkill !== profile.weakestSkill) {
    parts.push(`. Watch out for ${profile.decliningSkill}, which has been declining recently`);
  }

  const weakness = profile.weakestSkill || 'fluency';
  const focusMap = {
    grammar: 'structured speaking with accurate sentence forms',
    vocabulary: 'using more precise and varied words',
    fluency: 'smooth, spontaneous responses with fewer pauses',
    pacing: 'maintaining a steady, comfortable speaking pace',
  };
  const focus = focusMap[weakness] || focusMap.fluency;

  if (parts.length) {
    parts.push(`. Your next challenge focuses on ${focus}.`);
  } else {
    parts.push(`Your next challenge focuses on ${focus}.`);
  }

  return parts.join('');
}
