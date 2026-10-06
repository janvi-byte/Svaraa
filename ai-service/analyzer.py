import re
from collections import Counter


FILLER_WORDS = {
    "um",
    "uh",
    "erm",
    "hmm",
    "like",
    "you know",
    "basically",
    "actually",
    "literally",
    "so",
    "well",
}


VOCABULARY_UPGRADES = {
    "good": {
        "suggested_word": "effective",
        "meaning": "Producing the desired result or having a useful effect.",
        "translations": {
            "English": "effective",
            "Hindi": "प्रभावी",
            "Gujarati": "અસરકારક",
        },
        "reason": "Use a more precise word when you mean that something works well.",
        "examples": [
            "The technology is effective in reducing manual work.",
            "She gave an effective presentation.",
            "This method is effective for beginners.",
        ],
    },
    "nice": {
        "suggested_word": "pleasant",
        "meaning": "Enjoyable, comfortable, or agreeable.",
        "translations": {
            "English": "pleasant",
            "Hindi": "सुखद",
            "Gujarati": "આનંદદાયક",
        },
        "reason": "Pleasant is more precise when describing an enjoyable experience.",
        "examples": [
            "We had a pleasant experience.",
            "The weather was pleasant.",
            "The environment was pleasant and comfortable.",
        ],
    },
    "thing": {
        "suggested_word": "aspect",
        "meaning": "A particular part or feature of something.",
        "translations": {
            "English": "aspect",
            "Hindi": "पहलू",
            "Gujarati": "પાસું",
        },
        "reason": "Aspect is more specific than the very general word thing.",
        "examples": [
            "One important aspect of technology is accessibility.",
            "Cost is an important aspect of the project.",
            "Another aspect is its impact on students.",
        ],
    },
    "very good": {
        "suggested_word": "excellent",
        "meaning": "Extremely good or of very high quality.",
        "translations": {
            "English": "excellent",
            "Hindi": "उत्कृष्ट",
            "Gujarati": "ઉત્તમ",
        },
        "reason": "Excellent is more concise and precise than very good.",
        "examples": [
            "She gave an excellent presentation.",
            "The project achieved excellent results.",
            "This is an excellent opportunity.",
        ],
    },
    "big": {
        "suggested_word": "significant",
        "meaning": "Important, meaningful, or having a noticeable effect.",
        "translations": {
            "English": "significant",
            "Hindi": "महत्वपूर्ण",
            "Gujarati": "નોંધપાત્ર",
        },
        "reason": "Significant is more precise when discussing importance or impact.",
        "examples": [
            "Technology has had a significant impact on education.",
            "There was a significant improvement.",
            "The project created a significant change.",
        ],
    },
    "bad": {
        "suggested_word": "harmful",
        "meaning": "Causing damage or negative effects.",
        "translations": {
            "English": "harmful",
            "Hindi": "हानिकारक",
            "Gujarati": "નુકસાનકારક",
        },
        "reason": "Harmful is more precise when something causes a negative effect.",
        "examples": [
            "Excessive screen time can be harmful.",
            "This habit can be harmful to productivity.",
            "Pollution is harmful to the environment.",
        ],
    },
    "happy": {
        "suggested_word": "satisfied",
        "meaning": "Feeling content because something meets expectations.",
        "translations": {
            "English": "satisfied",
            "Hindi": "संतुष्ट",
            "Gujarati": "સંતોષી",
        },
        "reason": "Satisfied is useful when describing contentment with a result or situation.",
        "examples": [
            "I was satisfied with the final result.",
            "The customer was satisfied with the service.",
            "She felt satisfied after completing the project.",
        ],
    },
    "sad": {
        "suggested_word": "disappointed",
        "meaning": "Feeling unhappy because expectations were not met.",
        "translations": {
            "English": "disappointed",
            "Hindi": "निराश",
            "Gujarati": "નિરાશ",
        },
        "reason": "Disappointed is more precise when something did not meet expectations.",
        "examples": [
            "I was disappointed with the result.",
            "She felt disappointed after missing the opportunity.",
            "The team was disappointed by the outcome.",
        ],
    },
    "a lot": {
        "suggested_word": "significantly",
        "meaning": "To a considerable or noticeable degree.",
        "translations": {
            "English": "significantly",
            "Hindi": "काफी हद तक",
            "Gujarati": "નોંધપાત્ર રીતે",
        },
        "reason": "Significantly gives a clearer sense of degree in formal speaking.",
        "examples": [
            "Technology has significantly changed our lives.",
            "The results improved significantly.",
            "The system significantly reduces processing time.",
        ],
    },
    "get": {
        "suggested_word": "obtain",
        "meaning": "To receive, acquire, or gain something.",
        "translations": {
            "English": "obtain",
            "Hindi": "प्राप्त करना",
            "Gujarati": "મેળવવું",
        },
        "reason": "Obtain is more precise in formal or academic contexts.",
        "examples": [
            "Students can obtain useful information online.",
            "We need to obtain accurate data.",
            "The application helps users obtain results quickly.",
        ],
    },
    "make": {
        "suggested_word": "create",
        "meaning": "To produce or develop something.",
        "translations": {
            "English": "create",
            "Hindi": "बनाना",
            "Gujarati": "બનાવવું",
        },
        "reason": "Create is more precise when you are producing something new.",
        "examples": [
            "Technology can create new opportunities.",
            "We created a solution for the problem.",
            "The team created a useful application.",
        ],
    },
    "help": {
        "suggested_word": "assist",
        "meaning": "To support someone or make a task easier.",
        "translations": {
            "English": "assist",
            "Hindi": "सहायता करना",
            "Gujarati": "મદદ કરવી",
        },
        "reason": "Assist is a more formal alternative when appropriate.",
        "examples": [
            "The system assists students with learning.",
            "AI can assist doctors in decision-making.",
            "The tool assists users in finding information.",
        ],
    },
}


