import express from 'express';
import {
    createPaper, getPapers, getPaper,
    updatePaper, deletePaper,
    getAllPapers, submitPaper, verifyPaper
} from '../controllers/paperController.js';
import protect, { admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getPapers).post(protect, createPaper);
router.route('/admin/all').get(protect, admin, getAllPapers);
router.route('/:id').get(protect, getPaper).put(protect, updatePaper).delete(protect, deletePaper);
router.route('/:id/submit').put(protect, submitPaper);
router.route('/:id/verify').put(protect, admin, verifyPaper);

export default router;
