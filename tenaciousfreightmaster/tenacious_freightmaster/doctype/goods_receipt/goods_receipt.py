# Copyright (c) 2024, Joshua Joseph Michael and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class GoodsReceipt(Document):
    def before_save(self):
        pass

@frappe.whitelist()
def create_delivery_note(doc_name):
    # Load the Goods Receipt document
    doc = frappe.get_doc("Goods Receipt", doc_name)

    # Check if a Delivery Note already exists
    if doc.delivery_note:
        frappe.msgprint(_("A Delivery Note has already been created for this Goods Receipt."), alert=True)
        return None

    # Create a new Delivery Note
    delivery_note = frappe.new_doc("Delivery Note")
    delivery_note.customer = doc.customer
    delivery_note.posting_date = doc.received_date  # Use the Goods Receipt date

    # Copy items from Goods Receipt to Delivery Note
    for item in doc.goods_details:
        delivery_note.append("items", {
            "item_code": item.item_name,
            "description": item.description,
            "qty": item.quantity,
            "uom": item.uom,
            "rate": item.get('rate', 0)
        })

    # Save and submit the Delivery Note
    delivery_note.insert()
    delivery_note.submit()

    # Link Delivery Note ID back to Goods Receipt
    doc.db_set("delivery_note", delivery_note.name)

    # Return the created Delivery Note ID to update the field on the client side
    return delivery_note.name
