import { PorcupineWorker } from '@picovoice/porcupine-web';
import { WebVoiceProcessor } from '@picovoice/web-voice-processor';
import { PICOVOICE_ACCESS_KEY } from './config.js';

/**
 * Handles wake word detection using Picovoice Porcupine.
 */
export class WakeWordDetector {
    constructor({ onWakeWord, onError, onStateChange } = {}) {
        this.onWakeWord = onWakeWord;
        this.onError = onError;
        this.onStateChange = onStateChange;

        this.porcupine = null;
        this.initialized = false;
        this.listening = false;
    }

    async initialize() {
        if (this.initialized) return;

        if (!PICOVOICE_ACCESS_KEY || PICOVOICE_ACCESS_KEY === 'your-key-here') {
            throw new Error('Set PICOVOICE_ACCESS_KEY in js/config.js');
        }

        try {
            const keywordUrl = new URL(
                `${import.meta.env.BASE_URL || ''}wake-words/hey-tato.ppn`,
                window.location.href
            ).href;
            const modelUrl = new URL(
                `${import.meta.env.BASE_URL || ''}porcupine_params.pv`,
                window.location.href
            ).href;

            // Preflight fetch to surface clearer errors when the files are missing or HTML.
            await this.validateAsset(keywordUrl, 'keyword (.ppn)');
            await this.validateAsset(modelUrl, 'model (.pv)');

            this.porcupine = await PorcupineWorker.create(
                PICOVOICE_ACCESS_KEY,
                [
                    {
                        label: 'hey-tato',
                        publicPath: keywordUrl,
                        sensitivity: 0.7
                    }
                ],
                (detection) => this.handleDetection(detection.label),
                {
                    publicPath: modelUrl
                },
                {
                    processErrorCallback: (err) => this.handleError(err)
                }
            );

            this.initialized = true;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async startListening() {
        if (this.listening) return;
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            await WebVoiceProcessor.subscribe(this.porcupine);
            this.listening = true;
            this.onStateChange?.(true);
        } catch (error) {
            this.handleError(error);
        }
    }

    async stopListening() {
        if (!this.listening) return;
        try {
            await WebVoiceProcessor.unsubscribe(this.porcupine);
            await WebVoiceProcessor.reset();
        } catch (error) {
            // ignore stop errors but report
            this.handleError(error);
        } finally {
            this.listening = false;
            this.onStateChange?.(false);
        }
    }

    async pauseListening() {
        await this.stopListening();
    }

    handleDetection(keywordLabel) {
        this.onWakeWord?.(keywordLabel);
    }

    handleError(error) {
        const message = error?.message || 'Microphone or wake word error';
        console.error(message, error);
        this.onError?.(message);
    }

    async validateAsset(url, label) {
        try {
            const resp = await fetch(url, { method: 'GET' });
            if (!resp.ok) {
                throw new Error(`${label} fetch failed: ${resp.status} ${resp.statusText}`);
            }
            const contentType = resp.headers.get('content-type') || '';
            if (contentType.includes('text/html')) {
                throw new Error(`${label} at ${url} is HTML (likely 404).`);
            }
            const size = Number(resp.headers.get('content-length') || 0);
            if (size && size < 1000) {
                console.warn(`${label} at ${url} is unusually small (${size} bytes).`);
            }
        } catch (err) {
            throw new Error(`Failed to load ${label} at ${url}: ${err.message}`);
        }
    }
}
