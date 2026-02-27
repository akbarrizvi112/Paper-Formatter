import { createContext, useContext, useState } from 'react';

const PaperContext = createContext(null);

export const usePaper = () => useContext(PaperContext);

export function PaperProvider({ children }) {
    const [paperConfig, setPaperConfig] = useState({
        title: '',
        subject: '',
        className: '',
        institutionName: '',
        totalMarks: 100,
        duration: '3 hours',
        assessmentType: 'MODULAR ASSESSMENT – I',
        session: 'SEPTEMBER 2025',
        date: '',
        logoUrl: '',
    });

    const [sectionA, setSectionA] = useState([]); // MCQs
    const [sectionB, setSectionB] = useState([]); // Short
    const [sectionC, setSectionC] = useState([]); // Long

    const addToSection = (section, question) => {
        const setter = section === 'A' ? setSectionA : section === 'B' ? setSectionB : setSectionC;
        setter((prev) => {
            if (prev.find((q) => q._id === question._id)) return prev;
            return [...prev, question];
        });
    };

    const removeFromSection = (section, questionId) => {
        const setter = section === 'A' ? setSectionA : section === 'B' ? setSectionB : setSectionC;
        setter((prev) => prev.filter((q) => q._id !== questionId));
    };

    const clearAll = () => {
        setSectionA([]);
        setSectionB([]);
        setSectionC([]);
        setPaperConfig({
            title: '',
            subject: '',
            className: '',
            institutionName: '',
            totalMarks: 100,
            duration: '3 hours',
            assessmentType: 'MODULAR ASSESSMENT – I',
            session: 'SEPTEMBER 2025',
            date: '',
            logoUrl: '',
        });
    };

    const loadPaper = (paper) => {
        setPaperConfig({
            _id: paper._id,
            title: paper.title,
            subject: paper.subject,
            className: paper.className,
            institutionName: paper.institutionName,
            subjectCode: paper.subjectCode || '',
            totalMarks: paper.totalMarks,
            duration: paper.duration,
            assessmentType: paper.assessmentType || 'MODULAR ASSESSMENT – I',
            session: paper.session || 'SEPTEMBER 2025',
            date: paper.date || '',
            logoUrl: paper.logoUrl || '',
        });

        if (paper.sections) {
            setSectionA(paper.sections.sectionA?.questions || []);
            setSectionB(paper.sections.sectionB?.questions || []);
            setSectionC(paper.sections.sectionC?.questions || []);
        }
    };

    const totalMarksCalc =
        sectionA.reduce((s, q) => s + (q.marks || 0), 0) +
        sectionB.reduce((s, q) => s + (q.marks || 0), 0) +
        sectionC.reduce((s, q) => s + (q.marks || 0), 0);

    return (
        <PaperContext.Provider value={{
            paperConfig, setPaperConfig,
            sectionA, setSectionA,
            sectionB, setSectionB,
            sectionC, setSectionC,
            addToSection, removeFromSection, clearAll, loadPaper,
            totalMarksCalc,
        }}>
            {children}
        </PaperContext.Provider>
    );
}
