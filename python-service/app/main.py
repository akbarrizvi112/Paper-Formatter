from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import extract

app = FastAPI(
    title="Paper Formatter - NLP Service",
    description="Extract and classify questions from documents",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(extract.router, tags=["extraction"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "python-nlp"}
