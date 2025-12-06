/**
 * roiExtractor.js
 * Extracts Region of Interest around fingertip for OCR
 */

export class ROIExtractor {
    constructor() {
        this.roiWidth = 200;
        this.roiHeight = 100;
        this.offsetX = 0;
        this.offsetY = 50; // Offset below finger to target text, not finger itself
    }

    /**
     * Set ROI size
     * @param {number} width - ROI width in pixels
     * @param {number} height - ROI height in pixels
     */
    setROISize(width, height) {
        this.roiWidth = width;
        this.roiHeight = height;
    }

    /**
     * Set offset from fingertip
     * @param {number} offsetX - X offset in pixels
     * @param {number} offsetY - Y offset in pixels (positive = down)
     */
    setOffset(offsetX, offsetY) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }

    /**
     * Calculate ROI bounds
     * @param {Object} fingerCoords - {x, y} in normalized coordinates (0-1)
     * @param {number} videoWidth - Video width in pixels
     * @param {number} videoHeight - Video height in pixels
     * @returns {Object} - {x, y, width, height} in pixels
     */
    getROIBounds(fingerCoords, videoWidth, videoHeight) {
        // Convert normalized coords to pixels
        const fingerX = fingerCoords.x * videoWidth;
        const fingerY = fingerCoords.y * videoHeight;

        // Apply offset
        const centerX = fingerX + this.offsetX;
        const centerY = fingerY + this.offsetY;

        // Calculate ROI rectangle (centered on offset point)
        const x = Math.max(0, centerX - this.roiWidth / 2);
        const y = Math.max(0, centerY - this.roiHeight / 2);
        const width = Math.min(this.roiWidth, videoWidth - x);
        const height = Math.min(this.roiHeight, videoHeight - y);

        return { x, y, width, height };
    }

    /**
     * Extract ROI from video frame
     * @param {HTMLVideoElement} video
     * @param {Object} fingerCoords - {x, y} in normalized coordinates
     * @returns {HTMLCanvasElement} - Cropped canvas with ROI
     */
    extractROI(video, fingerCoords) {
        if (!fingerCoords) return null;

        const bounds = this.getROIBounds(fingerCoords, video.videoWidth, video.videoHeight);

        // Create canvas for cropped region
        const canvas = document.createElement('canvas');
        canvas.width = bounds.width;
        canvas.height = bounds.height;

        const ctx = canvas.getContext('2d');

        // Draw cropped region
        ctx.drawImage(
            video,
            bounds.x, bounds.y, bounds.width, bounds.height,
            0, 0, bounds.width, bounds.height
        );

        return canvas;
    }

    /**
     * Draw ROI preview on overlay canvas
     * @param {HTMLCanvasElement} canvas
     * @param {Object} fingerCoords - {x, y} in normalized coordinates
     */
    drawROIPreview(canvas, fingerCoords) {
        if (!fingerCoords) return;

        const ctx = canvas.getContext('2d');
        const bounds = this.getROIBounds(fingerCoords, canvas.width, canvas.height);

        // Draw ROI rectangle
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

        // Draw semi-transparent overlay
        ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
        ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }
}