GRAMMAR_RULES = [
    (
        r"\bi\s+am\s+agree\b",
        "I agree",
        "Use 'I agree', not 'I am agree'.",
        "Verb form",
        10,
    ),
    (
        r"\b(he|she)\s+go\b",
        r"\1 goes",
        "With he or she, use the third-person singular form 'goes'.",
        "Subject-verb agreement",
        8,
    ),
    (
        r"\b(he|she)\s+have\b",
        r"\1 has",
        "With he or she, use 'has'.",
        "Subject-verb agreement",
        8,
    ),
    (
        r"\b(he|she)\s+do\b",
        r"\1 does",
        "With he or she, use 'does'.",
        "Subject-verb agreement",
        8,
    ),
    (
        r"\bthey\s+is\b",
        "they are",
        "Use 'they are' because 'they' takes the plural verb 'are'.",
        "Subject-verb agreement",
        8,
    ),
    (
        r"\b(he|she)\s+are\b",
        r"\1 is",
        "Use 'is' with he or she.",
        "Subject-verb agreement",
        8,
    ),
    (
        r"\bi\s+has\b",
        "I have",
        "Use 'I have', not 'I has'.",
        "Subject-verb agreement",
        8,
    ),
    (
        r"\bmore\s+better\b",
        "better",
        "Do not use 'more' with the comparative 'better'.",
        "Comparatives",
        8,
    ),
    (
        r"\bmore\s+easier\b",
        "easier",
        "Do not use 'more' with the comparative 'easier'.",
        "Comparatives",
        8,
    ),
    (
        r"\bmore\s+harder\b",
        "harder",
        "Do not use 'more' with the comparative 'harder'.",
        "Comparatives",
        8,
    ),
    (
        r"\beasier\s+and\s+comfortable\b",
        "easier and more comfortable",
        "Use parallel comparative forms: 'easier and more comfortable'.",
        "Parallel structure",
        8,
    ),
    (
        r"\bi\s+didn't\s+\w+(?:ed|en)\b",
        "I didn't + base verb",
        "After 'didn't', use the base form of the verb.",
        "Past tense",
        8,
    ),
    (
        r"\b(he|she)\s+didn't\s+\w+(?:ed|en)\b",
        r"\1 didn't + base verb",
        "After 'didn't', use the base form of the verb.",
        "Past tense",
        8,
    ),
    (
        r"\bi\s+am\s+a\s+leisure\s+time\b",
        "I have free time",
        "Say 'I have free time' or 'In my free time'.",
        "Natural expression",
        8,
    ),
]


