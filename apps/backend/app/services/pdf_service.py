import os
from jinja2 import Environment, FileSystemLoader
from typing import Dict, Any

TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))

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
    except (ImportError, OSError):
        # Fallback to HTML if WeasyPrint binary dependencies aren't compiled yet on host
        fallback_html_path = output_path.replace(".pdf", ".html")
        with open(fallback_html_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        return fallback_html_path
