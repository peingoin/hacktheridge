/**
 * main.js
 * Main application orchestration and state management for voice workflow
 */

import { CameraManager } from './camera.js';
import { OCRReader } from './ocrReader.js';
import { SpeechManager } from './speechManager.js';
import { UIManager } from './ui.js';
import { WakeWordDetector } from './wakeWordDetector.js';
import { VoiceCommands } from './voiceCommands.js';
import { GeminiCleaner } from './geminiCleaner.js';

class BracketReaderApp {
    constructor() {
        this.camera = null;
        this.ocrReader = null;
        this.speechManager = null;
        this.ui = null;
        this.wakeWordDetector = null;
        this.voiceCommands = null;
        this.geminiCleaner = null;

        this.videoElement = null;

        this.isProcessing = false;
        this.listeningForCommand = false;
    }

    async initialize() {
        try {
            // Get DOM elements
            this.videoElement = document.getElementById('cameraPreview');
            this.ui = new UIManager();
            this.ui.setStatus('Initializing camera...');

            // Initialize camera (video only)
            this.camera = new CameraManager(this.videoElement);
            await this.camera.initialize();

            // Initialize components
            this.ocrReader = new OCRReader();
            this.speechManager = new SpeechManager();
            this.speechManager.setRate(this.ui.getSpeechRate());
            this.geminiCleaner = new GeminiCleaner();

            // Initialize wake word + commands
            this.ui.setStatus('Initializing wake word...');
            this.wakeWordDetector = new WakeWordDetector({
                onWakeWord: () => this.onWakeWordDetected(),
                onError: (message) => this.ui.setStatus(message, 'error'),
                onStateChange: (active) => this.ui.showWakeWordListening(active)
            });
            await this.wakeWordDetector.initialize();

            this.voiceCommands = new VoiceCommands({
                onListeningStart: () => this.ui.showCommandListening(),
                onListeningEnd: () => this.ui.showWakeWordListening(true),
                onResult: (text) => this.ui.showCommandRecognized(text),
                onError: (message) => this.ui.setStatus(message, 'error')
            });

            // Setup event handlers
            this.setupEventHandlers();

            await this.wakeWordDetector.startListening();

            this.ui.setStatus('Say "Hey Tato" to activate voice commands', 'success');
            this.ui.setInstructions('Say "Hey Tato" then give a command');
            this.ui.setReadButtonEnabled(true);
        } catch (error) {
            console.error('Initialization error:', error);
            this.ui?.setStatus('Error: ' + error.message, 'error');
        }
    }

    setupEventHandlers() {
        // Read button
        this.ui.onReadButtonClick(async () => {
            await this.handleRead();
        });

        // Repeat button
        this.ui.onRepeatButtonClick(() => {
            this.handleRepeat();
        });

        // Stop button
        this.ui.onStopButtonClick(() => {
            this.handleStop();
        });

        // Speech rate
        this.ui.onSpeechRateChange((rate) => {
            this.speechManager.setRate(rate);
        });
    }

    async onWakeWordDetected() {
        if (this.listeningForCommand) return;
        this.listeningForCommand = true;

        await this.wakeWordDetector.pauseListening();

        const command = await this.voiceCommands.listenForCommand(5000);

        if (command) {
            await this.executeCommand(command);
        } else {
            this.ui.showCommandRecognized('');
        }

        await this.wakeWordDetector.startListening();
        this.listeningForCommand = false;
    }

    async executeCommand(commandResult) {
        const { command, transcript } = commandResult;
        switch (command) {
            case 'read':
                this.ui.setStatus('Command: read');
                await this.handleRead();
                break;
            case 'repeat':
                this.ui.setStatus('Command: repeat');
                this.handleRepeat();
                break;
            case 'stop':
                this.ui.setStatus('Command: stop');
                this.handleStop();
                break;
            case 'faster':
                this.speechManager.setRate(this.speechManager.getRate() + 0.1);
                this.ui.setStatus('Increased speech speed');
                break;
            case 'slower':
                this.speechManager.setRate(this.speechManager.getRate() - 0.1);
                this.ui.setStatus('Decreased speech speed');
                break;
            case 'next':
                this.ui.setStatus('Command: next (stub)');
                break;
            default:
                this.ui.setStatus('No matching command heard.', 'error');
        }

        this.ui.showCommandRecognized(transcript || '');
    }

    async handleRead() {
        if (this.isProcessing) return;
        this.isProcessing = true;
        this.ui.setReadButtonEnabled(false);
        this.ui.setStatus('Processing OCR...');

        try {
            const frameCanvas = this.captureFrame();
            const text = await this.ocrReader.recognizeText(frameCanvas);

            let finalText = text;
            if (this.geminiCleaner?.hasKey()) {
                try {
                    this.ui.setStatus('Cleaning text with Gemini...');
                    const cleaned = await this.geminiCleaner.cleanText(text);
                    if (cleaned) {
                        finalText = cleaned;
                    }
                } catch (err) {
                    console.error('Gemini cleanup error:', err);
                    this.ui.setStatus('Gemini cleanup unavailable. Using raw OCR.', 'error');
                }
            }

            if (!finalText) {
                this.ui.setStatus('No text recognized. Try again.', 'error');
                return;
            }

            this.ui.displayRecognizedText(finalText);
            this.ui.setStatus('Reading text...', 'success');

            this.speechManager.speak(finalText, () => {
                this.ui.setStatus('Listening for wake word...', 'success');
                this.ui.setStopButtonEnabled(false);
            });

            this.ui.setRepeatButtonEnabled(true);
            this.ui.setStopButtonEnabled(true);
        } catch (error) {
            console.error('Read error:', error);
            this.ui.setStatus('Error: ' + error.message, 'error');
        } finally {
            this.isProcessing = false;
            this.ui.setReadButtonEnabled(true);
        }
    }

    handleRepeat() {
        if (this.speechManager.lastText) {
            this.ui.setStatus('Repeating text...');
            this.speechManager.repeat(() => {
                this.ui.setStatus('Listening for wake word...', 'success');
                this.ui.setStopButtonEnabled(false);
            });
            this.ui.setStopButtonEnabled(true);
        }
    }

    handleStop() {
        this.speechManager.stop();
        this.ui.setStatus('Speech stopped.', 'success');
        this.ui.setStopButtonEnabled(false);
    }

    captureFrame() {
        const canvas = document.createElement('canvas');
        canvas.width = this.videoElement.videoWidth || this.videoElement.clientWidth;
        canvas.height = this.videoElement.videoHeight || this.videoElement.clientHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
        return canvas;
    }
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', () => {
    const app = new BracketReaderApp();
    app.initialize();
});
