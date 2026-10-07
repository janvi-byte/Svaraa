import VocabularyProfile from '../models/VocabularyProfile.js';

const STOP_WORDS = new Set([
  'the','a','an','is','are','was','were','be','been','being',
  'have','has','had','do','does','did','will','would','could',
  'should','may','might','must','can','to','of','in','on','at',
  'by','for','with','about','as','into','through','during',
  'before','after','above','below','from','up','down','out',
  'off','over','under','again','further','then','once','here',
  'there','when','where','why','how','all','each','every',
  'both','few','more','most','other','some','such','no','not',
  'only','own','same','so','than','too','very','just','also',
  'and','but','or','if','because','until','while','this',
  'that','these','those','i','me','my','we','us','our','you',
  'your','he','him','his','she','her','it','its','they',
  'them','their','what','which','who','whom','whose',
  'got','get','getting','go','going','went','come','came',
  'see','saw','seen','say','said','saying','tell','told',
  'telling','know','knew','known','think','thought','thinking',
  'feel','felt','feeling','want','wanted','wanting','like',
  'liked','liking','one','two','three',
]);

const OVERUSED_THRESHOLD = 5;
const COMMON_OVERUSED = ['good','nice','thing','very','big','bad','happy','sad','a lot','make','help'];

function extractContentWords(transcript) {
  if (typeof transcript !== 'string' || !transcript.trim()) return [];

  const wordMatches = transcript
    .toLowerCase()
    .match(/\b[a-zA-Z]+(?:'[a-zA-Z]+)?\b/g) || [];

  return wordMatches.filter((word) => !STOP_WORDS.has(word));
}

function emptyVocabularySummary() {
  return {
    contentWords: [],
    uniqueWords: [],
    newWords: [],
    previouslyUsedWords: [],
    repeatedWords: [],
    contentWordCount: 0,
    contentVocabularyDiversity: 0,
  };
}

export async function getVocabularySummary(userId, transcript) {
  const contentWords = extractContentWords(transcript);
  if (!contentWords.length) return emptyVocabularySummary();

  const profile = await VocabularyProfile.findOne({ user: userId }).lean();
  const existingWords = new Set(
    (profile?.words || [])
      .map((entry) => entry.word)
      .filter((word) => typeof word === 'string' && word.trim())
  );
  const counts = new Map();

  for (const word of contentWords) {
    counts.set(word, (counts.get(word) || 0) + 1);
  }

  const uniqueWords = [...counts.keys()];
  return {
    contentWords,
    uniqueWords,
    newWords: uniqueWords.filter((word) => !existingWords.has(word)),
    previouslyUsedWords: uniqueWords.filter((word) => existingWords.has(word)),
    repeatedWords: uniqueWords
      .filter((word) => counts.get(word) > 1)
      .map((word) => ({ word, count: counts.get(word) })),
    contentWordCount: contentWords.length,
    contentVocabularyDiversity: Math.round(
      (uniqueWords.length / contentWords.length) * 100
    ),
  };
}

export async function updateVocabularyProfileForSession(
  userId,
  sessionId,
  transcript
) {
  const summary = await getVocabularySummary(userId, transcript);
  if (!summary.contentWordCount || !sessionId) {
    return { profile: null, summary, updated: false };
  }

  const profile = await VocabularyProfile.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId } },
    { new: true, upsert: true }
  );
  const claim = await VocabularyProfile.updateOne(
    {
      _id: profile._id,
      processedSessionIds: { $ne: sessionId },
    },
    { $addToSet: { processedSessionIds: sessionId } }
  );

  if (claim.modifiedCount !== 1) {
    return {
      profile: await VocabularyProfile.findById(profile._id),
      summary,
      updated: false,
    };
  }

  const currentProfile = await VocabularyProfile.findById(profile._id);
  if (!currentProfile) {
    return { profile: null, summary, updated: false };
  }

  const wordCounts = new Map();
  for (const word of summary.contentWords) {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  }

  const existingMap = new Map(
    (currentProfile.words || []).map((entry) => [entry.word, entry])
  );
  for (const [word, count] of wordCounts) {
    const existing = existingMap.get(word);
    if (existing) {
      existing.count += count;
      existing.lastUsedAt = new Date();
    } else {
      currentProfile.words.push({ word, count, lastUsedAt: new Date() });
    }
  }

  currentProfile.totalWordsUsed += summary.contentWordCount;
  currentProfile.markModified('words');
  await currentProfile.save();
  return { profile: currentProfile, summary, updated: true };
}

export async function updateVocabularyProfile(userId, transcript) {
  const contentWords = extractContentWords(transcript);
  if (!contentWords.length) {
    return VocabularyProfile.findOneAndUpdate(
      { user: userId },
      { $setOnInsert: { user: userId } },
      { new: true, upsert: true }
    );
  }

  const profile = await VocabularyProfile.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId } },
    { new: true, upsert: true }
  );
  const wordCounts = new Map();
  for (const word of contentWords) {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  }

  const existingMap = new Map((profile.words || []).map((entry) => [entry.word, entry]));
  for (const [word, count] of wordCounts) {
    const existing = existingMap.get(word);
    if (existing) {
      existing.count += count;
      existing.lastUsedAt = new Date();
    } else {
      profile.words.push({ word, count, lastUsedAt: new Date() });
    }
  }

  profile.totalWordsUsed += contentWords.length;
  profile.markModified('words');
  await profile.save();
  return profile;
}

export function getOverusedWords(profile) {
  if (!profile || !profile.words) return [];
  return profile.words
    .filter(
      (entry) =>
        entry.count >= OVERUSED_THRESHOLD || COMMON_OVERUSED.includes(entry.word)
    )
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((entry) => ({ word: entry.word, count: entry.count }));
}
