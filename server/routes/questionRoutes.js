import express from 'express';
import {
    getQuestions, getQuestion, updateQuestion,
    deleteQuestion, createQuestion,
} from '../controllers/questionController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getQuestions).post(protect, createQuestion);
router.route('/:id').get(protect, getQuestion).put(protect, updateQuestion).delete(protect, deleteQuestion);

export default router;
