import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const PYTHON_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

/**
 * Call the Python NLP service to extract and classify questions from categorized documents
 * @param {Object} filePaths - { mcq, short, long } absolute paths
 * @param {string} topic - Topic to filter questions by
 * @returns {Object} { raw_text, questions: [...] }
 */
export const extractQuestions = async (filePath, topic, source = 'notes') => {
    try {
        const response = await axios.post(`${PYTHON_URL}/extract`, {
            file_path: filePath,
            topic,
            source,
        });
        return response.data;
    } catch (error) {
        console.error('Python service error:', error.message);
        throw new Error('Failed to extract questions from document');
    }
};

/**
 * Call the Python NLP service to extract and classify questions from categorized documents
 * @param {Object} filePaths - { mcq, short, long } absolute paths
 * @param {string} topic - Topic to filter questions by
 * @returns {Object} { raw_text, questions: [...] }
 */
export const extractCategorizedQuestions = async (filePaths, topic) => {
    try {
        const response = await axios.post(`${PYTHON_URL}/extract-categorized`, {
            mcq_file_path: filePaths.mcq || null,
            short_file_path: filePaths.short || null,
            long_file_path: filePaths.long || null,
            topic,
        });
        return response.data;
    } catch (error) {
        console.error('Python service error:', error.message);
        throw new Error('Failed to extract questions from categorized documents');
    }
};
