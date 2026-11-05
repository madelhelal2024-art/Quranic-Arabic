"""Verify the six Uthmani-script verses against Qur'an 114 (Quran.com).

Run from the project root: python3 scripts/check-quran-verses.py
The verse-end markers live in source content for backward compatibility,
but the app displays them separately as Arabic-Indic numerals.
"""

import json
from pathlib import Path


EXPECTED = [
    "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ",
    "مَلِكِ ٱلنَّاسِ",
    "إِلَـٰهِ ٱلنَّاسِ",
    "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ",
    "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ",
    "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ",
]


def main():
    content = json.loads((Path(__file__).resolve().parents[1] / 'dist' / 'content.json').read_text(encoding='utf-8'))
    for book in ('student', 'irab'):
        for number in range(1, 7):
            section = next(
                section for section in content['books'][book]
                if section['title']['en'].startswith(f'Verse {number}')
                and section['title']['en'].split(' ')[1] == str(number)
            )
            actual = section['blocks'][0]['text']
            expected = f'{EXPECTED[number - 1]}  ﴿{number}﴾'
            if actual != expected:
                raise AssertionError(f'{book}:114:{number} differs from the verified Uthmani text:\n{actual!r}\n{expected!r}')
    print('PASS: all six verses in both Student and Iʿrāb Books match the verified text.')


if __name__ == '__main__':
    main()
