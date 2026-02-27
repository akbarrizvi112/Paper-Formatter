import { Document, Page, Text, View, StyleSheet, Font, pdf, Image } from '@react-pdf/renderer';
import { useState } from 'react';
import { generateWordDocument } from '../../utils/wordGenerator';

// Register Inter font (fallback to Helvetica if unavailable)
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Times-Roman',
        fontSize: 10,
        lineHeight: 1.4,
        color: '#000',
    },
    // New Teach Each Header Styles
    headerTable: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#000',
        marginBottom: 15,
        minHeight: 70,
    },
    headerColLeft: {
        width: '25%',
        borderRightWidth: 1,
        borderRightColor: '#000',
        padding: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerColCenter: {
        width: '50%',
        borderRightWidth: 1,
        borderRightColor: '#000',
        padding: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    headerColRight: {
        width: '25%',
        padding: 5,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    logoMain: {
        fontSize: 24,
        fontFamily: 'Helvetica-Bold',
        color: '#800000', // Maroon-ish like the logo
    },
    logoSub: {
        fontSize: 8,
        letterSpacing: 2,
        marginTop: -5,
        color: '#333',
    },
    headerTitleText: {
        fontSize: 11,
        fontFamily: 'Times-Bold',
        textDecoration: 'underline',
        textAlign: 'center',
    },
    headerMetaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 9,
        fontFamily: 'Times-Bold',
        borderBottomWidth: 0.5,
        borderBottomColor: '#eee',
        paddingBottom: 2,
        marginBottom: 2,
    },
    headerMetaLabel: {
        width: '50%',
    },
    headerMetaValue: {
        width: '50%',
        textAlign: 'right',
    },
    // MCQ Styles
    mcqContainer: {
        marginBottom: 8,
    },
    mcqHeader: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    mcqNumber: {
        width: 25,
        fontSize: 10,
    },
    mcqText: {
        flex: 1,
        fontSize: 10,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingLeft: 25,
        justifyContent: 'space-between',
    },
    optionItem: {
        width: '25%',
        fontSize: 10,
        marginBottom: 4,
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        color: '#666',
        borderTopWidth: 0.5,
        borderTopColor: '#eee',
        paddingTop: 5,
    },
    sectionBox: {
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    sectionLetter: {
        fontSize: 14,
        fontFamily: 'Times-Bold',
        textDecoration: 'underline',
    },
    sectionName: {
        fontSize: 14,
        fontFamily: 'Times-Bold',
    },
    instructionText: {
        fontSize: 12,
        marginBottom: 10,
    },
    noteText: {
        fontSize: 10,
        fontFamily: 'Times-Bold',
        marginBottom: 10,
    },
});

const romanize = (num) => {
    const lookup = [
        ['m', 1000], ['cm', 900], ['d', 500], ['cd', 400],
        ['c', 100], ['xc', 90], ['l', 50], ['xl', 40],
        ['x', 10], ['ix', 9], ['v', 5], ['iv', 4], ['i', 1]
    ];
    let roman = '';
    for (let [label, value] of lookup) {
        while (num >= value) {
            roman += label;
            num -= value;
        }
    }
    return `(${roman})`;
};

const cleanOption = (text) => {
    const s = String(text || '');
    return s.replace(/^[A-Ja-j1-4][\.\)]\s*/, '').replace(/^\([A-Ja-j1-4]\)\s*/, '');
};

const getOptionColumnWidth = (options) => {
    if (!options || options.length === 0) return '25%';
    const maxLen = Math.max(...options.map(opt => cleanOption(opt).length));
    if (maxLen > 45) return '100%';
    if (maxLen > 25) return '50%';
    if (maxLen > 15) return '33.3%';
    return '25%';
};