PHRASE_RULES = [
    (
        r"\btechnology\s+player\b",
        "technology plays",
        "Use 'technology plays...' when describing the role or influence of technology.",
        "Word choice",
        10,
    ),
    (
        r"\bimportant\s+to\s+read\s+our\s+life\b",
        "important in our lives",
        "The natural expression is 'important in our lives' or 'important for our lives'.",
        "Natural expression",
        10,
    ),
    (
        r"\bimportant\s+to\s+read\s+our\s+lives\b",
        "important in our lives",
        "The natural expression is 'important in our lives'.",
        "Natural expression",
        10,
    ),
    (
        r"\bsimilar\s+age\s+with\s+power\b",
        "unclear expression",
        "This phrase does not form a clear English expression. Rephrase the idea using specific words.",
        "Clarity",
        12,
    ),
    (
        r"\busing\s+any\s+technology\b",
        "using technology",
        "Remove 'any' unless you are referring to an unrestricted choice of technology.",
        "Word choice",
        4,
    ),
]


def normalize_text(text):
    text = text.strip()
    text = re.sub(r"\s+", " ", text)
    return text


def split_sentences(text):
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    return [sentence.strip() for sentence in sentences if sentence.strip()]


def words(text):
    return re.findall(r"\b[a-zA-Z]+(?:'[a-zA-Z]+)?\b", text.lower())


def detect_fillers(text):
    normalized = text.lower()
    count = 0

    for filler in FILLER_WORDS:
        count += len(re.findall(rf"\b{re.escape(filler)}\b", normalized))

    return count


def detect_repeated_phrases(text):
    tokens = words(text)

    if len(tokens) < 4:
        return 0

    phrases = Counter(
        " ".join(tokens[index:index + 3])
        for index in range(len(tokens) - 2)
    )

    return sum(
        count - 1
        for count in phrases.values()
        if count > 1
    )


def detect_repetitions(text):
    normalized = text.lower()

    repeated_word_matches = re.findall(
        r"\b([a-zA-Z]+)\s+\1\b",
        normalized,
    )

    repeated_phrase_matches = re.findall(
        r"\b(.{3,35}?)\s+\1\b",
        normalized,
    )

    repeated_phrase_count = len(repeated_word_matches)

    for match in repeated_phrase_matches:
        if len(match.split()) >= 2:
            repeated_phrase_count += 1

    return repeated_phrase_count


def detect_grammar_errors(text):
    errors = []
    normalized = normalize_text(text.lower())

    for pattern, correction, explanation, category, penalty in GRAMMAR_RULES:
        matches = list(re.finditer(pattern, normalized))

        for match in matches:
            original = match.group(0)

            if callable(correction):
                corrected = correction(match)
            else:
                corrected = correction

            errors.append(
                {
                    "original": original,
                    "correction": corrected,
                    "explanation": explanation,
                    "category": category,
                    "_penalty": penalty,
                }
            )

    for pattern, correction, explanation, category, penalty in PHRASE_RULES:
        matches = list(re.finditer(pattern, normalized))

        for match in matches:
            original = match.group(0)

            errors.append(
                {
                    "original": original,
                    "correction": correction,
                    "explanation": explanation,
                    "category": category,
                    "_penalty": penalty,
                }
            )

    return errors


