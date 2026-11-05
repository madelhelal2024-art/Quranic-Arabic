# Qur'anic Arabic — Arabic Light Academy

A bilingual, installable educational web app for **Lesson 01: Sūrat al-Nās**, based on Arabic Light Academy's three approved companion volumes.

## Modules

- **Student Book:** surah introduction, six verse studies, word-by-word glosses, grammar/morphology, rhetoric, final review, and 20 MCQs.
- **Verse-by-verse listening:** streams Mohamed Siddiq al-Minshawi's Murattal recitation from Al Quran Cloud / Islamic Network, with a separate play/pause button on each verse.
- **Focused study:** each verse's vocabulary, overall meaning, grammar, conjugation, rhetoric, and language benefit can be opened independently using labelled buttons.
- **Workbook:** written exercises, 20 MCQs, immediate answer checking, and a final assessment.
- **Iʿrāb Book:** detailed verse-by-verse grammar, syntax map, and morphology index.

There are **40 auto-graded multiple-choice questions**. The correct options come from the approved Workbook answer-key tables. Written responses and completed-section state stay in the browser's `localStorage`; no account or server is involved.

## Run locally

Serve the `dist/` directory over HTTP. For example:

```bash
python3 -m http.server 8000 --directory dist
```

Open <http://localhost:8000>.

The application is a buildless PWA: `index.html`, `style.css`, `quran.css`, `library.css`, `app.js`, `content.json`, `surahs.json`, `manifest.webmanifest`, and `sw.js`, with book cover thumbnails under `dist/covers/`. For installation/offline support, deploy over HTTPS or localhost.

The default English interface is left-to-right. Users first choose a book,
then see **all 114 surahs in Mushaf order** and choose a surah, then study that
book's content. The complete surah-name list is in `dist/surahs.json`, based on
the [Quran.com surah directory](https://quran.com/surahs). Currently only Surah
An-Nās has approved lesson material, so the other 113 entries are visibly
marked "Coming soon" and cannot open an invented lesson. The optional Arabic interface is
right-to-left; Qur'anic verses and Arabic excerpts always remain RTL.

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

This is a one-lesson app (Surah An-Nās). It does not claim to include other surahs, cloud accounts, or server-side grades. Data saved in one browser will not automatically sync to another device.
Audio is streamed from a third-party provider and requires internet access. No audio recordings are bundled or redistributed by this repository. The reciter/rightsholder retains rights to the recordings; see [Al Quran Cloud's terms](https://alquran.cloud/terms-and-conditions).

# Qur'anic text verification

The six verse strings in the Student and Iʿrāb Books follow the Uthmani
orthography shown on [Quran.com, Surah An-Nās](https://quran.com/ar/an-nas).
`python3 scripts/check-quran-verses.py` checks both books against that reference.
The PWA renders the immutable verse text independently of its Arabic-Indic
verse-number badge to prevent right-to-left number reordering. The open-source
[Amiri Quran](https://github.com/aliftype/amiri) typeface is loaded for Qur'anic
passages, with local Arabic-font fallbacks when offline. Lessons, translations,
notes, exercises and answer keys remain unchanged from the approved books.
