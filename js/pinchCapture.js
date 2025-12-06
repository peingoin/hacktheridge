/**
 * Detects pinch gesture and captures a rectangle from the video.
 * Pinch start = mark top-left. Pinch release = bottom-right; captures that box if valid.
 */
export class PinchCapture {
    constructor(videoElement, overlayCanvas, onCapture) {
        this.video = videoElement;
        this.overlay = overlayCanvas;
        this.onCapture = onCapture;

        this.isPinching = false;
        this.startPoint = null;
        this.lastPoint = null;
        this.ctx = overlayCanvas.getContext('2d');
    }

    update(landmarks) {
        const dims = this.getDims();
        if (!dims) return;

        // clear overlay
        this.ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);

        if (!landmarks || landmarks.length === 0) {
            this.reset();
            return;
        }

        const thumb = this.toPixel(landmarks[4], dims);
        const index = this.toPixel(landmarks[8], dims);
        const pinchDistance = this.distance(thumb, index);
        const pinchingNow = pinchDistance < 40; // pixels threshold

        // Draw fingertip points
        this.drawPoint(thumb, 'cyan');
        this.drawPoint(index, 'cyan');

        if (pinchingNow && !this.isPinching) {
            // pinch started
            this.startPoint = index;
        }

        if (pinchingNow) {
            this.lastPoint = index;
            // draw live box if start exists
            if (this.startPoint) {
                this.drawRect(this.startPoint, this.lastPoint, 'rgba(0,255,0,0.4)');
            }
        }

        if (!pinchingNow && this.isPinching && this.startPoint && this.lastPoint) {
            // pinch ended -> capture if valid rectangle
            const rect = this.buildRect(this.startPoint, this.lastPoint);
            if (rect && rect.width > 10 && rect.height > 10) {
                const snapshot = this.capture(rect);
                if (snapshot && this.onCapture) {
                    this.onCapture(snapshot);
                }
            }
            this.reset();
        }

        this.isPinching = pinchingNow;
    }

    reset() {
        this.isPinching = false;
        this.startPoint = null;
        this.lastPoint = null;
    }

    getDims() {
        const width = this.video.videoWidth || this.overlay.width;
        const height = this.video.videoHeight || this.overlay.height;
        if (!width || !height) return null;
        this.overlay.width = width;
        this.overlay.height = height;
        return { width, height };
    }

    toPixel(landmark, dims) {
        return {
            x: landmark.x * dims.width,
            y: landmark.y * dims.height
        };
    }

    distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    buildRect(p1, p2) {
        const left = Math.min(p1.x, p2.x);
        const top = Math.min(p1.y, p2.y);
        const right = Math.max(p1.x, p2.x);
        const bottom = Math.max(p1.y, p2.y);
        if (right <= left || bottom <= top) return null;
        return {
            x: left,
            y: top,
            width: right - left,
            height: bottom - top
        };
    }

    capture(rect) {
        if (!rect || !rect.width || !rect.height) return null;
        const canvas = document.createElement('canvas');
        canvas.width = rect.width;
        canvas.height = rect.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(
            this.video,
            rect.x,
            rect.y,
            rect.width,
            rect.height,
            0,
            0,
            rect.width,
            rect.height
        );
        return canvas;
    }

    drawPoint(p, color = 'red') {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawRect(p1, p2, color = 'rgba(0,255,0,0.3)') {
        const rect = this.buildRect(p1, p2);
        if (!rect) return;
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = 'lime';
        this.ctx.lineWidth = 2;
        this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }
}