def detect_vocabulary_upgrades(text, preferred_language):
    normalized = text.lower()
    results = []
    seen = set()

    ordered_items = sorted(
        VOCABULARY_UPGRADES.items(),
        key=lambda item: len(item[0]),
        reverse=True,
    )

    for phrase, data in ordered_items:
        pattern = rf"\b{re.escape(phrase)}\b"

        if not re.search(pattern, normalized):
            continue

        if phrase in seen:
            continue

        seen.add(phrase)

        translation = data["translations"].get(
            preferred_language,
            data["translations"]["English"],
        )

        results.append(
            {
                "used_word": phrase,
                "suggested_word": data["suggested_word"],
                "meaning": data["meaning"],
                "preferred_language": preferred_language,
                "translation": translation,
                "reason": data["reason"],
                "examples": data["examples"],
            }
        )

    return results[:6]


def detect_sentence_quality(text):
    sentences = split_sentences(text)
    issues = []

    for sentence in sentences:
        sentence_words = words(sentence)

        if not sentence_words:
            continue

        if len(sentence_words) >= 30:
            issues.append(
                {
                    "original": sentence,
                    "correction": "Break this into two or more shorter sentences.",
                    "explanation": "Very long sentences can reduce clarity and make spoken English harder to follow.",
                    "category": "Clarity",
                    "_penalty": 4,
                }
            )

        if len(sentence_words) <= 3:
            issues.append(
                {
                    "original": sentence,
                    "correction": "Expand the idea with a complete explanation.",
                    "explanation": "Very short fragments can make an answer sound incomplete.",
                    "category": "Completeness",
                    "_penalty": 3,
                }
            )

    return issues


def detect_coherence_issues(text):
    normalized = text.lower()
    issues = []

    unclear_patterns = [
        (
            r"\bi\s+don't\s+imagine\s+i\s+can\s+imagine\b",
            "I cannot clearly express this idea",
            "The same idea is repeated in a way that makes the sentence difficult to understand.",
        ),
        (
            r"\bsimilar\s+age\s+with\s+power\b",
            "Rephrase this idea clearly",
            "The phrase does not communicate a clear meaning in English.",
        ),
        (
            r"\btechnology\s+player\s+may\s+be\s+important\b",
            "Technology may play an important role",
            "Use 'play an important role' when describing the influence of technology.",
        ),
    ]

    for pattern, correction, explanation in unclear_patterns:
        match = re.search(pattern, normalized)

        if match:
            issues.append(
                {
                    "original": match.group(0),
                    "correction": correction,
                    "explanation": explanation,
                    "category": "Clarity",
                    "_penalty": 10,
                }
            )

    return issues


def build_improved_answer(transcript, errors):
    improved = transcript

    applicable_errors = [
        error
        for error in errors
        if error["correction"]
        and not error["correction"].lower().startswith("unclear")
        and not error["correction"].lower().startswith("rephrase")
        and "base verb" not in error["correction"].lower()
        and "complete explanation" not in error["correction"].lower()
        and "shorter sentences" not in error["correction"].lower()
    ]

    for error in sorted(
        applicable_errors,
        key=lambda item: len(item["original"]),
        reverse=True,
    ):
        original = error["original"]
        correction = error["correction"]

        if not original or not correction:
            continue

        improved = re.sub(
            re.escape(original),
            correction,
            improved,
            count=1,
            flags=re.IGNORECASE,
        )

    improved = re.sub(r"\s+", " ", improved).strip()

    return improved


def calculate_wpm(word_count, duration_seconds):
    if duration_seconds <= 0:
        return 0

    minutes = duration_seconds / 60

    if minutes <= 0:
        return 0

    return round(word_count / minutes)


