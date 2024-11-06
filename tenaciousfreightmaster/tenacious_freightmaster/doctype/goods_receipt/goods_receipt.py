# Copyright (c) 2024, Joshua Joseph Michael and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class GoodsReceipt(Document):
    pass

def create_delivery_note(doc, method):
    # Create a new Delivery Note
    delivery_note = frappe.new_doc("Delivery Note")
    
    # Set basic details
    delivery_note.customer = doc.customer
    delivery_note.posting_date = doc.received_date  # Or frappe.utils.nowdate() for current date

    # Copy items from Goods Receipt to Delivery Note
    for item in doc.goods_details:
        delivery_note.append("items", {
            "item_code": item.item_name,
            "description": item.description,
            "qty": item.quantity,
            "uom": item.uom,
            "rate": item.get('rate', 0)  # Assuming rate field or set to 0 if missing
        })

    # Save and submit the Delivery Note
    delivery_note.insert()
    delivery_note.submit()
    
    frappe.msgprint(f"Delivery Note {delivery_note.name} has been created and submitted.")
