import os
import docx
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def build_docx_proposal(output_docx_path):
    doc = docx.Document()
    
    # 0.75 inch margins
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # 1. Main Header
    p_course = doc.add_paragraph()
    p_course.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_c = p_course.add_run("WEB PROGRAMMING")
    r_c.font.name = "Arial"
    r_c.font.size = Pt(15)
    r_c.bold = True
    r_c.font.color.rgb = RGBColor(15, 23, 42)
    p_course.paragraph_format.space_before = Pt(0)
    p_course.paragraph_format.space_after = Pt(2)

    p_prop = doc.add_paragraph()
    p_prop.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_p = p_prop.add_run("Project Proposal")
    r_p.font.name = "Arial"
    r_p.font.size = Pt(13)
    r_p.bold = True
    r_p.font.color.rgb = RGBColor(71, 85, 105)
    p_prop.paragraph_format.space_before = Pt(0)
    p_prop.paragraph_format.space_after = Pt(10)

    # 2. Metadata Table
    table = doc.add_table(rows=4, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_data = [
        ("Section Number", "BCS-6B"),
        ("Group Member 1", "23L-3038  Muhammad Umer"),
        ("Group Member 2", "23L-0695  Saad Ullah Fayyaz"),
        ("Project Title", "Daily Deals – Multi-Store E-Commerce Platform with AI Assistant")
    ]

    tblPr = table._tbl.tblPr
    tblBorders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        '<w:top w:val="single" w:sz="4" w:space="0" w:color="94A3B8"/>'
        '<w:left w:val="single" w:sz="4" w:space="0" w:color="94A3B8"/>'
        '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="94A3B8"/>'
        '<w:right w:val="single" w:sz="4" w:space="0" w:color="94A3B8"/>'
        '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
        '<w:insideV w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
        '</w:tblBorders>'
    )
    tblPr.append(tblBorders)

    col_widths = [Inches(1.8), Inches(5.2)]
    for i, (label, val) in enumerate(table_data):
        row = table.rows[i]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width, c1.width = col_widths[0], col_widths[1]
        
        c0.text = label
        c1.text = val
        
        set_cell_background(c0, "F8FAFC")
        set_cell_margins(c0, top=80, bottom=80, left=120, right=120)
        set_cell_margins(c1, top=80, bottom=80, left=120, right=120)
        
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_before = Pt(1)
        p0.paragraph_format.space_after = Pt(1)
        for r in p0.runs:
            r.bold = True
            r.font.name = 'Arial'
            r.font.size = Pt(10)
            r.font.color.rgb = RGBColor(15, 23, 42)
            
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_before = Pt(1)
        p1.paragraph_format.space_after = Pt(1)
        for r in p1.runs:
            r.font.name = 'Arial'
            r.font.size = Pt(10)
            if label == "Project Title":
                r.bold = True
                r.font.color.rgb = RGBColor(3, 105, 161)
            else:
                r.font.color.rgb = RGBColor(30, 41, 59)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # 3. Section: Project Scope
    p_scope_head = doc.add_paragraph()
    r_sh = p_scope_head.add_run("Project Scope")
    r_sh.bold = True
    r_sh.font.name = "Arial"
    r_sh.font.size = Pt(12)
    r_sh.font.color.rgb = RGBColor(15, 23, 42)
    p_scope_head.paragraph_format.space_before = Pt(8)
    p_scope_head.paragraph_format.space_after = Pt(4)

    scope_text = [
        "In modern online retail, independent brands and local businesses often face difficulties setting up dedicated online stores without dealing with overly complex enterprise solutions. On the other hand, shoppers frequently struggle with rigid navigation, lack of proper filters, and sizing uncertainty when purchasing clothes online.",
        "We propose developing 'Daily Deals', a modern, full-stack multi-store e-commerce web application. The platform aims to bridge the gap between everyday shoppers and independent fashion store owners by providing a clean, responsive, and scalable online marketplace.",
        "Key Objectives of the Proposed System:",
        "• Seamless Customer Experience: Provide guest-friendly catalog exploration, fast search, multi-criteria filtering (category, price, color, size), cart/wishlist management, and a simple multi-step checkout.",
        "• Vendor / Store Owner Portal: Give merchants their own dedicated dashboard to manage products, adjust inventory, view orders, and track sales progress.",
        "• AI Shopping Assistant: Integrate an intelligent chatbot helper to assist shoppers with sizing recommendations, answering common FAQs, and suggesting relevant items based on user preferences.",
        "• Scalable & Modular Architecture: Build a modular MERN stack architecture with a separate AI microservice, allowing future feature expansions such as payment gateway integrations and advanced analytics."
    ]

    for item in scope_text:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(3)
        if item.startswith("•"):
            p.paragraph_format.left_indent = Inches(0.2)
            parts = item.split(":", 1)
            r_pre = p.add_run(parts[0] + ":")
            r_pre.bold = True
            r_pre.font.name = "Arial"
            r_pre.font.size = Pt(9.5)
            r_pre.font.color.rgb = RGBColor(30, 41, 59)
            
            r_post = p.add_run(parts[1])
            r_post.font.name = "Arial"
            r_post.font.size = Pt(9.5)
            r_post.font.color.rgb = RGBColor(51, 65, 85)
        elif item.startswith("Key Objectives"):
            r = p.add_run(item)
            r.bold = True
            r.font.name = "Arial"
            r.font.size = Pt(10)
            r.font.color.rgb = RGBColor(3, 105, 161)
            p.paragraph_format.space_before = Pt(4)
        else:
            r = p.add_run(item)
            r.font.name = "Arial"
            r.font.size = Pt(9.5)
            r.font.color.rgb = RGBColor(51, 65, 85)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # 4. Section: Main Functionalities
    p_func_head = doc.add_paragraph()
    r_fh = p_func_head.add_run("Main Functionalities")
    r_fh.bold = True
    r_fh.font.name = "Arial"
    r_fh.font.size = Pt(12)
    r_fh.font.color.rgb = RGBColor(15, 23, 42)
    p_func_head.paragraph_format.space_before = Pt(8)
    p_func_head.paragraph_format.space_after = Pt(4)

    modules = [
        ("1. User Authentication & Role Management", [
            ("• Multi-User Roles: Distinct user flows for Customers and Store Owners.", True),
            ("• Authentication & Security: User registration and login using JWT (JSON Web Tokens) with secure password hashing.", True),
            ("• Guest Browsing: Unauthenticated users can freely explore the catalog, filter items, and view details; login is only requested when adding items to cart or checking out.", True)
        ]),
        ("2. Customer Storefront & Shopping Experience", [
            ("• Catalog & Filtering: Interactive product browsing with category filters, color swatches, price range sliders, and sorting (price, newest).", True),
            ("• Product Details & Reviews: Detailed product pages with multiple images, variant selection (size, color), customer ratings, and user reviews.", True),
            ("• Cart & Wishlist: Dynamic shopping cart and wishlist with live item counters and quantity updates.", True),
            ("• Checkout & Order History: Step-by-step checkout with delivery address selection, order summary, confirmation receipts, and status tracking (Pending, Shipped, Delivered).", True)
        ]),
        ("3. Store Owner / Merchant Dashboard", [
            ("• Store Profile Setup: Manage store name, description, and contact information.", True),
            ("• Product & Inventory Management: Add, edit, and delete products with image uploads, pricing, size/color variants, and stock tracking.", True),
            ("• Order Fulfillment: View incoming store orders, inspect customer shipping details, and update order status (Pending → Processing → Completed).", True),
            ("• Sales Overview: Basic visual summary cards and charts to track revenue, total orders, and top-selling products.", True)
        ]),
        ("4. AI-Powered Shopping Assistant", [
            ("• Smart Chatbot Helper: Floating chat widget accessible across the store.", True),
            ("• Size & Product Recommendations: Answering user questions about product sizing, materials, store policies, and suggesting matching items.", True)
        ]),
        ("5. Proposed Technology Stack", [
            ("• Frontend: React.js, Vite, Tailwind CSS, Redux Toolkit", True),
            ("• Backend: Node.js, Express.js (REST API)", True),
            ("• Database: MongoDB with Mongoose ODM", True),
            ("• AI Service: Python (FastAPI / LangChain) for chatbot assistance", True)
        ])
    ]

    for title, items in modules:
        p_t = doc.add_paragraph()
        r_t = p_t.add_run(title)
        r_t.bold = True
        r_t.font.name = "Arial"
        r_t.font.size = Pt(10)
        r_t.font.color.rgb = RGBColor(3, 105, 161)
        p_t.paragraph_format.space_before = Pt(4)
        p_t.paragraph_format.space_after = Pt(2)

        for text, is_bullet in items:
            p_b = doc.add_paragraph()
            p_b.paragraph_format.space_before = Pt(0)
            p_b.paragraph_format.space_after = Pt(2)
            if is_bullet:
                p_b.paragraph_format.left_indent = Inches(0.2)
            
            if is_bullet and ":" in text:
                parts = text.split(":", 1)
                r_prefix = p_b.add_run(parts[0] + ":")
                r_prefix.bold = True
                r_prefix.font.name = "Arial"
                r_prefix.font.size = Pt(9.5)
                r_prefix.font.color.rgb = RGBColor(30, 41, 59)
                
                r_rest = p_b.add_run(parts[1])
                r_rest.font.name = "Arial"
                r_rest.font.size = Pt(9.5)
                r_rest.font.color.rgb = RGBColor(51, 65, 85)
            else:
                r = p_b.add_run(text)
                r.font.name = "Arial"
                r.font.size = Pt(9.5)
                r.font.color.rgb = RGBColor(51, 65, 85)

    doc.save(output_docx_path)
    print(f"Document saved to {output_docx_path}")

if __name__ == "__main__":
    output_docx = r"E:\My Projects\Daily Deals\Project_Proposal.docx"
    build_docx_proposal(output_docx)
