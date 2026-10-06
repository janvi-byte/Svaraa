const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || 'http://localhost:8001';

export async function analyzeSpeakingSession(
  session,
  preferredLanguage = 'English'
) {
  if (!session?.transcript?.trim()) {
    return {
      status: 'pending',
      message: 'No transcript is available for analysis.',
    };
  }

  try {
    const response = await fetch(`${AI_SERVICE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript: session.transcript,
        duration_seconds: session.durationSeconds || 0,
        preferred_language: preferredLanguage,
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        payload?.detail ||
          payload?.message ||
          'AI analysis failed.'
      );
    }

    return {
      status: 'complete',
      ...payload,
    };
  } catch (error) {
    console.error('AI analysis error:', error);

    return {
      status: 'pending',
      message:
        error.message ||
        'AI analysis service is unavailable.',
    };
  }
}