/**
 * ui.js
 * Handles DOM updates and user interface interactions
 */

export class UIManager {
    constructor() {
        this.elements = {
            readButton: document.getElementById('readButton'),
            repeatButton: document.getElementById('repeatButton'),
            stopButton: document.getElementById('stopButton'),
            recognizedText: document.getElementById('recognizedText'),
            status: document.getElementById('status'),
            speechRate: document.getElementById('speechRate'),
            rateValue: document.getElementById('rateValue'),
            instructions: document.getElementById('instructions'),
            listeningState: document.getElementById('listeningState'),
            micIndicator: document.getElementById('micIndicator')
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Speech rate slider
        this.elements.speechRate.addEventListener('input', (e) => {
            const rate = parseFloat(e.target.value);
            this.elements.rateValue.textContent = `${rate.toFixed(1)}x`;
        });
    }

    setMicActive(isActive) {
        if (!this.elements.micIndicator) return;
        this.elements.micIndicator.classList.toggle('active', !!isActive);
        this.elements.micIndicator.textContent = isActive ? 'Mic: listening' : 'Mic: idle';
    }

    /**
     * Update status message
     */
    setStatus(message, type = 'normal') {
        this.elements.status.textContent = message;
        this.elements.status.className = 'status';

        if (type === 'error') {
            this.elements.status.classList.add('error');
        } else if (type === 'success') {
            this.elements.status.classList.add('success');
        }
    }

    /**
     * Enable/disable read button
     */
    setReadButtonEnabled(enabled) {
        this.elements.readButton.disabled = !enabled;
    }

    /**
     * Enable/disable repeat button
     */
    setRepeatButtonEnabled(enabled) {
        this.elements.repeatButton.disabled = !enabled;
    }

    /**
     * Enable/disable stop button
     */
    setStopButtonEnabled(enabled) {
        this.elements.stopButton.disabled = !enabled;
    }

    /**
     * Display recognized text
     */
    displayRecognizedText(text) {
        this.elements.recognizedText.textContent = text;
    }

    /**
     * Clear recognized text
     */
    clearRecognizedText() {
        this.elements.recognizedText.textContent = '';
    }

    /**
     * Show/hide instructions
     */
    setInstructionsVisible(visible) {
        this.elements.instructions.style.display = visible ? 'block' : 'none';
    }

    /**
     * Update instructions text
     */
    setInstructions(text) {
        this.elements.instructions.textContent = text;
    }

    /**
     * Get speech rate value
     */
    getSpeechRate() {
        return parseFloat(this.elements.speechRate.value);
    }

    /**
     * Add event listener to read button
     */
    onReadButtonClick(callback) {
        this.elements.readButton.addEventListener('click', callback);
    }

    /**
     * Add event listener to repeat button
     */
    onRepeatButtonClick(callback) {
        this.elements.repeatButton.addEventListener('click', callback);
    }

    /**
     * Add event listener to stop button
     */
    onStopButtonClick(callback) {
        this.elements.stopButton.addEventListener('click', callback);
    }

    /**
     * Add event listener to speech rate change
     */
    onSpeechRateChange(callback) {
        this.elements.speechRate.addEventListener('input', (e) => {
            callback(parseFloat(e.target.value));
        });
    }

    showWakeWordListening(active = true) {
        if (!this.elements.listeningState) return;
        this.setMicActive(active);
        this.elements.listeningState.classList.remove('command');
        this.elements.listeningState.textContent = active
            ? 'Listening for "Hey Tato"...'
            : 'Wake word paused';
    }

    showCommandListening() {
        if (!this.elements.listeningState) return;
        this.setMicActive(true);
        this.elements.listeningState.classList.add('command');
        this.elements.listeningState.textContent = 'Wake word detected. Listening for command...';
    }

    showCommandRecognized(command) {
        if (!this.elements.listeningState) return;
        this.elements.listeningState.classList.remove('command');
        this.elements.listeningState.textContent = command
            ? `Command heard: ${command}`
            : 'No command recognized. Say "Hey Tato" to try again.';
        this.setMicActive(false);
    }
}
