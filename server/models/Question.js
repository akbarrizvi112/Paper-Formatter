import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    topic: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['mcq', 'short', 'long'],
        required: true,
    },
    questionText: {
        type: String,
        required: true,
    },
    options: [{
        type: String,
    }],
    correctAnswer: {
        type: String,
        default: '',
    },
    marks: {
        type: Number,
        default: 1,
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
    },
    source: {
        type: String,
        enum: ['notes', 'pastpaper'],
        default: 'notes',
    },
}, { timestamps: true });

// Indexes for efficient querying
questionSchema.index({ topic: 1, type: 1 });
questionSchema.index({ userId: 1 });

export default mongoose.model('Question', questionSchema);
