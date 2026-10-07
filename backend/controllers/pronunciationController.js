import pronunciationReferences from '../data/pronunciationReferences.js';
import multer from 'multer';

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || 'http://localhost:8001';
const ALIGNMENT_SERVICE_URL =
  process.env.ALIGNMENT_SERVICE_URL || 'http://localhost:8002';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 26_214_400 },
});

export const referenceAlignmentUpload = upload.single('audio');

export function getPronunciationReferences(req, res) {
  return res.json({
    references: pronunciationReferences,
  });
}

export async function checkPronunciation(req, res, next) {
  try {
    const { transcript } = req.body;

    if (!transcript?.trim()) {
      return res.status(400).json({
        message: 'Transcript is required for pronunciation check.',
      });
    }

    const response = await fetch(`${AI_SERVICE_URL}/pronunciation-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: transcript.trim(),
        duration_seconds: 0,
        preferred_language: 'English',
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload?.detail || 'Pronunciation check failed.');
    }

    return res.json(payload);
  } catch (error) {
    console.error('Pronunciation check error:', error.message);
    return res.status(500).json({
      message: error.message || 'Failed to check pronunciation.',
    });
  }
}

export async function alignReferenceAudio(req, res, next) {
  try {
  const { referenceId } = req.body;
  const reference = pronunciationReferences.find(
    (item) => item.id === referenceId
  );

  if (!reference) {
    return res.status(400).json({
      message: 'A valid reference sentence is required.',
    });
  }

  if (!req.file) {
    return res.status(400).json({
      message: 'No audio file was uploaded.',
    });
  }

  if (req.file.size === 0) {
    return res.status(400).json({
      message: 'The uploaded audio file is empty.',
    });
  }

  const formData = new FormData();
  const extension =
    (req.file.originalname || '').split('.').pop() || 'webm';
  const filename = req.file.originalname || `recording.${extension}`;
  formData.append(
    'audio',
    new Blob([req.file.buffer], { type: req.file.mimetype }),
    filename
  );
  formData.append('reference_text', reference.text);
  formData.append(
    'duration_seconds',
    String(parseFloat(req.body?.durationSeconds) || 0)
  );

  let response;
  try {
    response = await fetch(`${ALIGNMENT_SERVICE_URL}/align`, {
      method: 'POST',
      body: formData,
    });
  } catch {
    return res.status(503).json({
      message:
        'The reference alignment service is unavailable. Please ensure it is running and try again.',
    });
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return res.status(response.status).json({
      message:
        payload?.detail ||
        payload?.message ||
        'Reference alignment failed.',
    });
  }

  return res.json({
    reference: {
      id: reference.id,
      text: reference.text,
    },
    transcript: payload.transcript || '',
    ...(Array.isArray(payload.words) ? { words: payload.words } : {}),
    ...(payload.comparison ? { comparison: payload.comparison } : {}),
  });
  } catch (error) {
  return next(error);
  }
}
