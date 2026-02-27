import express from 'express';
import { uploadDocument, uploadCategorizedDocuments, getDocuments } from '../controllers/uploadController.js';
import protect from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', protect, upload.single('file'), uploadDocument);
router.post('/categorized', protect, upload.fields([
    { name: 'mcq', maxCount: 1 },
    { name: 'short', maxCount: 1 },
    { name: 'long', maxCount: 1 }
]), uploadCategorizedDocuments);
router.get('/documents', protect, getDocuments);

export default router;
