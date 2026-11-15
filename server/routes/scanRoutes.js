const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const Scan = require('../models/Scan');

const upload = multer({ storage: multer.memoryStorage() });

// TEMPORARY TEST ROUTE
router.get('/test', (req, res) => {
    console.log("🔥 TEST ROUTE HIT! The backend is working.");
    res.json({ message: "Backend is working!" });
});

router.post('/analyze', upload.single('image'), async (req, res) => {
    console.log("📥 Node Backend received an image! Sending to Python AI...");
    
    try {
        if (!req.file) {
            console.log("❌ No file found in request");
            return res.status(400).json({ message: "No image provided" });
        }

        const formData = new FormData();
        formData.append('image', req.file.buffer, {
            filename: 'leaf.jpg',
            contentType: req.file.mimetype
        });

        // Send to Python
        console.log("🐍 Sending request to Python at http://localhost:8000/predict");
        const aiResponse = await axios.post('http://localhost:8000/predict', formData, {
            headers: { ...formData.getHeaders() },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        const aiResult = aiResponse.data;
        console.log("🤖 Python AI Response:", aiResult);

        const newScan = await Scan.create({
            disease: aiResult.disease,
            solution: aiResult.solution,
            confidence: aiResult.confidence,
            status: aiResult.status
        });

        console.log("✅ Scan saved to MongoDB!");
        res.json(newScan);
    } catch (err) {
        console.error("🔥 Backend Error:", err.message);
        res.status(500).json({ message: "Failed to analyze image.", error: err.message });
    }
});

router.get('/history', async (req, res) => {
    try {
        const scans = await Scan.find().sort({ createdAt: -1 });
        res.json(scans);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;