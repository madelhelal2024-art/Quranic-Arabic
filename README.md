# Qur'anic Arabic — Arabic Light Academy

A bilingual, installable educational web app for **Lesson 01: Sūrat al-Nās**, based on Arabic Light Academy's three approved companion volumes.

## Modules

- **Student Book:** surah introduction, six verse studies, word-by-word glosses, grammar/morphology, rhetoric, final review, and 20 MCQs.
- **Workbook:** written exercises, 20 MCQs, immediate answer checking, and a final assessment.
- **Iʿrāb Book:** detailed verse-by-verse grammar, syntax map, and morphology index.

There are **40 auto-graded multiple-choice questions**. The correct options come from the approved Workbook answer-key tables. Written responses and completed-section state stay in the browser's `localStorage`; no account or server is involved.

## Run locally

Serve the `dist/` directory over HTTP. For example:

```bash
python3 -m http.server 8000 --directory dist
```

Open <http://localhost:8000>.

The application is a buildless PWA: `index.html`, `style.css`, `app.js`, `content.json`, `manifest.webmanifest`, and `sw.js`. For installation/offline support, deploy over HTTPS or localhost.

## Update the source material

The three approved `.docx` source files are not committed to this repository. To regenerate `dist/content.json`, put the following files inside a local `source-materials/` folder alongside this README:

- `Arabic_Light_An_Nas_Student_Book.docx`
- `Arabic_Light_An_Nas_Workbook.docx`
- `Arabic_Light_An_Nas_Irab_Book.docx`
- `Arabic_Light_Student_Book_Lesson01_Branded_Editable.html` (contains the approved logo)

Then run:

```bash
python3 -m pip install python-docx
python3 scripts/build-content.py
```

The converter mechanically preserves source paragraph text, section order, and table cells. The app's visual identity follows the current approved white, silver-grey, and copper Arabic Light design. Content and scholarly edits should be reviewed by Arabic Light Academy before publication.

## Privacy and scope

This is a one-lesson app (Surah An-Nās). It does not claim to include the other surahs, cloud accounts, server-side grades, or audio recitation. Data saved in one browser will not automatically sync to another device.
