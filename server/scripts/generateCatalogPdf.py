from pathlib import Path

from reportlab import rl_config
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen.canvas import Canvas


REPO_ROOT = Path(__file__).resolve().parents[2]
PAGE_DIRECTORY = REPO_ROOT / "server" / "catalog" / "pages"
OUTPUT_DIRECTORY = REPO_ROOT / "output" / "pdf"
OUTPUT_PATH = OUTPUT_DIRECTORY / "EC_Product_Catalog_2026.pdf"


def main():
    pages = sorted(PAGE_DIRECTORY.glob("[0-9][0-9][0-9]_*.jpg"))
    if not pages:
        raise RuntimeError(f"No catalog pages found in {PAGE_DIRECTORY}")

    OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    width, height = letter
    # Store the source JPEG streams directly. ASCII85 encoding adds roughly
    # one third to the attachment size without improving image quality.
    rl_config.useA85 = 0
    pdf = Canvas(str(OUTPUT_PATH), pagesize=letter, pageCompression=1)
    pdf.setTitle("Esteban Carreras 2026 Product Catalog")
    pdf.setAuthor("Esteban Carreras Cigar Co.")
    pdf.setSubject("Product catalog and domestic price sheet")

    for page in pages:
        pdf.drawImage(str(page), 0, 0, width=width, height=height)
        pdf.showPage()

    pdf.save()
    print(f"Created {OUTPUT_PATH} with {len(pages)} pages")


if __name__ == "__main__":
    main()
