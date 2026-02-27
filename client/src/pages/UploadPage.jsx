import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadAPI } from '../services/api';

const FileSlot = ({ category, file, onDrop, label, icon }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (accepted) => onDrop(category, accepted),
        accept: {
            'application/pdf': ['.pdf'],
        },
        maxFiles: 1,
    });

    return (
        <div className="form-group">
            <label>{label}</label>
            <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
                style={{
                    padding: 'var(--space-md)',
                    borderStyle: 'dashed',
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-alt)',
                    transition: 'all 0.2s ease'
                }}
            >
                <input {...getInputProps()} />
                {file ? (
                    <div className="file-selected">
                        <span style={{ fontSize: '1.5rem' }}>📄</span>
                        <div style={{ fontWeight: '500', marginTop: '4px' }}>{file.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                            {(file.size / 1024).toFixed(1)} KB
                        </div>
                    </div>
                ) : (
                    <div className="dropzone-placeholder">
                        <span style={{ fontSize: '1.5rem', opacity: 0.7 }}>{icon}</span>
                        <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>
                            {isDragActive ? 'Drop here' : `Click or drag PDF`}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function UploadPage() {
    const [files, setFiles] = useState({
        mcq: null,
        short: null,
        long: null
    });
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleDrop = (category, acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setFiles(prev => ({ ...prev, [category]: acceptedFiles[0] }));
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const hasAnyFile = Object.values(files).some(f => f !== null);
        if (!hasAnyFile) return setError('Please upload at least one PDF file');
        if (!topic.trim()) return setError('Please enter a topic');

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const formData = new FormData();
            if (files.mcq) formData.append('mcq', files.mcq);
            if (files.short) formData.append('short', files.short);
            if (files.long) formData.append('long', files.long);
            formData.append('topic', topic);

            const { data } = await uploadAPI.uploadCategorized(formData);
            setResult(data);
            setFiles({ mcq: null, short: null, long: null });
            setTopic('');
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed. Make sure the Python service is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Categorized Question Extraction</h1>
                <p>Upload specific PDFs for each question type to ensure accurate categorization</p>
            </div>

            <div className="card" style={{ maxWidth: 900, margin: '0 auto' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                        <FileSlot
                            category="mcq"
                            file={files.mcq}
                            onDrop={handleDrop}
                            label="1. MCQs PDF"
                            icon="🔢"
                        />
                        <FileSlot
                            category="short"
                            file={files.short}
                            onDrop={handleDrop}
                            label="2. Short Questions PDF"
                            icon="📝"
                        />
                        <FileSlot
                            category="long"
                            file={files.long}
                            onDrop={handleDrop}
                            label="3. Long Questions PDF"
                            icon="📜"
                        />
                    </div>

                    <div className="form-group" style={{ maxWidth: 500, margin: '0 auto var(--space-xl) auto' }}>
                        <label htmlFor="topic">Topic Name (e.g. Physics, History)</label>
                        <input
                            type="text"
                            id="topic"
                            className="form-control"
                            placeholder="Enter the specific topic to extract..."
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            style={{ textAlign: 'center', fontSize: '1.1rem' }}
                        />
                    </div>

                    {error && <div className="alert alert-error" style={{ marginBottom: 'var(--space-lg)' }}>⚠️ {error}</div>}

                    <div style={{ textAlign: 'center' }}>
                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ minWidth: 300 }}>
                            {loading ? (
                                <>
                                    <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                                    Extracting Questions...
                                </>
                            ) : (
                                <>🚀 Extract Questions from All Categories</>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Results */}
            {result && (
                <div className="card slide-up" style={{ marginTop: 'var(--space-xl)', maxWidth: 900, margin: 'var(--space-xl) auto 0 auto' }}>
                    <div className="alert alert-success">
                        ✅ Successfully extracted {result.questionsExtracted} questions!
                    </div>

                    <h3 style={{ margin: 'var(--space-lg) 0' }}>Extracted Questions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 'var(--space-md)' }}>
                        {result.questions.map((q, i) => (
                            <div key={i} className="card question-card" style={{ height: 'fit-content' }}>
                                <span className={`question-type-badge badge-${q.type}`}>{q.type}</span>
                                <p className="question-text">{q.questionText}</p>
                                {q.options?.length > 0 && (
                                    <ol className="options-list" type="A">
                                        {q.options.map((opt, j) => <li key={j}>{opt}</li>)}
                                    </ol>
                                )}
                                <div className="question-meta">
                                    <span>📊 {q.marks} marks</span>
                                    <span>🎯 {q.difficulty}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
