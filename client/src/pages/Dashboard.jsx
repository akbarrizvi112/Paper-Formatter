import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePaper } from '../context/PaperContext';
import { useNavigate } from 'react-router-dom';
import { questionAPI, paperAPI, uploadAPI } from '../services/api';

export default function Dashboard() {
    const { user } = useAuth();
    const { loadPaper, clearAll } = usePaper();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ questions: 0, papers: 0, documents: 0 });
    const [recentPapers, setRecentPapers] = useState([]);

    const handleEdit = async (paperId) => {
        try {
            const res = await paperAPI.getById(paperId);
            loadPaper(res.data);
            navigate('/builder');
        } catch (err) {
            console.error('Failed to load paper for editing:', err);
            alert('Failed to load paper. Please try again.');
        }
    };

    const handleDelete = async (paperId) => {
        if (!window.confirm('Are you sure you want to delete this paper?')) return;
        try {
            await paperAPI.delete(paperId);
            loadStats();
        } catch (err) {
            console.error('Failed to delete paper:', err);
            alert('Failed to delete paper. Please try again.');
        }
    };

    const handleCreateNew = () => {
        clearAll();
        navigate('/builder');
    };

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [qRes, pRes, dRes] = await Promise.all([
                questionAPI.getAll({}),
                paperAPI.getAll(),
                uploadAPI.getDocuments(),
            ]);
            setStats({
                questions: qRes.data.length,
                papers: pRes.data.length,
                documents: dRes.data.length,
            });
            setRecentPapers(pRes.data.slice(0, 5));
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Welcome back, {user?.name || 'Teacher'} 👋</h1>
                <p>Create and manage your exam papers with ease</p>
            </div>

            <div className="stat-cards">
                <div className="card stat-card slide-up clickable" style={{ animationDelay: '0.1s' }} onClick={() => navigate('/upload')}>
                    <div className="stat-icon blue">📄</div>
                    <div className="stat-value">{stats.documents}</div>
                    <div className="stat-label">Documents Uploaded</div>
                </div>
                <div className="card stat-card slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="stat-icon green">❓</div>
                    <div className="stat-value">{stats.questions}</div>
                    <div className="stat-label">Questions Extracted</div>
                </div>
                <div className="card stat-card slide-up clickable" style={{ animationDelay: '0.3s' }} onClick={handleCreateNew}>
                    <div className="stat-icon gold">📝</div>
                    <div className="stat-value">{stats.papers}</div>
                    <div className="stat-label">Papers Created</div>
                </div>
            </div>

            <div className="card slide-up" style={{ animationDelay: '0.4s' }}>
                <h3 style={{ marginBottom: 'var(--space-md)' }}>Recent Papers</h3>
                {recentPapers.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                        No papers created yet. Start by uploading documents and building your first paper!
                    </p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Subject</th>
                                    <th>Status</th>
                                    <th>Total Marks</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentPapers.map((p) => (
                                    <tr key={p._id}>
                                        <td>{p.title}</td>
                                        <td>{p.subject}</td>
                                        <td>
                                            <span className={`badge badge-${p.status === 'verified' ? 'success' : p.status === 'submitted' ? 'warning' : 'secondary'}`}>
                                                {p.status ? p.status.toUpperCase() : 'DRAFT'}
                                            </span>
                                        </td>
                                        <td>{p.totalMarks}</td>
                                        <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                                <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(p._id)}>
                                                    ✏️ Edit
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
