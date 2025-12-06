const DEFAULT_PROMPT = `You will receive OCR-extracted text that may include errors like slashes, extra numbers, broken punctuation, and incorrect words.

Rewrite the text so that:
- it becomes grammatically correct,
- preserves original meaning,
- removes OCR artifacts,
- merges broken lines properly,
- corrects common OCR errors (i.e. 1->I, 0->O),
- do NOT add new content.

Return ONLY the corrected text.`;

const GEMINI_MODEL = 'gemini-2.0-flash';

const resolveApiKey = () => {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
        return import.meta.env.VITE_GEMINI_API_KEY;
    }
    if (typeof window !== 'undefined' && window.GEMINI_API_KEY) {
        return window.GEMINI_API_KEY;
    }
    return null;
};

export class GeminiCleaner {
    constructor(apiKey = resolveApiKey(), model = GEMINI_MODEL, prompt = DEFAULT_PROMPT) {
        this.apiKey = apiKey;
        this.model = model;
        this.prompt = prompt;
    }

    hasKey() {
        return !!this.apiKey;
    }

    async cleanText(rawText) {
        const text = (rawText || '').trim();
        if (!text) return '';

        if (!this.apiKey) {
            throw new Error('Missing Gemini API key. Set VITE_GEMINI_API_KEY or window.GEMINI_API_KEY.');
        }

        // Respect a simple payload cap per PRD (2k chars).
        const cappedText = text.slice(0, 2048);

        const body = {
            contents: [
                {
                    parts: [
                        { text: `${this.prompt}\n\nInput:\n"${cappedText}"` }
                    ]
                }
            ]
        };

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

        const resp = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const respText = await resp.text();
        if (!resp.ok) {
            throw new Error(`Gemini cleanup failed: ${resp.status} ${resp.statusText} - ${respText}`);
        }

        try {
            const data = JSON.parse(respText);
            const cleaned = (data?.candidates?.[0]?.content?.parts || [])
                .map((p) => p.text || '')
                .join(' ')
                .trim();
            return cleaned || text;
        } catch (err) {
            // Fallback to raw text if parsing fails.
            console.error('Gemini parse error:', err);
            return text;
        }
    }
}
