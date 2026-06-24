"""PDF export functionality for travel itineraries."""

from __future__ import annotations

import io
from typing import Optional

from fpdf import FPDF

from utils.models import Itinerary


def _sanitize(text: str) -> str:
    """Remove characters unsupported by the Helvetica font."""
    return text.encode("latin-1", errors="replace").decode("latin-1")


class TravelPDF(FPDF):
    """Custom PDF class for travel itineraries."""

    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=20)

    def header(self):
        self.set_font("Helvetica", "B", 12)
        self.set_text_color(41, 128, 185)
        self.cell(0, 10, "Smart Travel Planner", align="C", new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(41, 128, 185)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(128, 128, 128)
        self.cell(
            0, 10, f"Page {self.page_no()}/{{nb}}", align="C"
        )

    def _add_section_title(self, title: str):
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(44, 62, 80)
        self.cell(0, 10, _sanitize(title), new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def _add_subsection(self, title: str):
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(52, 73, 94)
        self.cell(0, 8, _sanitize(title), new_x="LMARGIN", new_y="NEXT")

    def _add_body_text(self, text: str):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(60, 60, 60)
        self.multi_cell(0, 6, _sanitize(text))
        self.ln(2)

    def _add_bullet(self, text: str):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(60, 60, 60)
        x = self.get_x()
        self.cell(8, 6, "-")
        self.multi_cell(0, 6, _sanitize(text))


def generate_itinerary_pdf(itinerary: Itinerary) -> bytes:
    """Generate a polished PDF from an Itinerary model."""
    pdf = TravelPDF()
    pdf.alias_nb_pages()
    pdf.add_page()

    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(41, 128, 185)
    pdf.cell(0, 15, _sanitize(itinerary.destination), align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 12)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(
        0,
        8,
        f"{itinerary.num_days}-Day {itinerary.budget_level.title()} Itinerary",
        align="C",
        new_x="LMARGIN",
        new_y="NEXT",
    )
    pdf.ln(5)

    if itinerary.trip_summary:
        pdf._add_section_title("Trip Overview")
        pdf._add_body_text(itinerary.trip_summary)

    if itinerary.total_estimated_cost:
        pdf._add_subsection(f"Estimated Total Cost: {itinerary.total_estimated_cost}")
        pdf.ln(5)

    for day in itinerary.days:
        pdf.add_page()
        day_title = f"Day {day.day_number}: {day.theme}"
        if day.date:
            day_title += f" ({day.date})"
        pdf._add_section_title(day_title)

        if day.daily_budget_estimate:
            pdf._add_subsection(
                f"Daily Budget Estimate: {day.daily_budget_estimate}"
            )
            pdf.ln(3)

        if day.activities:
            pdf._add_subsection("Activities")
            pdf.ln(2)
            for activity in day.activities:
                pdf.set_font("Helvetica", "B", 10)
                pdf.set_text_color(41, 128, 185)
                pdf.cell(25, 6, _sanitize(activity.time))
                pdf.set_text_color(44, 62, 80)
                pdf.cell(0, 6, _sanitize(activity.name), new_x="LMARGIN", new_y="NEXT")
                pdf.set_font("Helvetica", "", 9)
                pdf.set_text_color(100, 100, 100)
                pdf.set_x(35)
                pdf.multi_cell(0, 5, _sanitize(activity.description))
                pdf.set_x(35)
                details = []
                if activity.location:
                    details.append(f"Location: {activity.location}")
                if activity.estimated_cost != "Free":
                    details.append(f"Cost: {activity.estimated_cost}")
                if activity.duration:
                    details.append(f"Duration: {activity.duration}")
                if details:
                    pdf.set_font("Helvetica", "I", 8)
                    pdf.cell(0, 5, _sanitize(" | ".join(details)), new_x="LMARGIN", new_y="NEXT")
                pdf.ln(3)

        if day.meals:
            pdf._add_subsection("Meal Recommendations")
            pdf.ln(2)
            for meal in day.meals:
                pdf.set_font("Helvetica", "B", 10)
                pdf.set_text_color(231, 76, 60)
                pdf.cell(25, 6, _sanitize(meal.time))
                pdf.set_text_color(44, 62, 80)
                pdf.cell(0, 6, _sanitize(meal.name), new_x="LMARGIN", new_y="NEXT")
                pdf.set_font("Helvetica", "", 9)
                pdf.set_text_color(100, 100, 100)
                pdf.set_x(35)
                pdf.multi_cell(0, 5, _sanitize(meal.description))
                pdf.ln(2)

        if day.tips:
            pdf._add_subsection("Tips for Today")
            pdf.ln(2)
            for tip in day.tips:
                pdf._add_bullet(tip)

    if itinerary.packing_tips:
        pdf.add_page()
        pdf._add_section_title("Packing Tips")
        for tip in itinerary.packing_tips:
            pdf._add_bullet(tip)
        pdf.ln(5)

    if itinerary.general_tips:
        pdf._add_section_title("General Travel Tips")
        for tip in itinerary.general_tips:
            pdf._add_bullet(tip)

    return pdf.output()


def generate_simple_pdf(title: str, content: str) -> bytes:
    """Generate a simple PDF with a title and text content."""
    pdf = TravelPDF()
    pdf.alias_nb_pages()
    pdf.add_page()

    pdf.set_font("Helvetica", "B", 18)
    pdf.set_text_color(41, 128, 185)
    pdf.cell(0, 15, title, align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(10)

    pdf._add_body_text(content)

    return pdf.output()