function PaperDocument({ paperConfig = {}, sectionA = [], sectionB = [], sectionC = [] }) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header Section */}
                <View style={styles.headerTable}>
                    {/* Column 1: Logo */}
                    <View style={styles.headerColLeft}>
                        {paperConfig.logoUrl ? (
                            <Image src={paperConfig.logoUrl} style={{ width: 60, height: 'auto' }} />
                        ) : (
                            <>
                                <Text style={styles.logoMain}>Teach</Text>
                                <Text style={styles.logoSub}>teach each</Text>
                            </>
                        )}
                    </View>

                    {/* Column 2: Assessment Titles */}
                    <View style={styles.headerColCenter}>
                        <Text style={styles.headerTitleText}>{paperConfig.assessmentType || 'MODULAR ASSESSMENT – I'}</Text>
                        <Text style={styles.headerTitleText}>{paperConfig.session || 'SEPTEMBER 2025'}</Text>
                        <Text style={styles.headerTitleText}>{paperConfig.subject || 'COMPUTER XI'}</Text>
                    </View>

                    {/* Column 3: Metadata */}
                    <View style={styles.headerColRight}>
                        <View style={styles.headerMetaRow}>
                            <Text>Time:</Text>
                            <Text>{paperConfig.duration || '1 Hour 30Minutes'}</Text>
                        </View>
                        <View style={styles.headerMetaRow}>
                            <Text>Max. Marks:</Text>
                            <Text>{paperConfig.totalMarks || 30}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', fontSize: 9, fontFamily: 'Times-Bold' }}>
                            <Text>Date:</Text>
                            <Text style={{ marginLeft: 0 }}>{paperConfig.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
                        </View>
                    </View>
                </View>

                {/* Section A — MCQs */}
                <View style={styles.sectionBox}>
                    <Text style={styles.sectionLetter}>SECTION 'A'</Text>
                    <Text style={styles.sectionName}>MULTIPLE CHOICE QUESTIONS</Text>
                </View>

                {/* <Text style={styles.noteText}>Note: This section consists of 1 part. Answer all questions in this part, each question carries 1 mark.</Text> */}
                <Text style={styles.instructionText}>1. Choose the correct answer for each from the given options.</Text>

                {sectionA.map((q, i) => (
                    <View key={q._id || i} style={styles.mcqContainer}>
                        <View style={styles.mcqHeader}>
                            <Text style={styles.mcqNumber}>{romanize(i + 1)}</Text>
                            <Text style={styles.mcqText}>{q.questionText}</Text>
                        </View>
                        {q.options && q.options.length > 0 && (
                            <View style={[styles.optionsGrid, { justifyContent: 'flex-start' }]}>
                                {q.options.map((opt, j) => (
                                    <Text key={j} style={[styles.optionItem, { width: getOptionColumnWidth(q.options) }]}>
                                        {String.fromCharCode(97 + j)}) {cleanOption(opt)}
                                    </Text>
                                ))}
                            </View>
                        )}
                    </View>
                ))}

                {/* Section B — Short Answers */}
                {sectionB && sectionB.length > 0 && (
                    <View wrap={true}>
                        <View style={styles.sectionBox}>
                            <Text style={styles.sectionLetter}>SECTION 'B'</Text>
                            <Text style={styles.sectionName}>(Short Answer Questions)</Text>
                        </View>
                        <Text style={styles.noteText}>Note: Answer any {sectionB.length} questions from this section. Each question carries marks as mentioned.</Text>
                        {sectionB.map((q, i) => (
                            <View key={q._id || i} style={styles.mcqContainer}>
                                <View style={styles.mcqHeader}>
                                    <View style={{ flexDirection: 'row', flex: 1 }}>
                                        <Text style={styles.mcqNumber}>Q.2 {romanize(i + 1)}</Text>
                                        <Text style={styles.mcqText}>{q.questionText || ''}</Text>
                                    </View>
                                    <Text style={{ width: 40, textAlign: 'right', fontSize: 9 }}>({q.marks || 0})</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Section C — Descriptive Answers */}
                {sectionC && sectionC.length > 0 && (
                    <View wrap={true}>
                        <View style={styles.sectionBox}>
                            <Text style={styles.sectionLetter}>SECTION 'C'</Text>
                            <Text style={styles.sectionName}>(Descriptive Answer Questions)</Text>
                        </View>
                        <Text style={styles.noteText}>
                            Note: Answer any {sectionC.length} questions from this section. Each question carries marks as mentioned.
                        </Text>

                        {sectionC.map((q, i) => {
                            // Starting Q number (e.g., 3 for Section C)
                            const questionNumber = 3 + i;

                            return (
                                <View key={q._id || i} style={styles.mcqContainer}>
                                    <View style={styles.mcqHeader}>
                                        <View style={{ flexDirection: 'row', flex: 1 }}>
                                            <Text style={styles.mcqNumber}>Q.{questionNumber}</Text>
                                            <Text style={styles.mcqText}>{q.questionText || ''}</Text>
                                        </View>
                                        <Text style={{ width: 40, textAlign: 'right', fontSize: 9 }}>
                                            ({q.marks || 0})
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Footer */}
                <Text style={styles.footer} fixed render={({ pageNumber, totalPages }) => (
                    `Page ${pageNumber} of ${totalPages} — ${paperConfig.subjectCode || ''}`
                )} />
            </Page>
        </Document>
    );
}

export default function PaperPreview({ paperConfig, sectionA, sectionB, sectionC, onBack }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingWord, setIsGeneratingWord] = useState(false);

    const handleDownloadPDF = async () => {
        try {
            setIsGenerating(true);
            const doc = <PaperDocument paperConfig={paperConfig} sectionA={sectionA} sectionB={sectionB} sectionC={sectionC} />;
            const blob = await pdf(doc).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${paperConfig.title || 'exam-paper'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadWord = async () => {
        try {
            setIsGeneratingWord(true);
            await generateWordDocument(paperConfig, sectionA, sectionB, sectionC);
        } catch (error) {
            console.error('Word generation failed:', error);
            alert('Failed to generate Word document. Please try again.');
        } finally {
            setIsGeneratingWord(false);
        }
    };

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1>Paper Preview</h1>
                    <p>Review your paper and download as PDF</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    <button className="btn btn-secondary" onClick={onBack}>← Back to Editor</button>
                    <button
                        className="btn btn-outline-primary"
                        onClick={handleDownloadWord}
                        disabled={isGeneratingWord}
                    >
                        {isGeneratingWord ? '⏳ Generating Word...' : '📥 Download Word'}
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleDownloadPDF}
                        disabled={isGenerating}
                    >
                        {isGenerating ? '⏳ Generating PDF...' : '📥 Download PDF'}
                    </button>
                </div>
            </div>

            {/* Preview Card */}
            <div className="card biek-preview" style={{ maxWidth: 850, margin: '0 auto', padding: 'var(--space-2xl)', background: '#ffffff', color: '#000', fontFamily: '"Times New Roman", Times, serif' }}>
                <div style={{
                    display: 'flex',
                    border: '1.5px solid #000',
                    marginBottom: 20,
                    minHeight: 100
                }}>
                    {/* Column 1: Logo */}
                    <div style={{
                        width: '25%',
                        borderRight: '1.5px solid #000',
                        padding: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {paperConfig.logoUrl ? (
                            <img src={paperConfig.logoUrl} alt="Institute Logo" style={{ maxWidth: '100%', maxHeight: 80 }} />
                        ) : (
                            <>
                                <div style={{ fontSize: '32px', fontWeight: '900', color: '#800000', fontStyle: 'italic', lineHeight: 1 }}>Teach</div>
                                <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginTop: 2 }}>Teach Each</div>
                            </>
                        )}
                    </div>

                    {/* Column 2: Assessment Titles */}
                    <div style={{
                        width: '50%',
                        borderRight: '1.5px solid #000',
                        padding: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                    }}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', textDecoration: 'underline' }}>{paperConfig.assessmentType || 'MODULAR ASSESSMENT – I'}</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', textDecoration: 'underline' }}>{paperConfig.session || 'SEPTEMBER 2025'}</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', textDecoration: 'underline' }}>{paperConfig.subject || 'COMPUTER XI'}</div>
                    </div>

                    {/* Column 3: Metadata */}
                    <div style={{
                        width: '25%',
                        padding: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1.5px solid #000000ff' }}>
                            <span>Time:</span>
                            <span>{paperConfig.duration || '1 Hour 30Minutes'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1.5px solid #000000ff' }}>
                            <span>Max. Marks:</span>
                            <span>{paperConfig.totalMarks || 30}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Date:</span>
                            <span>{paperConfig.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: 15 }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', textDecoration: 'underline' }}>SECTION 'A'</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>MULTIPLE CHOICE QUESTIONS</div>
                </div>

                <p style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: 5 }}>Note: This section consists of 1 part. Answer all questions in this part, each question carries 1 mark.</p>
                <p style={{ fontSize: '14px', marginBottom: 15 }}>1. Choose the correct answer for each from the given options.</p>

                {sectionA.map((q, i) => (
                    <div key={q._id || i} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <span style={{ minWidth: 25 }}>({['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi'][i] || i + 1})</span>
                            <span style={{ flex: 1 }}>{q.questionText}</span>
                        </div>
                        {q.options?.length > 0 && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(auto-fit, minmax(${getOptionColumnWidth(q.options) === '100%' ? '100%' :
                                    getOptionColumnWidth(q.options) === '50%' ? '45%' :
                                        getOptionColumnWidth(q.options) === '33.3%' ? '30%' : '22%'
                                    }, 1fr))`,
                                paddingLeft: 35,
                                gap: '4px 20px',
                                marginTop: 5
                            }}>
                                {q.options.map((opt, j) => (
                                    <span key={j} style={{ fontSize: '13px' }}>
                                        {String.fromCharCode(97 + j)}) {opt.replace(/^[A-Ja-j1-4][\.\)]\s*/, '').replace(/^\([A-Ja-j1-4]\)\s*/, '')}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                {/* Section B */}
                {sectionB?.length > 0 && (
                    <>
                        <div style={{ textAlign: 'center', margin: '25px 0 15px' }}>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', textDecoration: 'underline' }}>SECTION 'B'</div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>(Short Answer Questions)</div>
                        </div>
                        {/* <p style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: 10 }}>Note: Answer any {sectionB.length} questions from this section.</p> */}
                        <p style={{ fontSize: '14px', marginBottom: 15 }}>2.   Answer any {sectionB.length} parts questions. All questions carry equal marks</p>

                        {sectionB.map((q, i) => (
                            <div key={q._id || i} style={{ marginBottom: 15, display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <span style={{ minWidth: 25 }}>({['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi'][i] || i + 1})</span>
                                    <span>{q.questionText}</span>
                                </div>
                                <span style={{ fontWeight: 'bold' }}>({q.marks})</span>
                            </div>
                        ))}
                    </>
                )}

                {/* Section C */}
                {sectionC?.length > 0 && (
                    <>
                        <div style={{ textAlign: 'center', margin: '25px 0 15px' }}>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', textDecoration: 'underline' }}>SECTION 'C'</div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>(Descriptive Answer Questions)</div>
                        </div>
                        <p style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: 10 }}>NOTE: Answer any {sectionC.length} of the following question. All question carry equal marks</p>
                        {sectionC.map((q, i) => (
                            <div key={q._id || i} style={{ marginBottom: 15, display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <span style={{ minWidth: 45, fontWeight: 'bold' }}>
                                        Q.{3 + i}
                                    </span>
                                    <span>{q.questionText}</span>
                                </div>
                                <span style={{ fontWeight: 'bold' }}>({q.marks})</span>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
