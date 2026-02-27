import { useState } from 'react';
import { usePaper } from '../context/PaperContext';
import { paperAPI } from '../services/api';
import PaperPreview from '../components/PDFGenerator/PaperPreview';

export default function PaperBuilderPage() {
    const {
        paperConfig, setPaperConfig,
        sectionA, sectionB, sectionC,
        removeFromSection, clearAll, totalMarksCalc,
    } = usePaper();

    const [showPreview, setShowPreview] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const handleConfigChange = (field, value) => {
        setPaperConfig((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!paperConfig.title || !paperConfig.subject) {
            return setError('Title and Subject are required');
        }
        if (sectionA.length === 0 && sectionB.length === 0 && sectionC.length === 0) {
            return setError('Please add at least one question to a section');
        }

        setSaving(true);
        setError('');
        try {
            const paperData = {
                ...paperConfig,
                totalMarks: totalMarksCalc,
                sections: {
                    sectionA: {
                        title: 'Section A — Multiple Choice Questions',
                        instructions: 'Choose the correct answer for each question.',
                        questions: sectionA.map((q) => q._id),
                    },
                    sectionB: {
                        title: 'Section B — Short Answer Questions',
                        instructions: 'Answer the following questions briefly.',
                        questions: sectionB.map((q) => q._id),
                    },
                    sectionC: {
                        title: 'Section C — Descriptive Answer Questions',
                        instructions: 'Answer the following questions in detail.',
                        questions: sectionC.map((q) => q._id),
                    },
                },
            };

            if (paperConfig._id) {
                await paperAPI.update(paperConfig._id, paperData);
            } else {
                const res = await paperAPI.create(paperData);
                // Update config with the new ID so subsequent saves are updates
                setPaperConfig(prev => ({ ...prev, _id: res.data._id }));
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save paper');
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async () => {
        if (!paperConfig._id) {
            return setError('Please save the paper first before submitting');
        }
        setSaving(true);
        setError('');
        try {
            await paperAPI.submit(paperConfig._id);
            setPaperConfig(prev => ({ ...prev, status: 'submitted' }));
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit paper');
        } finally {
            setSaving(false);
        }
    };

    const renderSection = (label, questions, sectionKey) => (
        <div className="section-builder">
            <div className="section-header">
                <h3 className="section-title">{label}</h3>
                <span className="section-count">{questions.length} questions</span>
            </div>
            {questions.length === 0 ? (
                <div className="empty-section">
                    No questions added. Go to Question Bank to add questions.
                </div>
            ) : (
                questions.map((q, i) => (
                    <div key={q._id} className="card question-card" style={{ marginBottom: 'var(--space-sm)' }}>
                        <div className="question-actions">
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => removeFromSection(sectionKey, q._id)}
                            >
                                ✕
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-start' }}>
                            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600, minWidth: 28 }}>
                                {i + 1}.
                            </span>
                            <div>
                                <p className="question-text">{q.questionText}</p>
                                {q.options?.length > 0 && (
                                    <ol className="options-list" type="A">
                                        {q.options.map((opt, j) => <li key={j}>{opt}</li>)}
                                    </ol>
                                )}
                                <div className="question-meta" style={{ marginTop: 'var(--space-sm)' }}>
                                    <span>{q.marks} marks</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    if (showPreview) {
        return (
            <PaperPreview
                paperConfig={{ ...paperConfig, totalMarks: totalMarksCalc }}
                sectionA={sectionA}
                sectionB={sectionB}
                sectionC={sectionC}
                onBack={() => setShowPreview(false)}
            />
        );
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <h1>{paperConfig._id ? 'Edit Paper' : 'Paper Builder'}</h1>
                    {paperConfig.status && (
                        <span className={`badge badge-${paperConfig.status === 'verified' ? 'success' : paperConfig.status === 'submitted' ? 'warning' : 'secondary'}`}>
                            {paperConfig.status.toUpperCase()}
                        </span>
                    )}
                </div>
                <p>{paperConfig._id ? 'Update your existing paper configuration and questions' : 'Configure your paper and arrange questions into sections'}</p>
            </div>

            {/* Paper Config */}
            <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
                <h3 style={{ marginBottom: 'var(--space-lg)' }}>Paper Configuration</h3>
                <div className="paper-config">
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Institute Logo</label>
                        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                            <input
                                type="file"
                                accept="image/png, image/jpeg"
                                className="form-control"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            handleConfigChange('logoUrl', reader.result);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            {paperConfig.logoUrl && (
                                <div style={{ position: 'relative' }}>
                                    <img src={paperConfig.logoUrl} alt="Logo Preview" style={{ height: 40, border: '1px solid #ddd' }} />
                                    <button
                                        onClick={() => handleConfigChange('logoUrl', '')}
                                        style={{
                                            position: 'absolute', top: -5, right: -5, background: 'red', color: 'white',
                                            border: 'none', borderRadius: '50%', width: 15, height: 15, fontSize: 10, cursor: 'pointer'
                                        }}
                                    >✕</button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Paper Title</label>
                        <input className="form-control" placeholder="e.g., Annual Examination 2026"
                            value={paperConfig.title} onChange={(e) => handleConfigChange('title', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Subject</label>
                        <input className="form-control" placeholder="e.g., Biology"
                            value={paperConfig.subject} onChange={(e) => handleConfigChange('subject', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Subject Code</label>
                        <input className="form-control" placeholder="e.g., CS-01"
                            value={paperConfig.subjectCode || ''} onChange={(e) => handleConfigChange('subjectCode', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Class / Grade</label>
                        <input className="form-control" placeholder="e.g., Grade 10"
                            value={paperConfig.className} onChange={(e) => handleConfigChange('className', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Institution Name</label>
                        <input className="form-control" placeholder="e.g., ABC High School"
                            value={paperConfig.institutionName} onChange={(e) => handleConfigChange('institutionName', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Assessment type</label>
                        <input className="form-control" placeholder="e.g., Modular Assessment – I"
                            value={paperConfig.assessmentType} onChange={(e) => handleConfigChange('assessmentType', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Session / Month</label>
                        <input className="form-control" placeholder="e.g., September 2025"
                            value={paperConfig.session} onChange={(e) => handleConfigChange('session', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Exam Date</label>
                        <input className="form-control" placeholder="e.g., September 8, 2025"
                            value={paperConfig.date} onChange={(e) => handleConfigChange('date', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Duration</label>
                        <input className="form-control" placeholder="e.g., 1 Hour 30Minutes"
                            value={paperConfig.duration} onChange={(e) => handleConfigChange('duration', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Total Marks (auto-calculated)</label>
                        <input className="form-control" disabled value={totalMarksCalc} />
                    </div>
                </div>
            </div>

            {/* Sections */}
            {renderSection('Section A — Multiple Choice Questions (MCQs)', sectionA, 'A')}
            {renderSection('Section B — Short Answer Questions', sectionB, 'B')}
            {renderSection('Section C — Descriptive Answer Questions', sectionC, 'C')}

            {/* Actions */}
            {error && <div className="alert alert-error" style={{ maxWidth: 600 }}>⚠️ {error}</div>}
            {saved && <div className="alert alert-success" style={{ maxWidth: 600 }}>✅ Paper saved successfully!</div>}

            <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)', flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-lg" onClick={() => setShowPreview(true)}
                    disabled={sectionA.length === 0 && sectionB.length === 0 && sectionC.length === 0}>
                    📄 Preview & Download PDF
                </button>
                <button className="btn btn-secondary btn-lg" onClick={handleSave} disabled={saving || paperConfig.status === 'verified'}>
                    {saving ? 'Saving...' : (paperConfig._id ? '💾 Update Paper' : '💾 Save Paper')}
                </button>
                {paperConfig._id && paperConfig.status !== 'verified' && (
                    <button
                        className="btn btn-warning btn-lg"
                        onClick={handleSubmit}
                        disabled={saving || paperConfig.status === 'submitted'}
                    >
                        {paperConfig.status === 'submitted' ? '⏳ Submitted' : '🚀 Submit for Verification'}
                    </button>
                )}
                <button className="btn btn-danger" onClick={clearAll}>
                    🗑 Clear All
                </button>
            </div>
        </div>
    );
}
