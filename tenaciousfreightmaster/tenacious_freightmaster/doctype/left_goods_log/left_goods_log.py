# Copyright (c) 2024, Joshua Joseph Michael and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe import _



class LeftGoodsLog(Document):
    pass


# tenaciousfreightmaster/tenacious_freightmaster/doctype/left_goods_log/left_goods_log.py


@frappe.whitelist()
def create_shipment_manifest_from_left_goods(left_goods_log_id):
    try:
        # Fetch the Left Goods Log document
        left_goods_log = frappe.get_doc('Left Goods Log', left_goods_log_id)

        # Validate status
        if left_goods_log.status != "Manifest Left":
            frappe.throw("Shipment Manifest can only be created for logs with status 'Manifest Left'.")

        # Check if a Shipment Manifest is already linked to the reference_shipment_manifest field
        if left_goods_log.reference_shipment_manifest:
            frappe.msgprint(_("A Shipment Manifest has already been created for this Left Goods Log."), alert=True)
            return None

        # Create a new Shipment Manifest
        shipment_manifest = frappe.new_doc("Shipment Manifest")
        shipment_manifest.reference_left_goods = left_goods_log.name
        shipment_manifest.customer = left_goods_log.customer
        shipment_manifest.destination = left_goods_log.destination

        # Populate the manifest details from Left Goods Log
        for left_goods_item in left_goods_log.left_goods_details:
            shipment_manifest.append("manifest_details", {
                "item_name": left_goods_item.item_name,
                "quantity": left_goods_item.quantity_left,
                "uom": left_goods_item.uom,
                "destination": left_goods_log.destination,  # Assuming destination is at the log level
            })

        # Save and submit the Shipment Manifest
        shipment_manifest.insert()
        # shipment_manifest.submit()

        # Update the Left Goods Log status and link the new Shipment Manifest
        frappe.db.set_value('Left Goods Log', left_goods_log.name, {
            'status': 'Shipped',
            'reference_shipment_manifest': shipment_manifest.name
        })

        return shipment_manifest.name

    except Exception as e:
        frappe.log_error(title="Error in create_shipment_manifest_from_left_goods", message=str(e))
        frappe.throw(f"Error: {str(e)}")

