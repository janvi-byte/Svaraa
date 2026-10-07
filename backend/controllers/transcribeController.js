import multer from 'multer';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 26_214_400 },
});

export const transcribeUpload = upload.single('audio');

export async function transcribeAudio(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file was uploaded.' });
    }

    if (req.file.size === 0) {
      return res.status(400).json({ message: 'The uploaded audio file is empty.' });
    }

    const durationSeconds = parseFloat(req.body?.durationSeconds) || 0;
    const formData = new FormData();
    const extension = (req.file.originalname || '').split('.').pop() || 'webm';
    const filename = req.file.originalname || `recording.${extension}`;
    formData.append('audio', new Blob([req.file.buffer], { type: req.file.mimetype }), filename);
    formData.append('duration_seconds', String(durationSeconds));

    let aiResponse;
    try {
      aiResponse = await fetch(`${AI_SERVICE_URL}/transcribe`, {
        method: 'POST',
        body: formData,
      });
    } catch {
      return res.status(503).json({ message: 'The AI transcription service is unavailable. Please ensure it is running and try again.' });
    }

    const payload = await aiResponse.json().catch(() => ({}));

    if (!aiResponse.ok) {
      const message = payload?.detail || payload?.message || 'Transcription failed.';
      return res.status(aiResponse.status).json({ message });
    }

    const response = {
      transcript: payload.transcript || '',
      language: payload.language || 'en',
      duration_seconds: payload.duration_seconds || durationSeconds,
    };

    if (Array.isArray(payload.segments)) {
      response.segments = payload.segments;
    }

    return res.json(response);
  } catch (error) {
    return next(error);
  }
}
