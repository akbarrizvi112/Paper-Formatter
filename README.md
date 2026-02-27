# 📝 Paper Formatter — Exam Paper Generator

An AI-powered web application that helps teachers create beautifully formatted exam papers. Upload notes or past papers, extract questions automatically, organize them into sections (MCQ, Short, Long), and generate professional PDFs.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite |
| API Server | Node.js + Express |
| NLP Service | Python + FastAPI |
| Database | MongoDB |
| PDF | @react-pdf/renderer |

## Prerequisites

- **Node.js** v18+ (you have v20.16.0 via NVM)
- **Python** 3.9+
- **MongoDB** running locally on port 27017

## Quick Start

### 1. Start MongoDB
Make sure MongoDB is running:
```bash
mongod
```

### 2. Start Python NLP Service
```bash
cd python-service
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Start Node.js API Server
```bash
cd server
npm run dev
```
Server starts on `http://localhost:5000`

### 4. Start React Frontend
```bash
cd client
npm run dev
```
Frontend starts on `http://localhost:5173`

## Environment Variables

Edit `.env` in the root directory:
```env
MONGO_URI=mongodb://localhost:27017/paper-formatter
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
NODE_PORT=5000
PYTHON_PORT=8000
PYTHON_SERVICE_URL=http://localhost:8000
```

## How to Use

1. **Register/Login** — Create a teacher account
2. **Upload** — Upload PDF/DOCX/TXT notes or past papers with a topic name
3. **Question Bank** — Browse extracted questions filtered by type (MCQ/Short/Long)
4. **Paper Builder** — Select questions into Section A (MCQ), B (Short), C (Long)
5. **Generate PDF** — Preview and download the formatted exam paper

## Project Structure

```
paper-formatter/
├── client/          → React frontend (Vite)
├── server/          → Node.js Express API
├── python-service/  → Python FastAPI NLP service
└── .env             → Environment variables
```

## ⚠️ Note on npm install (C: Drive Full)

If you see `ENOSPC` errors during npm install, your C: drive may be full.
The `.npmrc` files are configured to use `E:\paper-formatter\.npm-cache` for the cache.
Make sure to set TEMP to E: drive before installing:
```powershell
$env:TEMP = "E:\paper-formatter\.npm-tmp"
$env:TMP = "E:\paper-formatter\.npm-tmp"
npm install
```
