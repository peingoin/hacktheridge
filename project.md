Love this change, it actually makes the app *way* more magical/accessible.

Here’s your spec rewritten for **single pointer finger selection** on a **web app (HTML/CSS/JS)**.

---

## 📱 Project: “Bracket Reader” – Dyslexia Accessibility Web App (Pointer Edition)

### 🎯 Goal

Build a **web app (HTML/CSS/JavaScript)** that lets users **point with one index finger** at printed text in front of their webcam.

The app detects the pointing finger, figures out *where* on the page it’s pointing, crops that region, recognizes the text there, and reads it aloud.

---

## 🧩 System Overview

**New Flow:**
Webcam → Hand Tracker (MediaPipe JS) → Pointer Finger Detector → Region-of-Interest (ROI) Crop →
Text Recognition (Tesseract.js) → Text-to-Speech (Web Speech API)

### Webcam (Browser `getUserMedia`)

* Shows a live video preview (`<video>`).
* Frames are drawn to a `<canvas>` for analysis and overlays.

### MediaPipe Hands (JavaScript)

* Detects 21 landmarks per detected hand.
* Runs fully in-browser, in real time.
* We mainly care about the **index fingertip** landmark.

### Pointer Finger Detector (Custom JS)

* Identifies which hand is pointing (e.g., index finger extended, other fingers curled or less extended).
* Uses the **index fingertip coordinates** as the “pointer”.
* Optionally visualizes a **small circle or cursor** at the fingertip on the overlay canvas.

### Region-of-Interest Extractor (ROI)

* Based on the fingertip coordinates in image space, define a small **rectangular region around the finger**:

  * Centered slightly *ahead* of the fingertip (toward the page) so you’re reading what the finger points at, not the finger itself.
* Captures the corresponding portion of the video frame via a hidden `<canvas>`.
* This cropped ROI image is sent to OCR.

### Text Recognition (OCR – Tesseract.js)

* Runs OCR on the cropped ROI.
* For MVP, you can:

  * Read a **single word** or small group of words near the fingertip.
  * Later expand to reading a whole **line** by using a wider horizontal ROI.
* Returns recognized text as a string.

### Text-to-Speech (TTS – Web Speech API)

* Uses `speechSynthesis` to read the recognized text aloud.
* Optional controls:

  * Adjustable rate slider.
  * Replay last phrase.
  * Stop / pause.

---

## ⚙️ Tech Stack

| Layer         | Tool / Library                        | Notes                                  |
| ------------- | ------------------------------------- | -------------------------------------- |
| Platform      | Web (HTML/CSS/JS)                     | Runs in any modern browser with webcam |
| Languages     | HTML, CSS, JavaScript                 | No backend needed for MVP              |
| Camera        | `navigator.mediaDevices.getUserMedia` | Webcam access                          |
| Hand Tracking | MediaPipe Hands (JavaScript)          | Index fingertip position in real time  |
| OCR           | Tesseract.js                          | Client-side OCR                        |
| Voice Output  | Web Speech API (`speechSynthesis`)    | Speak recognized text                  |

All in-browser, no server, no API keys, static hosting is enough.

---

## 🧠 Key JS Modules / Files

| Module / File        | Purpose                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `camera.js`          | Sets up `getUserMedia`, draws video to `<video>` and `<canvas>`.                         |
| `handTracker.js`     | Wraps MediaPipe Hands, returns hand + fingertip landmarks each frame.                    |
| `pointerDetector.js` | Detects pointing pose (index extended), outputs fingertip position in pixel coordinates. |
| `roiExtractor.js`    | Converts fingertip position → crop rectangle → returns ROI canvas/image.                 |
| `ocrReader.js`       | Uses Tesseract.js on the ROI; returns recognized text.                                   |
| `speechManager.js`   | Uses Web Speech API to speak text; handles rate, replay, stop.                           |
| `ui.js`              | Handles DOM updates: instructions, recognized text display, buttons, status messages.    |
| `main.js`            | Coordinates everything: app states, event handlers, main loop.                           |

---

## 💡 MVP Behaviour (Pointer Version)

1. **Load page**

   * Show webcam feed in `<video>` with a `<canvas>` overlay.
   * On-screen text:

     > “Point at the word or line you want to read.”

2. **Detect pointer finger**

   * MediaPipe Hands runs on each frame.
   * `pointerDetector` checks:

     * Is a hand visible?
     * Is the index finger extended (simple heuristic: index extended, middle/ring/pinky more curled)?
   * If pointing detected:

     * Draw a small **circle or cursor** at the **index fingertip** on the overlay canvas.
     * Enable the **“Read”** button (or show a hint like “Tap READ to read text here”).

3. **On “Read” button click**

   * Snapshot current frame to a hidden `<canvas>`.
   * Compute **ROI around fingertip**:

     * e.g. a rectangle of width `W` and height `H` around `(x, y)` fingertip coordinates.
     * Optionally bias slightly downward/forward relative to fingertip to target page text instead of finger.
   * Crop that region into a new canvas.
   * Pass cropped canvas to `ocrReader.js` (Tesseract).
   * Once OCR completes:

     * Show recognized text in a `<div id="recognizedText">`.
     * Call `speechManager.speak(text)` to read it aloud.

4. **Controls**

   * “🔁 Repeat” – repeat last recognized text.
   * “⏹ Stop” – stop current speech.
   * Optional slider:

     * “Reading speed: [––|––––]”

---

## ⚠️ Known Constraints (Pointer Version)

* Works best when:

  * Hand is **clearly visible** and not covering the text.
  * Text is in good lighting and reasonably large.
  * Background is not extremely noisy.
* If the finger is too close to the text:

  * The finger may occlude letters → OCR worse.
  * You may need to offset ROI **slightly below** the fingertip.
* Accuracy depends on:

  * Distance from camera.
  * Camera resolution.
  * How steadily the user holds their finger.

---

## 🧰 Dev Setup (Web)

1. **Folder Structure**

   ```text
   /bracket-reader
     index.html
     /css
       styles.css
     /js
       main.js
       camera.js
       handTracker.js
       pointerDetector.js
       roiExtractor.js
       ocrReader.js
       speechManager.js
       ui.js
   ```

2. **`index.html` essentials**

   * Elements:

     * `<video id="cameraPreview" autoplay playsinline></video>`
     * `<canvas id="overlayCanvas"></canvas>`
     * `<button id="readButton" disabled>Read</button>`
     * `<button id="repeatButton" disabled>Repeat</button>`
     * `<div id="recognizedText"></div>`
   * Script tags for:

     * MediaPipe Hands JS
     * Tesseract.js
     * Your own JS files (loaded last).

3. **Local testing**

   * Use `Live Server` in VS Code or any local HTTP server.
   * For deployment, use HTTPS hosting (GitHub Pages, Netlify, Vercel) so webcam works without issues.

---

If you want, next step I can:

* sketch out **pseudo-code** for `pointerDetector.js` (how to tell index is extended), or
* give you a **minimal `index.html` + `main.js`** that opens webcam and draws a fingertip cursor so you can start playing.
