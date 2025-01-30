import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { pipeline } from '@xenova/transformers';
const app = express();
const upload = multer({ storage: multer.memoryStorage() });
// Add more detailed logging
console.log('Starting transcription service...');
console.log('Node environment:', process.env.NODE_ENV);
app.use(cors());
app.use(express.json());
// Add a root route for debugging
app.get('/', (_, res) => {
    res.json({ message: 'Transcription service is running' });
});
app.post('/transcribe', upload.single('audio'), async (req, res) => {
    var _a;
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No audio file provided' });
            return;
        }
        const audioData = new Float32Array(req.file.buffer);
        const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small', {
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
app.listen(PORT, () => {
    console.log(`Transcription service running on port ${PORT}`);
    console.log('Available routes:');
    console.log('- GET /');
    console.log('- GET /health');
    console.log('- POST /transcribe');
});
