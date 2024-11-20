# Copyright (c) 2024, Joshua Joseph Michael and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe import _



class LeftGoodsLog(Document):
    pass


# tenaciousfreightmaster/tenacious_freightmaster/doctype/left_goods_log/left_goods_log.py


@frappe.whitelist()
def create_shipment_manifest_from_left_goods_log(doc_name):
    # Get the Left Goods Log document by name
    left_goods_log = frappe.get_doc('Left Goods Log', doc_name)

    # Ensure the left_goods_log exists and its status is 'Manifest Left'
    if not left_goods_log:
        frappe.throw(f"Left Goods Log {doc_name} not found.")
    if left_goods_log.status != 'Manifest Left':
        frappe.throw(f"Left Goods Log {doc_name} is not eligible for shipment manifest creation.")

    # Ensure reference_goods_receipt is set
    if not left_goods_log.reference_goods_receipt:
        frappe.throw(f"Goods Receipt reference not found for Left Goods Log {doc_name}.")

    # Unsubmit the Left Goods Log if it's already submitted (to update its status)
    if left_goods_log.docstatus == 1:
        left_goods_log.cancel()  # Unsubmit the document

    # Create a new Shipment Manifest
    shipment_manifest = frappe.new_doc('Shipment Manifest')
    shipment_manifest.reference_left_goods = left_goods_log.name
    shipment_manifest.status = 'Draft'  # Set initial status to Draft
    shipment_manifest.insert()

    # Add the details to the Shipment Manifest
    for item in left_goods_log.left_goods_details:
        shipment_manifest.append('manifest_details', {
            'item_name': item.item_name,
            'quantity_left': item.quantity_left,
            'uom': item.uom
        })

    # Submit the Shipment Manifest
    shipment_manifest.submit()

    # Update the Left Goods Log status to 'Shipped'
    left_goods_log.status = 'Shipped'
    left_goods_log.save()

    return shipment_manifest.name  # Return the name of the created Shipment Manifest
