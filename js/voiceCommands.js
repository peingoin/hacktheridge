/**
 * Handles voice command recognition using the Web Speech API.
 */
export class VoiceCommands {
    constructor({ onListeningStart, onListeningEnd, onResult, onError } = {}) {
        this.onListeningStart = onListeningStart;
        this.onListeningEnd = onListeningEnd;
        this.onResult = onResult;
        this.onError = onError;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            throw new Error('SpeechRecognition API not supported in this browser.');
        }

        this.RecognitionClass = SpeechRecognition;
    }

    listenForCommand(timeoutMs = 5000) {
        const recognition = new this.RecognitionClass();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.continuous = false;

        return new Promise((resolve) => {
            let finished = false;

            const finish = (result) => {
                if (finished) return;
                finished = true;
                recognition.stop();
                this.onListeningEnd?.();
                resolve(result);
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript.trim();
                this.onResult?.(transcript);
                const command = this.mapCommand(transcript);
                finish(command);
            };

            recognition.onerror = (event) => {
                this.onError?.(`Speech recognition error: ${event.error}`);
                finish(null);
            };

            recognition.onend = () => {
                finish(null);
            };

            this.onListeningStart?.();
            recognition.start();

            // Stop listening after timeout to avoid hanging
            setTimeout(() => finish(null), timeoutMs);
        });
    }

    mapCommand(transcript = '') {
        const text = transcript.toLowerCase();

        if (text.includes('read')) return { command: 'read', transcript };
        if (text.includes('repeat')) return { command: 'repeat', transcript };
        if (text.includes('stop')) return { command: 'stop', transcript };
        if (text.includes('next')) return { command: 'next', transcript };
        if (text.includes('faster')) return { command: 'faster', transcript };
        if (text.includes('slower') || text.includes('slow')) return { command: 'slower', transcript };

        return null;
    }
}
