import { useState, useEffect } from 'react';
import { questionAPI } from '../services/api';
import { usePaper } from '../context/PaperContext';

export default function QuestionBankPage() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ topic: '', type: '', difficulty: '' });
    const [activeTab, setActiveTab] = useState('all');
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState(null);
    const { addToSection } = usePaper();

    useEffect(() => {
        loadQuestions();
    }, [filters]);

    const loadQuestions = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.topic) params.topic = filters.topic;
            if (filters.type) params.type = filters.type;
            if (filters.difficulty) params.difficulty = filters.difficulty;

            const { data } = await questionAPI.getAll(params);
            setQuestions(data);
        } catch (err) {
            console.error('Failed to load questions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this question?')) return;
        try {
            await questionAPI.delete(id);
            setQuestions((prev) => prev.filter((q) => q._id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleEdit = (question) => {
        setEditingId(question._id);
        setEditData({ ...question });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData(null);
    };

    const handleSaveEdit = async () => {
        try {
            const { data } = await questionAPI.update(editingId, editData);
            setQuestions((prev) => prev.map((q) => (q._id === editingId ? data : q)));
            setEditingId(null);
            setEditData(null);
        } catch (err) {
            console.error('Update failed:', err);
            alert('Failed to save changes');
        }
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...editData.options];
        newOptions[index] = value;
        setEditData({ ...editData, options: newOptions });
    };

    const handleAddOption = () => {
        setEditData({ ...editData, options: [...(editData.options || []), 'New Option'] });
    };

    const handleDeleteOption = (index) => {
        const newOptions = editData.options.filter((_, i) => i !== index);
        setEditData({ ...editData, options: newOptions });
    };

    const handleAddToSection = (question) => {
        const section = question.type === 'mcq' ? 'A' : question.type === 'short' ? 'B' : 'C';
        addToSection(section, question);
        alert(`Added to Section ${section}!`);
    };

    const filteredByTab = activeTab === 'all'
        ? questions
        : questions.filter((q) => q.type === activeTab);

    const mcqCount = questions.filter((q) => q.type === 'mcq').length;
    const shortCount = questions.filter((q) => q.type === 'short').length;
    const longCount = questions.filter((q) => q.type === 'long').length;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Question Bank</h1>
                <p>{questions.length} questions extracted from your documents</p>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <input
                            className="form-control"
                            placeholder="🔍 Search by topic..."
                            value={filters.topic}
                            onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
                        />
                    </div>
                    <select
                        className="form-control"
                        style={{ width: 160 }}
                        value={filters.difficulty}
                        onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                    >
                        <option value="">All Difficulty</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                    All ({questions.length})
                </button>
                <button className={`tab-btn ${activeTab === 'mcq' ? 'active' : ''}`} onClick={() => setActiveTab('mcq')}>
                    MCQs ({mcqCount})
                </button>
                <button className={`tab-btn ${activeTab === 'short' ? 'active' : ''}`} onClick={() => setActiveTab('short')}>
                    Short Answer ({shortCount})
                </button>
                <button className={`tab-btn ${activeTab === 'long' ? 'active' : ''}`} onClick={() => setActiveTab('long')}>
                    Long Answer ({longCount})
                </button>
            </div>

            {/* Question List */}
            {loading ? (
                <div className="loading-overlay">
                    <div className="spinner" />
                    <p>Loading questions...</p>
                </div>
            ) : filteredByTab.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--color-text-muted)' }}>
                    <p style={{ fontSize: '48px', marginBottom: 'var(--space-md)' }}>📭</p>
                    <p>No questions found. Upload documents to extract questions.</p>
                </div>
            ) : (
                filteredByTab.map((q) => (
                    <div key={q._id} className="card question-card slide-up">
                        {editingId === q._id ? (
                            <div className="edit-form">
                                <div className="form-group">
                                    <label>Question Text</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={editData.questionText}
                                        onChange={(e) => setEditData({ ...editData, questionText: e.target.value })}
                                    />
                                </div>

                                {editData.type === 'mcq' && (
                                    <div className="options-edit" style={{ marginBottom: 'var(--space-md)' }}>
                                        <label style={{ display: 'block', marginBottom: 'var(--space-sm)', fontWeight: 600 }}>Options</label>
                                        {(editData.options || []).map((opt, j) => (
                                            <div key={j} style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                                                <span style={{ paddingTop: 8, fontWeight: 'bold' }}>{String.fromCharCode(65 + j)}</span>
                                                <input
                                                    className="form-control"
                                                    value={opt}
                                                    onChange={(e) => handleOptionChange(j, e.target.value)}
                                                />
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteOption(j)}>
                                                    🗑️
                                                </button>
                                            </div>
                                        ))}
                                        <button className="btn btn-secondary btn-sm" onClick={handleAddOption} style={{ marginTop: 'var(--space-xs)' }}>
                                            + Add Option
                                        </button>
                                    </div>
                                )}

                                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                    <div>
                                        <label>Difficulty</label>
                                        <select
                                            className="form-control"
                                            value={editData.difficulty}
                                            onChange={(e) => setEditData({ ...editData, difficulty: e.target.value })}
                                        >
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Marks</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={editData.marks}
                                            onChange={(e) => setEditData({ ...editData, marks: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                                    <button className="btn btn-primary" onClick={handleSaveEdit}>Save Changes</button>
                                    <button className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="question-actions">
                                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(q)}>
                                        ✏️ Edit
                                    </button>
                                    <button className="btn btn-primary btn-sm" onClick={() => handleAddToSection(q)}>
                                        + Add to Paper
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(q._id)}>
                                        🗑
                                    </button>
                                </div>

                                <span className={`question-type-badge badge-${q.type}`}>{q.type}</span>
                                <p className="question-text">{q.questionText}</p>

                                {q.options?.length > 0 && (
                                    <ol className="options-list" type="A">
                                        {q.options.map((opt, j) => <li key={j}>{opt}</li>)}
                                    </ol>
                                )}

                                <div className="question-meta">
                                    <span>📚 {q.topic}</span>
                                    <span>📊 {q.marks} marks</span>
                                    <span>🎯 {q.difficulty}</span>
                                    <span>📄 {q.source}</span>
                                </div>
                            </>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
