import Question from '../models/Question.js';

// @route   GET /api/questions
export const getQuestions = async (req, res) => {
    try {
        const { topic, type, difficulty, source } = req.query;
        const filter = { userId: req.user._id };

        if (topic) filter.topic = { $regex: topic, $options: 'i' };
        if (type) filter.type = type;
        if (difficulty) filter.difficulty = difficulty;
        if (source) filter.source = source;

        const questions = await Question.find(filter).sort({ createdAt: -1 });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   GET /api/questions/:id
export const getQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.json(question);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   PUT /api/questions/:id
export const updateQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
            new: true, runValidators: true,
        });
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.json(question);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   DELETE /api/questions/:id
export const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.json({ message: 'Question deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   POST /api/questions (manual add)
export const createQuestion = async (req, res) => {
    try {
        const question = await Question.create({
            ...req.body,
            userId: req.user._id,
        });
        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
