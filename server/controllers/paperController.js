import Paper from '../models/Paper.js';

// @route   POST /api/papers
export const createPaper = async (req, res) => {
    try {
        const {
            title, subject, className, institutionName,
            totalMarks, duration, sections,
            assessmentType, session, date, logoUrl
        } = req.body;

        const paper = await Paper.create({
            userId: req.user._id,
            title,
            subject,
            className,
            institutionName,
            totalMarks,
            duration,
            sections,
            assessmentType,
            session,
            date,
            logoUrl
        });

        // Return with populated questions
        const populated = await Paper.findById(paper._id)
            .populate('sections.sectionA.questions')
            .populate('sections.sectionB.questions')
            .populate('sections.sectionC.questions');

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   GET /api/papers
export const getPapers = async (req, res) => {
    try {
        const papers = await Paper.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(papers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   GET /api/papers/:id
export const getPaper = async (req, res) => {
    try {
        const paper = await Paper.findById(req.params.id)
            .populate('sections.sectionA.questions')
            .populate('sections.sectionB.questions')
            .populate('sections.sectionC.questions');

        if (!paper) {
            return res.status(404).json({ message: 'Paper not found' });
        }
        res.json(paper);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   PUT /api/papers/:id
export const updatePaper = async (req, res) => {
    try {
        const paper = await Paper.findByIdAndUpdate(req.params.id, req.body, {
            new: true, runValidators: true,
        })
            .populate('sections.sectionA.questions')
            .populate('sections.sectionB.questions')
            .populate('sections.sectionC.questions');

        if (!paper) {
            return res.status(404).json({ message: 'Paper not found' });
        }
        res.json(paper);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   DELETE /api/papers/:id
export const deletePaper = async (req, res) => {
    try {
        const paper = await Paper.findByIdAndDelete(req.params.id);
        if (!paper) {
            return res.status(404).json({ message: 'Paper not found' });
        }
        res.json({ message: 'Paper deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   GET /api/papers/admin/all
// @access  Admin
export const getAllPapers = async (req, res) => {
    try {
        const papers = await Paper.find({})
            .populate('userId', 'name email')
            .populate('sections.sectionA.questions')
            .populate('sections.sectionB.questions')
            .populate('sections.sectionC.questions')
            .sort({ createdAt: -1 });
        res.json(papers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   PUT /api/papers/:id/submit
export const submitPaper = async (req, res) => {
    try {
        const paper = await Paper.findById(req.params.id);
        if (!paper) {
            return res.status(404).json({ message: 'Paper not found' });
        }
        if (paper.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        paper.status = 'submitted';
        await paper.save();
        res.json(paper);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   PUT /api/papers/:id/verify
// @access  Admin
export const verifyPaper = async (req, res) => {
    try {
        const paper = await Paper.findById(req.params.id);
        if (!paper) {
            return res.status(404).json({ message: 'Paper not found' });
        }
        paper.status = 'verified';
        await paper.save();
        res.json(paper);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
