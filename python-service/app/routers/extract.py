"""
Extraction Router — handles the /extract endpoint.
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import ExtractionRequest, ExtractionResponse, ExtractedQuestion, CategorizedExtractionRequest
from app.services.text_extractor import extract_text
from app.services.question_extractor import extract_questions
from app.services.classifier import classify_question

router = APIRouter()


@router.post("/extract", response_model=ExtractionResponse)
async def extract_and_classify(request: ExtractionRequest):
    """
    Extract text from a document, find questions matching the topic,
    and classify them as MCQ / Short / Long.
    """
    try:
        # Step 1: Extract raw text from the file
        raw_text = extract_text(request.file_path)

        if not raw_text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from the file")

        # Step 2: Extract questions related to the topic
        raw_questions = extract_questions(raw_text, request.topic)

        # Step 3: Classify each question
        classified = []
        for q in raw_questions:
            result = classify_question(q)
            classified.append(ExtractedQuestion(
                question_text=result["question_text"],
                type=result["type"],
                options=result["options"],
                correct_answer=result["correct_answer"],
                marks=result["marks"],
                difficulty=result["difficulty"],
            ))

        return ExtractionResponse(
            raw_text=raw_text[:2000],  # Truncate for response size
            topic=request.topic,
            total_questions=len(classified),
            questions=classified,
        )

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


@router.post("/extract-categorized", response_model=ExtractionResponse)
async def extract_categorized(request: CategorizedExtractionRequest):
    """
    Extract from three different PDFs based on category.
    """
    all_questions = []
    combined_raw_text = ""

    categories = [
        ("mcq", request.mcq_file_path),
        ("short", request.short_file_path),
        ("long", request.long_file_path)
    ]

    try:
        for q_type, file_path in categories:
            if not file_path:
                continue

            # 1. Extract text
            raw_text = extract_text(file_path)
            combined_raw_text += f"\n--- {q_type.upper()} Document ---\n" + raw_text[:500] + "..."

            # 2. Extract questions
            raw_questions = extract_questions(raw_text, request.topic)

            # 3. Classify but force the type from the file category
            for q in raw_questions:
                # Still use classifier for marks/difficulty but override type
                result = classify_question(q)
                all_questions.append(ExtractedQuestion(
                    question_text=q["question_text"],
                    type=q_type,  # OVERRIDE
                    options=q["options"] if q_type == "mcq" else [],
                    correct_answer=q.get("correct_answer", ""),
                    marks=result["marks"] if result["type"] == q_type else (1 if q_type == "mcq" else 5 if q_type == "short" else 10),
                    difficulty=result["difficulty"],
                ))

        return ExtractionResponse(
            raw_text=combined_raw_text[:2000],
            topic=request.topic,
            total_questions=len(all_questions),
            questions=all_questions,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Categorized extraction failed: {str(e)}")
