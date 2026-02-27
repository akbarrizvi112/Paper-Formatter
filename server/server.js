import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.NODE_PORT || 5000;

// Connect to MongoDB then start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log(`📋 API Health: http://localhost:${PORT}/api/health\n`);
    });
});
