import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    fileName: {
        type: String,
        required: true,
    },
    fileType: {
        type: String,
        enum: ['pdf', 'docx', 'txt'],
        required: true,
    },
    filePath: {
        type: String,
        required: true,
    },
    topics: [{
        type: String,
        trim: true,
    }],
    rawText: {
        type: String,
        default: '',
    },
    source: {
        type: String,
        enum: ['notes', 'pastpaper'],
        default: 'notes',
    },
    category: {
        type: String,
        enum: ['mcq', 'short', 'long', 'general'],
        default: 'general',
    },
}, { timestamps: true });

export default mongoose.model('Document', documentSchema);
