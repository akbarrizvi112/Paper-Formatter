import path from 'path';
import Document from '../models/Document.js';
import Question from '../models/Question.js';
import { extractQuestions, extractCategorizedQuestions } from '../services/pythonBridge.js';

// @route   POST /api/upload
export const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const { topic, source } = req.body;
        if (!topic) {
            return res.status(400).json({ message: 'Topic is required' });
        }

        const fileExt = path.extname(req.file.originalname).slice(1).toLowerCase();
        const filePath = path.resolve(req.file.path);

        // Save document record
        const document = await Document.create({
            userId: req.user._id,
            fileName: req.file.originalname,
            fileType: fileExt,
            filePath,
            topics: [topic],
            source: source || 'notes',
        });

        // Call Python service to extract questions
        const result = await extractQuestions(filePath, topic, source);

        // Save extracted text to document
        document.rawText = result.raw_text || '';
        await document.save();

        // Save extracted questions
        const savedQuestions = [];
        if (result.questions && result.questions.length > 0) {
            for (const q of result.questions) {
                const question = await Question.create({
                    documentId: document._id,
                    userId: req.user._id,
                    topic,
                    type: q.type,
                    questionText: q.question_text,
                    options: q.options || [],
                    correctAnswer: q.correct_answer || '',
                    marks: q.marks || (q.type === 'mcq' ? 1 : q.type === 'short' ? 5 : 10),
                    difficulty: q.difficulty || 'medium',
                    source: source || 'notes',
                });
                savedQuestions.push(question);
            }
        }

        res.status(201).json({
            document,
            questionsExtracted: savedQuestions.length,
            questions: savedQuestions,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @route   POST /api/upload/categorized
export const uploadCategorizedDocuments = async (req, res) => {
    try {
        const { topic } = req.body;
        if (!topic) {
            return res.status(400).json({ message: 'Topic is required' });
        }

        const files = req.files;
        if (!files || Object.keys(files).length === 0) {
            return res.status(400).json({ message: 'Please upload at least one file' });
        }

        const filePaths = {};
        const documentIds = [];

        // Process uploaded files and save document records
        for (const [key, fileArray] of Object.entries(files)) {
            const file = fileArray[0];
            const fileExt = path.extname(file.originalname).slice(1).toLowerCase();
            const filePath = path.resolve(file.path);

            // key is 'mcq', 'short', or 'long'
            filePaths[key] = filePath;

            const document = await Document.create({
                userId: req.user._id,
                fileName: file.originalname,
                fileType: fileExt,
                filePath,
                topics: [topic],
                source: 'notes', // Default for categorized upload
                category: key,   // Adding a category field might be useful
            });
            documentIds.push(document._id);
        }

        // Call Python service to extract questions
        const result = await extractCategorizedQuestions(filePaths, topic);

        // Save extracted questions
        const savedQuestions = [];
        if (result.questions && result.questions.length > 0) {
            for (const q of result.questions) {
                const question = await Question.create({
                    documentId: documentIds[0], // Associate with the first doc or omit if many
                    userId: req.user._id,
                    topic,
                    type: q.type,
                    questionText: q.question_text,
                    options: q.options || [],
                    correctAnswer: q.correct_answer || '',
                    marks: q.marks,
                    difficulty: q.difficulty || 'medium',
                    source: 'notes',
                });
                savedQuestions.push(question);
            }
        }

        res.status(201).json({
            questionsExtracted: savedQuestions.length,
            questions: savedQuestions,
        });
    } catch (error) {
        console.error('Categorized upload error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @route   GET /api/upload/documents
export const getDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
