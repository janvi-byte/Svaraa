import re
from collections import Counter


def analyze_text(transcript: str, duration_seconds: float):
    words = re.findall(r"[A-Za-z']+", transcript.lower())
    word_count = len(words)

    # Speaking speed
    minutes = max(duration_seconds / 60, 1 / 60)
    words_per_minute = round(word_count / minutes) if word_count else 0

    # Filler words
    fillers = re.findall(
        r"\b(?:um+|uh+|erm|like|you know|basically|actually|sort of|kind of)\b",
        transcript.lower()
    )

    filler_count = len(fillers)

    # Vocabulary diversity
    unique_words = len(set(words))

    vocabulary_diversity = (
        round((unique_words / word_count) * 100)
        if word_count
        else 0
    )

    # Repeated phrases
    trigrams = [
        " ".join(words[i:i + 3])
        for i in range(max(0, word_count - 2))
    ]

    repeated_phrase_count = sum(
        count - 1
        for count in Counter(trigrams).values()
        if count > 1
    )

    # Pacing score
    if 110 <= words_per_minute <= 160:
        pacing = 100
    elif words_per_minute == 0:
        pacing = 45
    else:
        pacing = max(
            45,
            round(100 - abs(words_per_minute - 135) * 0.8)
        )

    # Fluency
    filler_score = max(
        45,
        100 - filler_count * 7
    )

    fluency = round(
        pacing * 0.55 +
        filler_score * 0.45
    )

    # Vocabulary score
    vocabulary = round(
        min(
            100,
            45 + vocabulary_diversity * 0.75
        )
    )

    # Basic grammar patterns
    grammar_errors = re.findall(
        r"\b(?:"
        r"he go|"
        r"she go|"
        r"they is|"
        r"he are|"
        r"she are|"
        r"i has|"
        r"i am agree|"
        r"more better"
        r")\b",
        transcript.lower()
    )

    sentences = [
        sentence.strip()
        for sentence in re.split(
            r"[.!?]+",
            transcript
        )
        if sentence.strip()
    ]

    average_sentence_length = (
        word_count / len(sentences)
        if sentences
        else 0
    )

    grammar_penalty = len(grammar_errors) * 12

    if average_sentence_length > 30:
        grammar_penalty += (
            average_sentence_length - 30
        ) * 1.5

    grammar = round(
        max(
            45,
            min(
                100,
                92 - grammar_penalty
            )
        )
    )

    # Overall score
    overall = round(
        fluency * 0.35 +
        vocabulary * 0.25 +
        grammar * 0.25 +
        pacing * 0.15
    )

    # Feedback
    feedback = []
    strengths = []

    if 110 <= words_per_minute <= 160:
        strengths.append(
            "Your speaking pace is in a comfortable conversational range."
        )
    elif words_per_minute > 160:
        feedback.append(
            "Try slowing down slightly so your ideas are easier to follow."
        )
    elif words_per_minute > 0:
        feedback.append(
            "Try connecting your ideas more smoothly instead of leaving long gaps."
        )

    if filler_count <= 2:
        strengths.append(
            "You used very few filler words."
        )
    else:
        feedback.append(
            f"You used {filler_count} filler words. "
            "Try pausing silently instead."
        )

    if vocabulary_diversity >= 55:
        strengths.append(
            "You used a reasonably varied vocabulary."
        )
    else:
        feedback.append(
            "Try replacing repeated words with more specific alternatives."
        )

    if repeated_phrase_count > 0:
        feedback.append(
            "You repeated a few short phrases. "
            "Try moving directly to your next idea."
        )

    if not feedback:
        feedback.append(
            "Keep using specific examples and clear transitions."
        )

    return {
        "overall": max(0, min(100, overall)),
        "fluency": max(0, min(100, fluency)),
        "vocabulary": max(0, min(100, vocabulary)),
        "grammar": max(0, min(100, grammar)),
        "pacing": max(0, min(100, pacing)),
        "filler_count": filler_count,
        "words_per_minute": words_per_minute,
        "vocabulary_diversity": vocabulary_diversity,
        "repeated_phrase_count": repeated_phrase_count,
        "feedback": feedback[:3],
        "strengths": strengths[:3],
    }