import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePaper } from '../context/PaperContext';
import { paperAPI } from '../services/api';
import PaperPreview from '../components/PDFGenerator/PaperPreview';

export default function AdminDashboardPage() {
    const { user } = useAuth();
    const { loadPaper } = usePaper();
    const navigate = useNavigate();
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPaper, setSelectedPaper] = useState(null);

    useEffect(() => {
        loadPapers();
    }, []);

    const loadPapers = async () => {
        setLoading(true);
        try {
            const res = await paperAPI.adminGetAll();
            setPapers(res.data);
        } catch (err) {
            setError('Failed to load papers');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id) => {
        try {
            await paperAPI.verify(id);
            loadPapers();
        } catch (err) {
            alert('Failed to verify paper');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this paper? This action cannot be undone.')) return;
        try {
            await paperAPI.delete(id);
            loadPapers();
        } catch (err) {
            alert('Failed to delete paper');
        }
    };

    if (selectedPaper) {
        return (
            <PaperPreview
                paperConfig={selectedPaper}
                sectionA={selectedPaper.sections?.sectionA?.questions || []}
                sectionB={selectedPaper.sections?.sectionB?.questions || []}
                sectionC={selectedPaper.sections?.sectionC?.questions || []}
                onBack={() => setSelectedPaper(null)}
            />
        );
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Admin Portal 🛡️</h1>
                <p>Monitor and verify exam papers from all subjects</p>
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                    <h3 style={{ margin: 0 }}>All Submitted Papers</h3>
                    <button className="btn btn-sm btn-secondary" onClick={loadPapers}>🔄 Refresh</button>
                </div>

                {loading ? (
                    <p>Loading papers...</p>
                ) : error ? (
                    <div className="alert alert-error">{error}</div>
                ) : papers.length === 0 ? (
                    <p style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>No papers found.</p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Subject</th>
                                    <th>Teacher</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {papers.map((paper) => (
                                    <tr key={paper._id}>
                                        <td style={{ fontWeight: 600 }}>{paper.title}</td>
                                        <td>{paper.subject}</td>
                                        <td>{paper.userId?.name || 'Unknown'}</td>
                                        <td>
                                            <span className={`badge badge-${paper.status === 'verified' ? 'success' : paper.status === 'submitted' ? 'warning' : 'secondary'}`}>
                                                {paper.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>{new Date(paper.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
                                                <button className="btn btn-sm btn-primary" title="View & Download" onClick={() => setSelectedPaper(paper)}>📄 View</button>
                                                {paper.status === 'submitted' && (
                                                    <button className="btn btn-sm btn-success" title="Approve Paper" onClick={() => handleVerify(paper._id)}>✅ Verify</button>
                                                )}
                                                <button className="btn btn-sm btn-danger" title="Delete Paper" onClick={() => handleDelete(paper._id)}>🗑️ Delete</button>
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
