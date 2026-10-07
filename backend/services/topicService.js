import Topic from '../models/Topic.js';
import topics from '../data/topics.js';

async function ensureTopicsExist() {
  await Topic.bulkWrite(
    topics.map((topic) => ({
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