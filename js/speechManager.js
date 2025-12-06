/**
 * speechManager.js
 * Wraps Web Speech API for text-to-speech
 */

export class SpeechManager {
    constructor() {
        this.synth = window.speechSynthesis;
        this.currentUtterance = null;
        this.rate = 1.0;
        this.lastText = '';
    }

    /**
     * Check if speech synthesis is supported
     */
    isSupported() {
        return 'speechSynthesis' in window;
    }

    /**
     * Speak the given text
     * @param {string} text - Text to speak
     * @param {Function} onEnd - Callback when speech ends
     */
    speak(text, onEnd = null) {
        if (!this.isSupported()) {
            console.error('Speech synthesis not supported');
            return;
        }

        // Cancel any ongoing speech
        this.stop();

        if (!text || text.trim().length === 0) {
            console.warn('No text to speak');
            return;
        }

        this.lastText = text;
        this.currentUtterance = new SpeechSynthesisUtterance(text);
        this.currentUtterance.rate = this.rate;
        this.currentUtterance.pitch = 1.0;
        this.currentUtterance.volume = 1.0;

        if (onEnd) {
            this.currentUtterance.onend = onEnd;
        }

        this.currentUtterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
        };

        this.synth.speak(this.currentUtterance);
    }

    /**
     * Stop current speech
     */
    stop() {
        if (this.synth.speaking) {
            this.synth.cancel();
        }
    }

    /**
     * Pause current speech
     */
    pause() {
        if (this.synth.speaking) {
            this.synth.pause();
        }
    }

    /**
     * Resume paused speech
     */
    resume() {
        if (this.synth.paused) {
            this.synth.resume();
        }
    }

    /**
     * Repeat last spoken text
     */
    repeat(onEnd = null) {
        if (this.lastText) {
            this.speak(this.lastText, onEnd);
        }
    }

    /**
     * Set speech rate
     * @param {number} rate - Speech rate (0.1 to 10)
     */
    setRate(rate) {
        this.rate = Math.max(0.1, Math.min(10, rate));
    }

    /**
     * Get current speech rate
     */
    getRate() {
        return this.rate;
    }

    /**
     * Check if currently speaking
     */
    isSpeaking() {
        return this.synth.speaking;
    }
}
