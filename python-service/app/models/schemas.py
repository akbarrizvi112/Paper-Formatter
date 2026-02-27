from pydantic import BaseModel
from typing import List, Optional


class ExtractionRequest(BaseModel):
    file_path: str
    topic: str
    source: str = "notes"


class ExtractedQuestion(BaseModel):
    question_text: str
    type: str  # 'mcq', 'short', 'long'
    options: List[str] = []
    correct_answer: str = ""
    marks: int = 1
    difficulty: str = "medium"


class ExtractionResponse(BaseModel):
    raw_text: str
    topic: str
    total_questions: int
    questions: List[ExtractedQuestion]


class CategorizedExtractionRequest(BaseModel):
    mcq_file_path: Optional[str] = None
    short_file_path: Optional[str] = None
    long_file_path: Optional[str] = None
    topic: str
