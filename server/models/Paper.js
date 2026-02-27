import mongoose from 'mongoose';

const paperSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    subject: {
        type: String,
        required: true,
        trim: true,
    },
    className: {
        type: String,
        trim: true,
        default: '',
    },
    institutionName: {
        type: String,
        trim: true,
        default: '',
    },
    totalMarks: {
        type: Number,
        required: true,
    },
    duration: {
        type: String,
        default: '3 hours',
    },
    assessmentType: {
        type: String,
        default: 'MODULAR ASSESSMENT – I',
    },
    session: {
        type: String,
        default: 'SEPTEMBER 2025',
    },
    date: {
        type: String,
        default: '',
    },
    logoUrl: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'verified'],
        default: 'draft',
    },
    sections: {
        sectionA: {
            title: { type: String, default: 'Section A — Multiple Choice Questions' },
            instructions: { type: String, default: 'Choose the correct answer for each question.' },
            questions: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Question',
            }],
        },
        sectionB: {
            title: { type: String, default: 'Section B — Short Answer Questions' },
            instructions: { type: String, default: 'Answer the following questions briefly.' },
            questions: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Question',
            }],
        },
        sectionC: {
            title: { type: String, default: 'Section C — Descriptive Answer Questions' },
            instructions: { type: String, default: 'Answer the following questions in detail.' },
            questions: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Question',
            }],
        },
    },
}, { timestamps: true });

export default mongoose.model('Paper', paperSchema);
