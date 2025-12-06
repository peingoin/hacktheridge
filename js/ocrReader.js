/**
 * ocrReader.js
 * Handles OCR using Tesseract.js
 */

export class OCRReader {
    constructor() {
        this.worker = null;
    }

    async initialize() {
        this.worker = await Tesseract.createWorker('eng');
    }

    /**
     * Recognize text from canvas
     * @param {HTMLCanvasElement} canvas
     * @returns {Promise<string>}
     */
    async recognizeText(canvas) {
        if (!this.worker) {
            await this.initialize();
        }

        try {
            const { data: { text } } = await this.worker.recognize(canvas);
            return text.trim();
        } catch (error) {
            console.error('OCR Error:', error);
            throw new Error('Failed to recognize text');
        }
    }

    async terminate() {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
        }
    }
}
