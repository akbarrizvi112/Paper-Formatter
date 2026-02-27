"""
Question Extractor — identifies questions from raw text using regex patterns and NLP heuristics.
"""
import re
from typing import List, Dict


def extract_questions(text: str, topic: str) -> List[Dict]:
    """
    Extract questions from text that match the given topic.
    """
    # Normalize text
    lines = text.split("\n")
    lines = [line.strip() for line in lines if line.strip()]

    raw_questions = []
    i = 0

    while i < len(lines):
        line = lines[i]

        # Check if this line looks like a question
        if _is_question_line(line):
            # Extract options that might be on the same line as the question
            embedded_options = _find_options_in_text(line)
            question_text = _clean_question(line)
            
            # If options were found on the same line, remove them from the question text
            if embedded_options:
                # Find the first option marker that is NOT at the very start of the clean question
                q_num_match = re.search(r"^\s*([Qq]?\d+[\.\)]\s*|\(\d+\)\s*|\([ivxlc]+\)\s*)", line, re.I)
                start_search = q_num_match.end() if q_num_match else 0
                
                marker_match = re.search(r"[\(\s][A-Ja-j1-4][\.\)]\s+", " " + line[start_search:])
                if marker_match:
                    split_idx = start_search + max(0, marker_match.start() - 1)
                    question_text = _clean_question(line[:split_idx])

            question_data = {"question_text": question_text, "options": embedded_options}

            # If no options found on same line, look ahead for option lines
            j = i + 1
            if not embedded_options:
                # Table format support: if next lines are short and don't look like questions, collect them (up to 4)
                options_collected = 0
                while j < len(lines) and options_collected < 4:
                    curr_line = lines[j]
                    
                    # If we find a standard option line, collect it
                    if _is_option_line(curr_line) or _contains_multiple_options(curr_line):
                        line_options = _find_options_in_text(curr_line)
                        if line_options:
                            question_data["options"].extend(line_options)
                        else:
                            question_data["options"].append(_clean_option(curr_line))
                        options_collected += 1
                        j += 1
                    # FALLBACK: If it's a short line and NOT a new question, treat as unlabeled option
                    elif len(curr_line) < 50 and not _is_question_line(curr_line):
                        question_data["options"].append(_clean_option(curr_line))
                        options_collected += 1
                        j += 1
                    else:
                        break # Found something else (likely next question)
            
            raw_questions.append(question_data)
            i = j
        else:
            i += 1

    # Filter by topic relevance
    topic_lower = topic.lower()
    topic_words = set(topic_lower.split())

    filtered = []
    for q in raw_questions:
        question_lower = q["question_text"].lower()
        if topic_lower in question_lower or _topic_relevance(topic_words, question_lower) > 0.3:
            filtered.append(q)

    if not filtered and raw_questions:
        filtered = raw_questions

    return filtered


def _is_question_line(line: str) -> bool:
    """Check if a line looks like a question."""
    # Don't consider a line a question if it's clearly just an option line
    if _is_option_line(line) and not re.search(r"\?|What|Why|How", line, re.I):
        return False
        
    patterns = [
        # Ends with question mark or colon or dash
        r".*[\?\:-]\s*$",
        # Numbered questions: Q1. Q1) 1. 1) (1) (i) (a)
        r"^\s*[Qq]\d+[\.\)]\s*.+",
        r"^\s*\d+[\.\)]\s*.{3,}",
        r"^\s*\(\d+\)\s*.{3,}",
        r"^\s*\([ivxlc]+\)\s*.{3,}",
        # Common question starters
        r"^\s*(What|Why|How|When|Where|Which|Who|Define|Explain|Describe|Discuss|Compare|Differentiate|List|State|Name|Write|Evaluate|Analyze|Illustrate|Enumerate|Elaborate|Briefly)\s.+",
        # Statement starters (Table format)
        r"^\s*(This|It|The|A|An|Unix|Sound|Bit|BIOS|CPU|Bus|Computer|A\ssoftware|This\svirus|The\sterm)\s.+",
    ]
    for pattern in patterns:
        if re.match(pattern, line, re.IGNORECASE):
            return True
    return False


def _is_option_line(line: str) -> bool:
    """Check if a line starts with an MCQ option prefix."""
    patterns = [
        r"^\s*[A-Ja-j][\.\)]\s*.+",        # A. or a) style
        r"^\s*\([A-Ja-j]\)\s*.+",           # (A) or (a) style
        r"^\s*[ivIV]+[\.\)]\s*.+",          # Roman numerals
    ]
    for pattern in patterns:
        if re.match(pattern, line):
            return True
    return False


def _contains_multiple_options(line: str) -> bool:
    """Check if a line contains multiple options (e.g. (a) text (b) text)."""
    # Matches patterns like (a) text (b) text or 1) text 2) text
    count = len(re.findall(r"[\(\s][A-Ja-j1-4][\.\)]\s+", " " + line))
    return count >= 2


def _find_options_in_text(text: str) -> List[str]:
    """Extract individual options from a string that may contain multiple options."""
    # Pattern to find options like (a) ..., A. ..., (1) ...
    # We look for the label and any text following it until the next label or end of string
    pattern = r"([\(\s][A-Ja-j1-4][\.\)]\s+)([^(\n]*?(?=(?:[\(\s][A-Ja-j1-4][\.\)]\s+)|$))"
    matches = re.findall(pattern, " " + text)
    
    options = []
    for marker, content in matches:
        full_opt = marker.strip() + " " + content.strip()
        if content.strip():
            options.append(full_opt)
    
    return options


def _clean_question(line: str) -> str:
    """Remove question number prefix."""
    cleaned = re.sub(r"^\s*[Qq]?\d+[\.\)]\s*", "", line)
    cleaned = re.sub(r"^\s*\(\d+\)\s*", "", cleaned)
    cleaned = re.sub(r"^\s*\([ivxlc]+\)\s*", "", cleaned, flags=re.IGNORECASE)
    return cleaned.strip()


def _clean_option(line: str) -> str:
    """Clean option text, keep the letter prefix."""
    return line.strip()


def _topic_relevance(topic_words: set, text: str) -> float:
    """Calculate how relevant the text is to the topic (0.0 to 1.0)."""
    if not topic_words:
        return 0.0
    text_words = set(re.findall(r"\w+", text.lower()))
    matches = topic_words.intersection(text_words)
    return len(matches) / len(topic_words) if topic_words else 0.0
