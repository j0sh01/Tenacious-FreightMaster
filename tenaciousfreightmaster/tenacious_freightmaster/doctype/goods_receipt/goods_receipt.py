# Copyright (c) 2024, Joshua Joseph Michael and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class GoodsReceipt(Document):
    def on_submit(self):
        self.status = "Available for Shipment"
        
    def validate(self):
        if self.is_new() or self.docstatus == 0:
            self.status = "Available for Shipment"
            
    def get_status(self):
        '''
        Status can only be:
        - Available for Shipment
        - Shipped
        '''
        if self.shipment_manifest:
            return "Shipped"
        return "Available for Shipment"

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
    delivery_note.destination = doc.destination
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


@frappe.whitelist()
def create_shipment_manifest(doc_name):
    # Load the Goods Receipt document
    doc = frappe.get_doc("Goods Receipt", doc_name)

    # Check if a Shipment Manifest already exists
    if doc.shipment_manifest:
        frappe.msgprint(_("A Shipment Manifest has already been created for this Goods Receipt."), alert=True)
        return None

    # Create a new Shipment Manifest
    shipment_manifest = frappe.new_doc("Shipment Manifest")
    shipment_manifest.reference_goods_receipt = doc.name
    shipment_manifest.customer = doc.customer
    shipment_manifest.destination = doc.destination

    # Copy items from Goods Receipt to Shipment Manifest
    for item in doc.goods_details:
        shipment_manifest.append("manifest_details", {
            "item_name": item.item_name,
            "quantity": item.quantity,
            "uom": item.uom,
            "destination": item.destination,
            "shipping_charges": item.amount
        })

    # Save the Shipment Manifest
    shipment_manifest.insert()

    # Update the Goods Receipt status and link
    doc.db_set("shipment_manifest", shipment_manifest.name)
    doc.db_set("status", "Shipped")

    # Return the created Shipment Manifest ID
    return shipment_manifest.name