def calculate_pacing_score(wpm):
    if wpm <= 0:
        return 40

    if 110 <= wpm <= 160:
        return 100

    if 100 <= wpm < 110 or 160 < wpm <= 175:
        return 92

    if 90 <= wpm < 100 or 175 < wpm <= 190:
        return 82

    if 75 <= wpm < 90 or 190 < wpm <= 210:
        return 70

    if 55 <= wpm < 75 or 210 < wpm <= 230:
        return 58

    return 45


def calculate_fluency_score(
    word_count,
    filler_count,
    repeated_phrase_count,
    sentence_count,
):
    if word_count == 0:
        return 30

    score = 100

    filler_rate = filler_count / word_count

    if filler_rate > 0.08:
        score -= 30
    elif filler_rate > 0.05:
        score -= 20
    elif filler_rate > 0.03:
        score -= 10

    repetition_rate = repeated_phrase_count / max(word_count, 1)

    if repetition_rate > 0.08:
        score -= 25
    elif repetition_rate > 0.04:
        score -= 15
    elif repetition_rate > 0.02:
        score -= 8

    if sentence_count == 0:
        score -= 10

    return max(35, min(100, round(score)))


def calculate_vocabulary_score(
    word_count,
    vocabulary_diversity,
    vocabulary_upgrades,
):
    score = vocabulary_diversity

    if word_count < 20:
        score -= 5

    if vocabulary_upgrades >= 5:
        score -= 6
    elif vocabulary_upgrades >= 3:
        score -= 3

    return max(30, min(100, round(score)))


def calculate_grammar_score(grammar_errors, word_count):
    if word_count == 0:
        return 30

    penalty = sum(
        error.get("_penalty", 5)
        for error in grammar_errors
    )

    normalized_penalty = penalty

    if word_count < 30:
        normalized_penalty *= 1.15

    score = 100 - normalized_penalty

    return max(25, min(100, round(score)))


def calculate_overall(
    fluency,
    vocabulary,
    grammar,
    pacing,
    grammar_errors,
    coherence_errors,
):
    score = (
        fluency * 0.25
        + vocabulary * 0.20
        + grammar * 0.30
        + pacing * 0.10
        + 15
    )

    coherence_penalty = min(
        20,
        len(coherence_errors) * 5,
    )

    score -= coherence_penalty

    if len(grammar_errors) >= 4:
        score -= 8

    if len(grammar_errors) >= 6:
        score -= 7

    return max(20, min(100, round(score)))


def build_feedback(
    fluency,
    vocabulary,
    grammar,
    pacing,
    grammar_errors,
    vocabulary_upgrades,
    filler_count,
    repeated_phrase_count,
):
    feedback = []
    strengths = []

    if pacing >= 85:
        strengths.append(
            "Your speaking pace is in a comfortable conversational range."
        )
    elif pacing < 65:
        feedback.append(
            "Work on a steadier speaking pace so your ideas are easier to follow."
        )

    if filler_count <= 2:
        strengths.append("You used very few filler words.")
    elif filler_count >= 6:
        feedback.append(
            "Reduce filler words such as 'um', 'uh', 'like', and 'you know'."
        )

    if repeated_phrase_count == 0:
        strengths.append("You avoided excessive repeated phrases.")
    elif repeated_phrase_count >= 3:
        feedback.append(
            "Try to avoid repeating the same words or phrases while developing an idea."
        )

    if grammar >= 90:
        strengths.append("Your sentence structures were generally accurate.")
    elif grammar >= 75:
        feedback.append(
            "Your grammar is understandable, but several sentence structures need correction."
        )
    else:
        feedback.append(
            "Grammar is one of the main areas to improve. Focus on the corrections shown below."
        )

    if vocabulary >= 90:
        strengths.append("You used a reasonably varied vocabulary.")
    elif vocabulary >= 75:
        feedback.append(
            "Try using more precise words instead of relying on common words."
        )
    else:
        feedback.append(
            "Build a more precise vocabulary and avoid vague or repetitive word choices."
        )

    if vocabulary_upgrades:
        feedback.append(
            "Try the vocabulary alternatives below when they fit the meaning you want to express."
        )

    if grammar_errors:
        feedback.append(
            f"Speakora found {len(grammar_errors)} language issue"
            f"{'' if len(grammar_errors) == 1 else 's'} that affected clarity or accuracy."
        )

    return feedback[:5], strengths[:4]


