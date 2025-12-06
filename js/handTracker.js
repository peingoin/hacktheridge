/**
 * handTracker.js
 * Wraps MediaPipe Hands for hand landmark detection
 */

export class HandTracker {
    constructor(videoElement, onResults) {
        this.videoElement = videoElement;
        this.onResults = onResults;
        this.hands = null;
        this.camera = null;
    }

    async initialize() {
        // Initialize MediaPipe Hands
        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.hands.onResults((results) => {
            if (this.onResults) {
                this.onResults(results);
            }
        });

        // Initialize camera
        this.camera = new Camera(this.videoElement, {
            onFrame: async () => {
                await this.hands.send({ image: this.videoElement });
            },
            width: 1280,
            height: 720
        });

        await this.camera.start();
    }

    stop() {
        if (this.camera) {
            this.camera.stop();
        }
    }

    getCurrentLandmarks() {
        return this.lastResults?.multiHandLandmarks || [];
    }
}
