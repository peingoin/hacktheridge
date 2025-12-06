Below is a **Product Requirements Document (PRD)** designed specifically for your new feature:

---

# 📄 PRD: Smart Readability Cleanup via Gemini AI

**Feature Name:** *AI-Enhanced Text Cleaning*
**Owner:** Isabella
**Status:** Draft
**Version:** 1.0

---

# 1. 🔍 Summary

The user scans text using the camera and OCR. However, OCR often outputs unclear, noisy, or incomplete text, including:

* stray symbols (`/`, `_`, `=`, etc.)
* line breaks splitting sentences incorrectly
* misread characters (e.g., `1` instead of `l`, `$` instead of `S`)
* incomplete line fragments

This feature sends OCR-derived text to Gemini for semantic cleaning, returning a readable and grammatically correct version. The improved text is then passed into Text-to-Speech (TTS), enabling a clearer auditory experience.

This helps the reader—especially users with dyslexia or low-vision—receive meaningful spoken output.

---

# 2. 🎯 Goal

Improve readability and correctness of OCR text by intelligently rewriting text using AI before reading aloud.

**Success Metrics**

* Minimum **80% reduction** in artifacts (symbols/numbers) compared to raw OCR.
* **≥ 20% faster comprehension** based on user testing (reading accuracy surveys).
* **≥ 90% of cleaned output must be grammatically coherent** (evaluated internally).

---

# 3. 🧠 Problem Statement

OCR engines often produce text such as:

> "Th1s /is a tes//t of the sys1em"

or

> "The cat s at the \ windo w"

When spoken, this sounds confusing.
Users cannot understand what is being read—even though the physical text is fine.

This harms accessibility.

---

# 4. 🌟 Feature Description

## What Happens

1. Text is captured by OCR
2. OCR output is passed to Gemini via prompt
3. Gemini returns cleaned text
4. The cleaned text is used for TTS output

## Example Prompt Template

```
You will receive OCR-extracted text that may include errors like slashes, extra numbers, broken punctuation, and incorrect words.

Rewrite the text so that:
- it becomes grammatically correct,
- preserves original meaning,
- removes OCR artifacts,
- merges broken lines properly,
- corrects common OCR errors (i.e. 1->I, 0->O),
- do NOT add new content.

Return ONLY the corrected text.
Input:
"{OCR_TEXT}"
```

---

# 5. 🧩 User Workflow

### Before (current experience)

* Camera captures text
* OCR extracts messy text
* TTS reads directly
  ➡ Output is confusing
  ➡ User replays TTS multiple times

### After (new experience)

* OCR extracts text
* Gemini processes the text
* Text is corrected
* TTS reads new text
  ➡ Clear spoken result
  ➡ Normally only 1 listen needed

---

# 6. 🛠 Functional Requirements

### OCR Processing

* Must capture raw text as a string.
* Must remove obvious non-text characters BEFORE sending to Gemini (optional pre-filter)

### Content Passing

* Gemini will receive text payload up to **2048 characters** per call
* If OCR block size exceeds limit, system must:

  * split paragraphs into chunks
  * label them “chunk 1, chunk 2…”

### Gemini Output Handling

* Return strictly text
* Strip formatting markers (quotes, Markdown, etc.)
* Guarantee cleaned version has:

  * no truncated sentences
  * no hallucinated expansions

### Text-to-Speech Integration

* Feed Gemini-returned text directly into TTS engine
* Support both:

  * immediate read-back, and
  * save-for-later reading

---

# 7. 🧪 Quality Requirements

### Gemini output must:

✔ Maintain meaning
✔ Join broken words properly
✔ Combine line breaks into logical sentences
✔ Fix punctuation

### Gemini output must NOT:

❌ Add new sentences
❌ Invent missing text
❌ Add descriptions (like “This text reads about...”)
❌ Rewrite tone meaningfully

Example transformation:

**Input**

```
Hel1o/ thi s is t3 st.
```

**Output**

```
Hello, this is a test.
```

---

# 8. ⚙️ Technical Implementation Guide

### Components Involved

| Component  | Role                          |
| ---------- | ----------------------------- |
| OCR Engine | Extracts raw text             |
| Gemini API | Corrects & cleans text        |
| TTS Engine | Converts final text to speech |
| UI Layer   | Shows cleaned text results    |

---

## Backend Flow Diagram

```
[Camera Frame] 
     ↓
  [OCR Engine]
     ↓
[Raw Text String]
     ↓
[Gemini API Request]
     ↓
[Corrected Text Response]
     ↓
   [TTS Playback]
```

---

# 9. 🧬 Edge Cases & Handling

| Problem                                        | Expected Behavior                                |
| ---------------------------------------------- | ------------------------------------------------ |
| Text includes math expressions (“2x + 3y = 5”) | Preserve content exactly                         |
| Text includes names with accents               | Preserve correct accents                         |
| OCR detects partial clipped sentence           | System rewrites but does not invent missing half |
| User scans handwritten text                    | Return cleaned best approximation                |

---

# 10. 🧱 Risks

| Risk                                 | Mitigation                     |
| ------------------------------------ | ------------------------------ |
| AI "hallucinates" extra content      | Rule-based output filtering    |
| Large text blocks exceed token limit | Chunking logic                 |
| Delay between scan → TTS             | Local spinner animation        |
| Internet unavailable                 | Use fallback: raw text reading |

---

# 11. 🚀 Rollout Plan

### Phase 1 (MVP)

* Single-chunk cleaning
* Real-time Gemini prompt
* TTS immediately plays corrected version

### Phase 2

* Error highlighting UI:

  * show “before vs after”
  * let users toggle corrections

### Phase 3

* Smart segmentation:

  * word-level correction during live pointing

---

# 12. 🧠 Long-Term Vision

Make reading adaptive:

* Finger-guided text dynamic cleanup
* Replace noisy OCR with semantic inference
* Support dyslexia-optimized formats:

  * enlarged spacing
  * slower TTS rates
  * chunk-mode reading

Ultimately:
📌 meaningful text → enhanced comprehension → better accessibility experience

---

Let me know if you want:
⭐ a UX mockup
⭐ pseudocode for sending text to Gemini
⭐ an actual API request sample with response parsing
