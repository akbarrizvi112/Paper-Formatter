"""
Question Classifier — classifies extracted questions as MCQ, Short Answer, or Long Answer.
"""
import re
from typing import Dict


def classify_question(question: Dict) -> Dict:
    """
    Classify a question as 'mcq', 'short', or 'long' and assign marks.

    Rules:
    - MCQ: has options (A/B/C/D), or explicitly says "choose", "select", "tick"
    - Long: keywords like "explain in detail", "describe", "discuss", "elaborate",
            "write an essay", "critically analyze", or marks >= 8
    - Short: everything else (define, state, list, briefly, name, write short note)
    """
    text = question["question_text"].lower()
    options = question.get("options", [])

    # ---- MCQ Detection ----
    if len(options) >= 2:
        return _build_result(question, "mcq", marks=1, difficulty=_guess_difficulty(text, "mcq"))

    mcq_keywords = ["choose the correct", "select the correct", "tick the correct",
                     "which of the following", "multiple choice", "the correct answer is"]
    if any(kw in text for kw in mcq_keywords):
        return _build_result(question, "mcq", marks=1, difficulty=_guess_difficulty(text, "mcq"))

    # ---- Long Answer Detection ----
    long_keywords = [
        "explain in detail", "describe in detail", "discuss in detail",
        "elaborate", "critically analyze", "critically evaluate",
        "write an essay", "write a detailed", "write in detail",
        "give a detailed account", "compare and contrast",
        "discuss the role", "discuss the importance",
        "explain with examples", "explain the significance",
    ]
    if any(kw in text for kw in long_keywords):
        return _build_result(question, "long", marks=10, difficulty=_guess_difficulty(text, "long"))

    # Check for high-mark indicators
    mark_match = re.search(r"\((\d+)\s*marks?\)", text)
    if mark_match:
        marks_val = int(mark_match.group(1))
        if marks_val >= 8:
            return _build_result(question, "long", marks=marks_val, difficulty=_guess_difficulty(text, "long"))
        elif marks_val >= 3:
            return _build_result(question, "short", marks=marks_val, difficulty=_guess_difficulty(text, "short"))
        else:
            return _build_result(question, "mcq", marks=marks_val, difficulty=_guess_difficulty(text, "mcq"))

    # ---- Short answer (moderate-detail keywords) ----
    short_keywords = [
        "define", "state", "list", "name", "mention",
        "briefly", "short note", "differentiate",
        "what is", "what are", "who is", "who was",
        "give reason", "write a note",
    ]
    if any(kw in text for kw in short_keywords):
        return _build_result(question, "short", marks=5, difficulty=_guess_difficulty(text, "short"))

    # ---- Check word count for remaining ----
    word_count = len(text.split())
    if word_count > 30:
        return _build_result(question, "long", marks=10, difficulty="hard")
    elif word_count > 15:
        return _build_result(question, "short", marks=5, difficulty="medium")
    else:
        return _build_result(question, "short", marks=3, difficulty="easy")


def _build_result(question: Dict, q_type: str, marks: int, difficulty: str) -> Dict:
    return {
        "question_text": question["question_text"],
        "type": q_type,
        "options": question.get("options", []),
        "correct_answer": question.get("correct_answer", ""),
        "marks": marks,
        "difficulty": difficulty,
    }


def _guess_difficulty(text: str, q_type: str) -> str:
    """Heuristic difficulty estimation."""
    hard_words = ["analyze", "evaluate", "critically", "compare and contrast", "justify", "assess"]
    medium_words = ["explain", "describe", "discuss", "differentiate", "compare"]

    if any(w in text for w in hard_words):
        return "hard"
    if any(w in text for w in medium_words):
        return "medium"
    return "easy"
