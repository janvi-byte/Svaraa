import Topic from '../models/Topic.js';

const fallbackTopics = [
  {
    title: 'A perfect weekend',
    prompt: 'Tell us about your ideal way to spend a weekend.',
    difficulty: 'Easy',
    durationSeconds: 60,
    category: 'Storytelling',
  },
  {
    title: 'A bold decision',
    prompt: 'Share a decision that changed the way you see things.',
    difficulty: 'Medium',
    durationSeconds: 120,
    category: 'Personal',
  },
  {
    title: 'The future of work',
    prompt: 'What will work look like five years from now?',
    difficulty: 'Medium',
    durationSeconds: 120,
    category: 'Ideas',
  },
  {
    title: 'A skill everyone should learn',
    prompt: 'What is one skill you think everyone should learn and why?',
    difficulty: 'Easy',
    durationSeconds: 60,
    category: 'Ideas',
  },
  {
    title: 'Technology in daily life',
    prompt: 'How has technology changed your everyday life?',
    difficulty: 'Medium',
    durationSeconds: 120,
    category: 'Technology',
  },
  {
    title: 'A memorable mistake',
    prompt: 'Tell us about a mistake that taught you something valuable.',
    difficulty: 'Medium',
    durationSeconds: 120,
    category: 'Storytelling',
  },
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

export async function getRandomTopic(excludeTopicId = null) {
  await ensureTopicsExist();

  const topics = await Topic.find({ active: true }).lean();

  if (!topics.length) {
    throw new Error('No active speaking topics are available.');
  }

  const availableTopics = excludeTopicId
    ? topics.filter(
        (topic) => String(topic._id) !== String(excludeTopicId)
      )
    : topics;

  const pool = availableTopics.length > 0 ? availableTopics : topics;

  return pool[Math.floor(Math.random() * pool.length)];
}