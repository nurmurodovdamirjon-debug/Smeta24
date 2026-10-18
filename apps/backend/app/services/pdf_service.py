import os
from jinja2 import Environment, FileSystemLoader, select_autoescape
from typing import Dict, Any

TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
env = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR),
    autoescape=select_autoescape(['html', 'xml'])
)

def render_estimate_html(data: Dict[str, Any]) -> str:
    template = env.get_template("estimate_pdf.html")
    return template.render(**data)

def generate_estimate_pdf(html_content: str, output_path: str) -> str:
    """
    HTML shablonidan A4 PDF fayl yaratadi.
    Agar tizimda WeasyPrint o'rnatilgan bo'lsa undan foydalanadi,
    aks holda xavfsiz tarzda HTML fayl holida saqlaydi.
    """
    try:
        from weasyprint import HTML
        HTML(string=html_content).write_pdf(output_path)
        return output_path
    except Exception as e:
        print(f"WeasyPrint PDF generation fallback to HTML: {e}")
        fallback_html_path = output_path.replace(".pdf", ".html")
        with open(fallback_html_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        return fallback_html_path

def generate_estimate_pdf_bytes(html_content) -> bytes:
    """
    HTML shablonidan xotirada (RAM) to'g'ridan-to'g'ri PDF baytlarini yaratadi.
    Agar dict uzatilsa, avval render_estimate_html orqali HTML satriga aylantiriladi.
    """
    if isinstance(html_content, dict):
        html_content = render_estimate_html(html_content)

    try:
        from weasyprint import HTML
        return HTML(string=html_content).write_pdf()
    except ImportError:
        raise RuntimeError("WeasyPrint o'rnatilmagan. PDF yaratib bo'lmadi.")
    except Exception as e:
        raise RuntimeError(f"PDF yaratishda xatolik: {e}")
