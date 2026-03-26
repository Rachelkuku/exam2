from __future__ import annotations

import json
import re
from pathlib import Path

import fitz


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
PDF_DIR = ROOT / "tmp" / "kclep"
OUTPUT_DIR = ROOT / "public" / "question-figures"
QUESTION_COUNT = 15
QUESTION_RE = re.compile(r"^\s*(1[0-5]|[1-9])\.\s*(.*)")
OPTION_LABELS = {"①", "②", "③", "④", "⑤", "1.", "2.", "3.", "4.", "5."}


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value.replace("\t", " ")).strip()


def score_question_start(candidate: str, expected: str) -> int:
    left = clean_text(candidate)
    right = clean_text(expected)

    if not left or not right:
        return 0

    score = 0
    for a, b in zip(left, right):
        if a != b:
            break
        score += 1

    if left in right:
        score = max(score, len(left))

    return score


def load_question_starts(doc: fitz.Document, questions: list[dict]) -> list[dict[str, float]]:
    candidates: list[dict[str, float | int | str]] = []

    for page_index, page in enumerate(doc):
        blocks = page.get_text("blocks")
        blocks.sort(key=lambda block: (block[1], block[0]))

        for block_index, (x0, y0, x1, y1, text, *_rest) in enumerate(blocks):
            line = clean_text(text)
            match = QUESTION_RE.match(line)
            if not match:
                continue

            number = int(match.group(1))
            if number > QUESTION_COUNT:
                continue

            candidates.append(
                {
                    "number": number,
                    "page": page_index,
                    "block": block_index,
                    "x0": x0,
                    "y0": y0,
                    "x1": x1,
                    "y1": y1,
                    "text": clean_text(match.group(2)),
                }
            )

    starts: list[dict[str, float]] = []
    cursor = 0

    for question in questions[:QUESTION_COUNT]:
        number = question["number"]
        expected = question["question"]
        best_index: int | None = None
        best_score = -1

        for index in range(cursor, len(candidates)):
            candidate = candidates[index]
            if candidate["number"] != number:
                continue

            score = score_question_start(str(candidate["text"]), expected)
            if score > best_score:
                best_score = score
                best_index = index

        if best_index is None or best_score < 4:
            continue

        candidate = candidates[best_index]
        starts.append(
            {
                "number": number,
                "page": int(candidate["page"]),
                "x0": float(candidate["x0"]),
                "y0": float(candidate["y0"]),
                "x1": float(candidate["x1"]),
                "y1": float(candidate["y1"]),
            }
        )
        cursor = best_index + 1

    return starts


def get_first_option_y(page: fitz.Page, top: float, bottom: float) -> float | None:
    option_y: float | None = None

    for x0, y0, _x1, _y1, word, *_rest in page.get_text("words"):
        if y0 < top or y0 > bottom:
            continue

        if clean_text(word) not in OPTION_LABELS:
            continue

        option_y = y0 if option_y is None else min(option_y, y0)

    return option_y


def get_drawing_bounds(page: fitz.Page, top: float, bottom: float) -> fitz.Rect | None:
    drawing_rects: list[fitz.Rect] = []

    for drawing in page.get_drawings():
        rect = drawing.get("rect")
        if rect is None:
            continue

        if rect.y1 < top or rect.y0 > bottom:
            continue

        drawing_rects.append(rect)

    if not drawing_rects:
        return None

    bounds = fitz.Rect(drawing_rects[0])
    for rect in drawing_rects[1:]:
        bounds.include_rect(rect)
    return bounds


def expand_with_blocks(page: fitz.Page, bounds: fitz.Rect, top: float, bottom: float) -> fitz.Rect:
    expanded = fitz.Rect(bounds)

    for x0, y0, x1, y1, text, *_rest in page.get_text("blocks"):
        rect = fitz.Rect(x0, y0, x1, y1)
        if rect.y1 < top or rect.y0 > bottom:
            continue

        if rect.y1 < bounds.y0 - 18 or rect.y0 > bounds.y1 + 18:
            continue

        if not clean_text(text):
            continue

        expanded.include_rect(rect)

    return expanded


def render_question_figure(exam_id: str, question_id: str, page: fitz.Page, clip: fitz.Rect) -> str:
    output_dir = OUTPUT_DIR / exam_id
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{question_id}.png"
    pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), clip=clip, alpha=False)
    pixmap.save(output_path)
    return f"/question-figures/{exam_id}/{question_id}.png"


def process_exam(exam_no: int) -> None:
    exam_path = DATA_DIR / f"{exam_no}-a.json"
    pdf_path = PDF_DIR / f"{exam_no}-q.pdf"
    output_dir = OUTPUT_DIR / f"{exam_no}-a"

    if not exam_path.exists() or not pdf_path.exists():
        return

    if output_dir.exists():
        for old_file in output_dir.glob("*.png"):
            old_file.unlink()

    exam = json.loads(exam_path.read_text(encoding="utf-8"))
    doc = fitz.open(pdf_path)
    starts = load_question_starts(doc, exam["questions"])

    for index, question in enumerate(exam["questions"][:QUESTION_COUNT]):
        question.pop("figureImage", None)

        if index >= len(starts):
            continue

        start = starts[index]
        next_start = starts[index + 1] if index + 1 < len(starts) else None
        page = doc[start["page"]]
        page_rect = page.rect
        region_top = max(start["y1"] + 8, 0)
        region_bottom = page_rect.height - 24

        if next_start and next_start["page"] == start["page"]:
          region_bottom = min(region_bottom, next_start["y0"] - 10)

        option_y = get_first_option_y(page, region_top, region_bottom)
        if option_y is not None:
            region_bottom = min(region_bottom, option_y - 10)

        if region_bottom - region_top < 40:
            continue

        drawing_bounds = get_drawing_bounds(page, region_top, region_bottom)
        if drawing_bounds is None:
            continue

        clip = expand_with_blocks(page, drawing_bounds, region_top, region_bottom)
        clip.x0 = max(clip.x0 - 18, 24)
        clip.x1 = min(clip.x1 + 18, page_rect.width - 24)
        clip.y0 = max(clip.y0 - 18, region_top)
        clip.y1 = min(clip.y1 + 18, region_bottom)

        if clip.height < 60 or clip.width < 120:
            continue

        question["figureImage"] = render_question_figure(exam["examId"], question["id"], page, clip)

    exam_path.write_text(json.dumps(exam, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    doc.close()


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for exam_no in range(97, 125):
        process_exam(exam_no)


if __name__ == "__main__":
    main()
