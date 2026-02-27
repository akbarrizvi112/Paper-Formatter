import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, VerticalAlign, UnderlineType, ImageRun } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Generates and downloads a Word document from paper data with professional formatting.
 */
export const generateWordDocument = async (paperConfig, sectionA, sectionB, sectionC) => {
    // Helper to romanize numbers like (i), (ii)
    const romanize = (num) => {
        const roms = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi'];
        return `(${roms[num - 1] || num})`;
    };

    const cleanOption = (text) => {
        const s = String(text || '');
        return s.replace(/^[A-Ja-j1-4][\.\)]\s*/, '').replace(/^\([A-Ja-j1-4]\)\s*/, '');
    };

    const getOptionGrid = (options) => {
        if (!options || options.length === 0) return [];
        const maxLen = Math.max(...options.map(opt => cleanOption(opt).length));

        // Decide columns based on length
        let cols = 4;
        if (maxLen > 45) cols = 1;
        else if (maxLen > 25) cols = 2;
        else if (maxLen > 15) cols = 3;

        const rows = [];
        for (let i = 0; i < options.length; i += cols) {
            const rowOptions = options.slice(i, i + cols);
            rows.push(new TableRow({
                children: rowOptions.map((opt, j) => new TableCell({
                    width: { size: 100 / cols, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                    },
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `${String.fromCharCode(97 + i + j)}) ${cleanOption(opt)}`,
                                    font: "Times New Roman",
                                    size: 20
                                }),
                            ],
                        }),
                    ],
                })),
            }));
        }
        return rows;
    };

    // Prepare Logo Content
    let logoElements = [];
    if (paperConfig.logoUrl) {
        try {
            const response = await fetch(paperConfig.logoUrl);
            const blob = await response.blob();
            logoElements = [
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new ImageRun({
                            data: blob,
                            transformation: {
                                width: 80,
                                height: 80,
                            },
                        }),
                    ],
                }),
            ];
        } catch (error) {
            console.error("Error fetching logo for Word export:", error);
        }
    }

    if (logoElements.length === 0) {
        logoElements = [
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({ text: "Teach", bold: true, size: 48, font: "Impact", color: "800000" }),
                ],
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({ text: "TEACH EACH", size: 12, font: "Arial", characterSpacing: 20 }),
                ],
                spacing: { before: 40 },
            }),
        ];
    }

    // Header Table
    const headerTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
            top: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
            bottom: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
            left: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
            right: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
            insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
        },
        rows: [
            new TableRow({
                children: [
                    // Column 1: Logo
                    new TableCell({
                        width: { size: 25, type: WidthType.PERCENTAGE },
                        verticalAlign: VerticalAlign.CENTER,
                        children: logoElements,
                    }),
                    // Column 2: Assessment Titles
                    new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        verticalAlign: VerticalAlign.CENTER,
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({ text: (paperConfig.assessmentType || "MODULAR ASSESSMENT – I").toUpperCase(), bold: true, underline: { type: UnderlineType.SINGLE }, font: "Times New Roman", size: 28 }),
                                ],
                            }),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({ text: (paperConfig.session || "SEPTEMBER 2025").toUpperCase(), bold: true, underline: { type: UnderlineType.SINGLE }, font: "Times New Roman", size: 28 }),
                                ],
                            }),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({ text: (paperConfig.subject || "COMPUTER XI").toUpperCase(), bold: true, underline: { type: UnderlineType.SINGLE }, font: "Times New Roman", size: 28 }),
                                ],
                            }),
                        ],
                    }),
                    // Column 3: Metadata
                    new TableCell({
                        width: { size: 25, type: WidthType.PERCENTAGE },
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: "Time: ", bold: true, font: "Times New Roman", size: 18 }),
                                    new TextRun({ text: paperConfig.duration || "1 Hour 30Minutes", font: "Times New Roman", size: 18 }),
                                ],
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({ text: "Max. Marks: ", bold: true, font: "Times New Roman", size: 18 }),
                                    new TextRun({ text: String(paperConfig.totalMarks || 30), font: "Times New Roman", size: 18 }),
                                ],
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({ text: "Date: ", bold: true, font: "Times New Roman", size: 18 }),
                                    new TextRun({ text: paperConfig.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), font: "Times New Roman", size: 18 }),
                                ],
                            }),
                        ],
                    }),
                ],
            }),
        ],
    });

    const docChildren = [headerTable];

    // Section A
    if (sectionA && sectionA.length > 0) {
        docChildren.push(new Paragraph({ spacing: { before: 400 } }));
        docChildren.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: "SECTION 'A'", bold: true, underline: { type: UnderlineType.SINGLE }, size: 28, font: "Times New Roman" }),
            ],
        }));
        docChildren.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: "MULTIPLE CHOICE QUESTIONS", bold: true, size: 24, font: "Times New Roman" }),
            ],
        }));
        docChildren.push(new Paragraph({
            children: [
                new TextRun({ text: "Note: This section consists of 1 part. Answer all questions in this part, each question carries 1 mark.", bold: true, font: "Times New Roman", size: 20 }),
            ],
            spacing: { before: 200, bottom: 100 },
        }));
        docChildren.push(new Paragraph({
            children: [
                new TextRun({ text: "1. Choose the correct answer for each from the given options.", font: "Times New Roman", size: 22 }),
            ],
            spacing: { bottom: 200 },
        }));

        sectionA.forEach((q, i) => {
            docChildren.push(new Paragraph({
                children: [
                    new TextRun({ text: `${romanize(i + 1)} `, font: "Times New Roman", size: 22, bold: true }),
                    new TextRun({ text: q.questionText, font: "Times New Roman", size: 22 }),
                ],
                spacing: { before: 150 },
            }));

            if (q.options?.length > 0) {
                const optionsTable = new Table({
                    width: { size: 90, type: WidthType.PERCENTAGE },
                    indent: { size: 720, type: WidthType.DXA },
                    borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                        insideHorizontal: { style: BorderStyle.NONE },
                        insideVertical: { style: BorderStyle.NONE },
                    },
                    rows: getOptionGrid(q.options),
                });
                docChildren.push(optionsTable);
            }
        });
    }

    // Section B
    if (sectionB && sectionB.length > 0) {
        docChildren.push(new Paragraph({ spacing: { before: 600 } }));
        docChildren.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: "SECTION 'B'", bold: true, underline: { type: UnderlineType.SINGLE }, size: 28, font: "Times New Roman" }),
            ],
        }));
        docChildren.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: "(Short Answer Questions)", bold: true, size: 24, font: "Times New Roman" }),
            ],
        }));
        docChildren.push(new Paragraph({
            children: [
                new TextRun({ text: `2. Answer any ${sectionB.length} parts questions. All questions carry equal marks.`, font: "Times New Roman", size: 24 }),
            ],
            spacing: { before: 200, bottom: 200 },
        }));

        sectionB.forEach((q, i) => {
            docChildren.push(new Paragraph({
                children: [
                    new TextRun({ text: `${romanize(i + 1)} `, font: "Times New Roman", size: 22, bold: true }),
                    new TextRun({ text: q.questionText, font: "Times New Roman", size: 22 }),
                    new TextRun({ text: `\t(${q.marks})`, bold: true, font: "Times New Roman", size: 20 }),
                ],
                spacing: { before: 200 },
                tabStops: [{ type: "right", position: 9000 }],
            }));
        });
    }

    // Section C
    if (sectionC && sectionC.length > 0) {
        docChildren.push(new Paragraph({ spacing: { before: 600 } }));
        docChildren.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: "SECTION 'C'", bold: true, underline: { type: UnderlineType.SINGLE }, size: 28, font: "Times New Roman" }),
            ],
        }));
        docChildren.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: "(Descriptive Answer Questions)", bold: true, size: 24, font: "Times New Roman" }),
            ],
        }));
        docChildren.push(new Paragraph({
            children: [
                new TextRun({ text: `NOTE: Answer any ${sectionC.length} of the following question. All question carry equal marks`, bold: true, font: "Times New Roman", size: 22 }),
            ],
            spacing: { before: 200, bottom: 200 },
        }));

        sectionC.forEach((q, i) => {
            docChildren.push(new Paragraph({
                children: [
                    new TextRun({ text: `Q.${3 + i} `, bold: true, font: "Times New Roman", size: 22 }),
                    new TextRun({ text: q.questionText, font: "Times New Roman", size: 22 }),
                    new TextRun({ text: `\t(${q.marks})`, bold: true, font: "Times New Roman", size: 20 }),
                ],
                spacing: { before: 300 },
                tabStops: [{ type: "right", position: 9000 }],
            }));
        });
    }

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    size: {
                        width: 11906,
                        height: 16838,
                    },
                    margin: {
                        top: 720, // 0.5 inch
                        right: 720,
                        bottom: 720,
                        left: 720,
                    },
                },
            },
            children: docChildren,
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${paperConfig.title || 'exam-paper'}.docx`);
};
