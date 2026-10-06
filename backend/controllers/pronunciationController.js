const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || 'http://localhost:8001';

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
