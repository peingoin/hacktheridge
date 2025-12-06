# Changes and Required Updates

## What changed
- Added npm setup (`package.json`) with Porcupine dependencies and ran `npm install`.
- Added wake word asset at `public/wake-words/hey-tato.ppn`.
- Removed MediaPipe usage from UI, added voice-first layout (mic indicator, listening state, fallback buttons) in `index.html` and `css/styles.css`.
- Added voice modules `js/wakeWordDetector.js` (Porcupine) and `js/voiceCommands.js` (Web Speech API) plus `js/config.js` for the Picovoice access key.
- Reworked `js/main.js` to orchestrate wake word -> command -> OCR/TTS flow; updated `js/ui.js` for voice state indicators.

## Required updates to run
1) Set your Picovoice access key in `js/config.js`:
   ```js
   export const PICOVOICE_ACCESS_KEY = 'your-key-here';
   ```

2) Use a bundler/dev server that resolves bare npm imports (e.g., Vite, Parcel) or provide import maps/CDN URLs for `@picovoice/porcupine-web` and `@picovoice/web-voice-processor`. A plain static server will throw “Failed to resolve module specifier” without this.

3) Serve over HTTPS or `http://localhost` so mic works. A local dev server (e.g., `npm run dev` if using Vite) is fine; on plain `npx serve .` the imports will still fail unless mapped.

4) Provide a favicon if you want to remove the `favicon.ico` 404 (optional).

## How to test (once bundler/imports are set)
- Start the dev server.
- Load the page, grant mic permission; mic badge should show “listening for wake word.”
- Say “Hey Tato” -> banner flips to command listening.
- Say a command within ~5s: read / repeat / stop / faster / slower / next (stub). “Read” captures the current frame and runs OCR via Tesseract, then speaks it.
- Manual buttons (Read, Repeat, Stop) and speed slider still work as fallback.
