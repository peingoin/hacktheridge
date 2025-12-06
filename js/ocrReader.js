/**
 * ocrReader.js
 * Handles OCR using Tesseract.js
 */

export class OCRReader {
    constructor() {
        this.worker = null;
    }

    // Inside ocrReader.js
    // ...

    async initialize() {
        // 1. Create the worker
        this.worker = await Tesseract.createWorker('eng');

        // 2. Load the language (essential)
        await this.worker.load();

        // 3. Initialize the language (essential)
        await this.worker.loadLanguage('eng');

        // 4. Initialize the Tesseract core
        await this.worker.initialize('eng');

        // (Optional but often useful for better results)
        // await this.worker.setParameters({
        //     tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        // });
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