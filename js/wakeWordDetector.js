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
            this.porcupine = await PorcupineWorker.create(
                PICOVOICE_ACCESS_KEY,
                [
                    {
                        label: 'hey-tato',
                        publicPath: new URL(
                            `${import.meta.env.BASE_URL || ''}wake-words/hey-tato.ppn`,
                            window.location.href
                        ).href,
                        sensitivity: 0.7
                    }
                ],
                (detection) => this.handleDetection(detection.label),
                { publicPath: 'https://cdn.picovoice.ai/porcupine/porcupine_params.pv' },
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
}
