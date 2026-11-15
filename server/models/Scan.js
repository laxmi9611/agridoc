const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
    disease: String,
    solution: String,
    confidence: Number,
    status: String,
    imageUrl: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Scan', scanSchema);