def analyze_text(
    transcript,
    duration_seconds,
    preferred_language="English",
):
    transcript = normalize_text(transcript)

    if not transcript:
        return {
            "overall": 0,
            "fluency": 0,
            "vocabulary": 0,
            "grammar": 0,
            "pacing": 0,
            "filler_count": 0,
            "words_per_minute": 0,
            "vocabulary_diversity": 0,
            "repeated_phrase_count": 0,
            "grammar_errors": [],
            "vocabulary_upgrades": [],
            "preferred_language": preferred_language,
            "improved_answer": "",
            "feedback": ["No speech was detected."],
            "strengths": [],
        }

    token_list = words(transcript)
    word_count = len(token_list)

    unique_words = len(set(token_list))

    vocabulary_diversity = (
        round((unique_words / word_count) * 100)
        if word_count
        else 0
    )

    vocabulary_diversity = max(
        0,
        min(100, vocabulary_diversity),
    )

    filler_count = detect_fillers(transcript)

    repeated_phrase_count = detect_repeated_phrases(
        transcript
    )

    repeated_phrase_count += detect_repetitions(
        transcript
    )

    grammar_errors = detect_grammar_errors(transcript)

    coherence_errors = detect_coherence_issues(
        transcript
    )

    sentence_quality_errors = detect_sentence_quality(
        transcript
    )

    all_errors = (
        grammar_errors
        + coherence_errors
        + sentence_quality_errors
    )

    unique_error_keys = set()
    filtered_errors = []

    for error in all_errors:
        key = (
            error["original"].lower(),
            error["correction"].lower(),
        )

        if key in unique_error_keys:
            continue

        unique_error_keys.add(key)
        filtered_errors.append(error)

    grammar_errors = filtered_errors

    vocabulary_upgrades = detect_vocabulary_upgrades(
        transcript,
        preferred_language,
    )

    improved_answer = build_improved_answer(
        transcript,
        grammar_errors,
    )

    wpm = calculate_wpm(
        word_count,
        duration_seconds,
    )

    pacing = calculate_pacing_score(wpm)

    fluency = calculate_fluency_score(
        word_count,
        filler_count,
        repeated_phrase_count,
        len(split_sentences(transcript)),
    )

    vocabulary = calculate_vocabulary_score(
        word_count,
        vocabulary_diversity,
        len(vocabulary_upgrades),
    )

    grammar = calculate_grammar_score(
        grammar_errors,
        word_count,
    )

    overall = calculate_overall(
        fluency,
        vocabulary,
        grammar,
        pacing,
        grammar_errors,
        coherence_errors,
    )

    feedback, strengths = build_feedback(
        fluency,
        vocabulary,
        grammar,
        pacing,
        grammar_errors,
        vocabulary_upgrades,
        filler_count,
        repeated_phrase_count,
    )

    cleaned_errors = []

    for error in grammar_errors[:10]:
        cleaned_errors.append(
            {
                "original": error["original"],
                "correction": error["correction"],
                "explanation": error["explanation"],
                "category": error["category"],
            }
        )

    return {
        "overall": overall,
        "fluency": fluency,
        "vocabulary": vocabulary,
        "grammar": grammar,
        "pacing": pacing,
        "filler_count": filler_count,
        "words_per_minute": wpm,
        "vocabulary_diversity": vocabulary_diversity,
        "repeated_phrase_count": repeated_phrase_count,
        "grammar_errors": cleaned_errors,
        "vocabulary_upgrades": vocabulary_upgrades,
        "preferred_language": preferred_language,
        "improved_answer": improved_answer,
        "feedback": feedback,
        "strengths": strengths,
    }