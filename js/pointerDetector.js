/**
 * pointerDetector.js
 * Detects pointing finger pose from hand landmarks
 */

export class PointerDetector {
    constructor() {
        this.fingerPosition = null;
    }

    /**
     * Check if hand is in pointing pose (index finger extended)
     * @param {Array} landmarks - Array of 21 hand landmarks
     * @returns {boolean}
     */
    isPointing(landmarks) {
        if (!landmarks || landmarks.length !== 21) return false;

        const wrist = landmarks[0];
        const indexTip = landmarks[8];
        const indexDip = landmarks[7];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];

        // Calculate distances from wrist
        const indexDist = this.calculateDistance(wrist, indexTip);
        const middleDist = this.calculateDistance(wrist, middleTip);
        const ringDist = this.calculateDistance(wrist, ringTip);
        const pinkyDist = this.calculateDistance(wrist, pinkyTip);

        // Index should be extended (far from wrist)
        // Other fingers should be curled (closer to wrist)
        const indexExtended = indexDist > middleDist && indexDist > ringDist && indexDist > pinkyDist;

        // Check if index finger is relatively straight
        const indexMcp = landmarks[5];
        const indexStraight = this.calculateDistance(indexMcp, indexTip) > this.calculateDistance(indexMcp, indexDip);

        return indexExtended && indexStraight;
    }

    /**
     * Calculate Euclidean distance between two points
     */
    calculateDistance(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        const dz = (point2.z || 0) - (point1.z || 0);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * Detect pointer from MediaPipe results
     * @param {Object} results - MediaPipe Hands results
     * @returns {Object|null} - Fingertip coordinates {x, y} or null
     */
    detectPointer(results) {
        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            this.fingerPosition = null;
            return null;
        }

        const landmarks = results.multiHandLandmarks[0];

        if (this.isPointing(landmarks)) {
            // Return index fingertip position (landmark 8)
            const indexTip = landmarks[8];
            this.fingerPosition = {
                x: indexTip.x,
                y: indexTip.y
            };
            return this.fingerPosition;
        }

        this.fingerPosition = null;
        return null;
    }

    /**
     * Draw cursor at fingertip position
     * @param {HTMLCanvasElement} canvas
     * @param {Object} fingerCoords - {x, y} in normalized coordinates
     */
    drawCursor(canvas, fingerCoords) {
        if (!fingerCoords) return;

        const ctx = canvas.getContext('2d');
        const x = fingerCoords.x * canvas.width;
        const y = fingerCoords.y * canvas.height;

        // Draw circle cursor
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.fill();
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw center dot
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#00FF00';
        ctx.fill();
    }

    /**
     * Get current finger position
     * @returns {Object|null}
     */
    getFingerPosition() {
        return this.fingerPosition;
    }
}
