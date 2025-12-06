/**
 * camera.js
 * Handles webcam setup and video stream management
 */

export class CameraManager {
    constructor(videoElement) {
        this.videoElement = videoElement;
        this.stream = null;
    }

    async initialize() {
        try {
            const constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.videoElement.srcObject = this.stream;

            return new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    resolve(true);
                };
            });
        } catch (error) {
            console.error('Error accessing camera:', error);
            throw new Error('Failed to access camera. Please ensure camera permissions are granted.');
        }
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }

    getVideoElement() {
        return this.videoElement;
    }
}
