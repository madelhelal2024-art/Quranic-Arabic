"""Convert the approved Surah An-Nas books into structured app content.

The source DOCX files are kept outside the published app; this mechanical
conversion preserves their paragraph wording, table cells, and section order.
"""

import base64
import json
import re
from pathlib import Path

from docx import Document
from docx.document import Document as _Document
from docx.table import Table
from docx.text.paragraph import Paragraph
from docx.oxml.ns import qn


PROJECT = Path(__file__).resolve().parents[1]
SOURCE = PROJECT / "source-materials"
if not SOURCE.is_dir():
    SOURCE = PROJECT.parent / "source-materials"
OUTPUT = PROJECT / "dist"

BOOKS = {
    "student": "Arabic_Light_An_Nas_Student_Book.docx",
    "workbook": "Arabic_Light_An_Nas_Workbook.docx",
    "irab": "Arabic_Light_An_Nas_Irab_Book.docx",
}

QUIZ_QUESTION = re.compile(r"^\s*(S\d+|[A-F]-M\d+)\.\s+(.+)$")
WRITTEN_QUESTION = re.compile(r"^\s*([A-F]\d+)\.\s+(.+)$")
OPTION = re.compile(r"^\s*☐\s*([A-D])\.\s+(.+)$")
ANSWER_ENTRY = re.compile(r"\b(S\d+|[A-F]-M\d+)\s+([A-D])\b")
IMAGE = re.compile(r'<img\s+src="data:image/png;base64,([A-Za-z0-9+/=]+)"')


def blocks_in_order(doc):
    """Return true XML document order (paragraphs interleaved with tables)."""
    for item in doc.element.body.iterchildren():
        if item.tag == qn("w:p"):
            yield Paragraph(item, doc)
        elif item.tag == qn("w:tbl"):
            yield Table(item, doc)


def split_heading(text):
    pieces = re.split(r"\s+\|\s+", text, maxsplit=1)
    return {"en": pieces[0].strip(), "ar": pieces[1].strip() if len(pieces) > 1 else ""}


def build_book(filename, exclude_key=False):
    doc = Document(SOURCE / filename)
    sections = []
    current = None
    in_answer_key = False
    pending_quiz = None
    pending_written = None

    def finish_quiz():
        nonlocal pending_quiz
        if pending_quiz is not None and current is not None:
            current["blocks"].append(pending_quiz)
        pending_quiz = None

    for obj in blocks_in_order(doc):
        if isinstance(obj, Table):
            finish_quiz()
            if current is not None and not in_answer_key:
                rows = [[cell.text.strip() for cell in row.cells] for row in obj.rows]
                current["blocks"].append({"type": "table", "rows": rows})
            pending_written = None
            continue

        txt = obj.text.strip()
        style = obj.style.name
        if style.startswith("Heading 1"):
            finish_quiz()
            in_answer_key = exclude_key and "Answer Key for Checking" in txt
            if in_answer_key:
                current = None
                continue
            if exclude_key and in_answer_key:
                continue
            current = {"id": "s" + str(len(sections) + 1), "title": split_heading(txt), "blocks": []}
            sections.append(current)
            pending_written = None
            continue

        if in_answer_key:
            if "References and editorial basis" in txt and style.startswith("Heading 1"):
                in_answer_key = False
            else:
                continue

        if current is None or not txt:
            continue
        if style.startswith("Heading 2"):
            finish_quiz()
            current["blocks"].append({"type": "subheading", "title": split_heading(txt)})
            pending_written = None
            continue

        qmatch = QUIZ_QUESTION.match(txt)
        if qmatch:
            finish_quiz()
            pending_quiz = {"type": "quiz", "id": qmatch.group(1), "question": qmatch.group(2), "options": []}
            pending_written = None
            continue

        omatch = OPTION.match(txt)
        if omatch and pending_quiz is not None:
            pending_quiz["options"].append({"letter": omatch.group(1), "text": omatch.group(2)})
            continue
        finish_quiz()

        if re.fullmatch(r"[_\s]{15,}", txt):
            continue
        wmatch = WRITTEN_QUESTION.match(txt)
        if wmatch and exclude_key:
            pending_written = wmatch.group(1)
            current["blocks"].append({"type": "written", "id": pending_written, "question": wmatch.group(2)})
            continue
        pending_written = None
        current["blocks"].append({"type": "bullet" if style.startswith("List") else "paragraph", "text": txt})

    finish_quiz()
    # XML section order is authoritative; strip empty sections, if any.
    return [section for section in sections if section["blocks"]]


def answer_key():
    tables = Document(SOURCE / BOOKS["workbook"]).tables
    answers = {}
    for table in tables[-2:]:
        for row in table.rows:
            for cell in row.cells:
                for code, choice in ANSWER_ENTRY.findall(cell.text):
                    answers[code] = choice
    return answers


def extract_logo():
    html = (SOURCE / "Arabic_Light_Student_Book_Lesson01_Branded_Editable.html").read_text(encoding="utf-8")
    match = IMAGE.search(html)
    if match:
        (OUTPUT / "academy-logo.png").write_bytes(base64.b64decode(match.group(1)))


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    app = {
        "title": "عَرَبِيَّةُ الْقُرْآنِ",
        "lesson": "سُورَةُ النَّاسِ",
        "books": {
            "student": build_book(BOOKS["student"]),
            "workbook": build_book(BOOKS["workbook"], exclude_key=True),
            "irab": build_book(BOOKS["irab"]),
        },
        "answerKey": answer_key(),
    }
    (OUTPUT / "content.json").write_text(json.dumps(app, ensure_ascii=False, indent=2), encoding="utf-8")
    extract_logo()
    print("books:", {key: len(value) for key, value in app["books"].items()})
    quiz = [block for book in app["books"].values() for section in book for block in section["blocks"] if block["type"] == "quiz"]
    missing = [q["id"] for q in quiz if q["id"] not in app["answerKey"]]
    print("quizzes:", len(quiz), "answer keys:", len(app["answerKey"]), "missing:", missing)
    if missing:
        raise SystemExit("Missing source answers; do not auto-grade these questions")


if __name__ == "__main__":
    main()
