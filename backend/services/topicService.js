import Topic from '../models/Topic.js';

const fallbackTopics = [
  { title: 'A perfect weekend', prompt: 'Tell us about your ideal way to spend a weekend.', difficulty: 'Easy', durationSeconds: 60, category: 'Storytelling' },
  { title: 'A bold decision', prompt: 'Share a decision that changed the way you see things.', difficulty: 'Medium', durationSeconds: 120, category: 'Personal' },
  { title: 'The future of work', prompt: 'What will work look like five years from now?', difficulty: 'Medium', durationSeconds: 120, category: 'Ideas' },
];

export async function getRandomTopic() {
  const count = await Topic.countDocuments({ active: true });
  if (!count) {
    return fallbackTopics[Math.floor(Math.random() * fallbackTopics.length)];
  }

  const [topic] = await Topic.aggregate([
    { $match: { active: true } },
    { $sample: { size: 1 } },
  ]);
  return topic;
}
