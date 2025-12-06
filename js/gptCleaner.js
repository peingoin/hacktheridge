const DEFAULT_PROMPT = `You will receive OCR-extracted text that may include errors like slashes, extra numbers, broken punctuation, and incorrect words.

Rewrite the text so that:
- it becomes grammatically correct,
- preserves original meaning,
- removes OCR artifacts,
- merges broken lines properly,
- corrects common OCR errors (i.e. 1->I, 0->O),
- do NOT add new content.

Return ONLY the corrected text.`;

const DEFAULT_MODEL = 'gpt-4o-mini';

const resolveApiKey = () => {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENAI_API_KEY) {
        return import.meta.env.VITE_OPENAI_API_KEY;
    }
    if (typeof window !== 'undefined' && window.OPENAI_API_KEY) {
        return window.OPENAI_API_KEY;
    }
    return null;
};

export class GPTCleaner {
    constructor({
        apiKey = resolveApiKey(),
        model = DEFAULT_MODEL,
        prompt = DEFAULT_PROMPT,
        maxChars = 2048
    } = {}) {
        this.apiKey = apiKey;
        this.model = model;
        this.prompt = prompt;
        this.maxChars = maxChars;
    }

    hasKey() {
        return !!this.apiKey;
    }

    async cleanText(rawText) {
        const text = (rawText || '').trim();
        if (!text) return '';

        if (!this.apiKey) {
            throw new Error('Missing OpenAI API key. Set VITE_OPENAI_API_KEY or window.OPENAI_API_KEY.');
        }

        const capped = text.slice(0, this.maxChars);

        const body = {
            model: this.model,
            messages: [
                { role: 'system', content: this.prompt },
                { role: 'user', content: capped }
            ]
        };

        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(body)
        });

        const respText = await resp.text();
        if (!resp.ok) {
            throw new Error(`OpenAI cleanup failed: ${resp.status} ${resp.statusText} - ${respText}`);
        }

        try {
            const data = JSON.parse(respText);
            const cleaned =
                data?.choices?.[0]?.message?.content
                    ?.replace(/^\s+|\s+$/g, '') || text;
            return cleaned;
        } catch (err) {
            console.error('OpenAI parse error:', err);
            return text;
        }
    }
}
