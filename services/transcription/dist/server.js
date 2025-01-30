"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const transformers_1 = require("@xenova/transformers");
const app = (0, express_1.default)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post('/transcribe', upload.single('audio'), async (req, res) => {
    var _a;
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No audio file provided' });
            return;
        }
        const audioData = new Float32Array(req.file.buffer);
        const transcriber = await (0, transformers_1.pipeline)('automatic-speech-recognition', 'Xenova/whisper-small', {
            quantized: true
        });
        const result = await transcriber(audioData, {
            chunk_length_s: 30,
            stride_length_s: 5
        });
        const text = Array.isArray(result)
            ? ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.text) || ''
            : 'text' in result ? result.text : '';
        res.json({ text });
    }
    catch (error) {
        console.error('Transcription error:', error);
        res.status(500).json({ error: error.message || 'Transcription failed' });
    }
});
app.get('/health', (_, res) => {
    res.json({ status: 'healthy' });
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Transcription service running on port ${PORT}`));
