# Copyright (c) 2024, Joshua Joseph Michael and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe import _



class LeftGoodsLog(Document):
    pass


@frappe.whitelist()
def create_shipment_manifest_from_left_goods_log(doc_name):
    try:
        # Fetch the Left Goods Log document
        left_goods_log = frappe.get_doc("Left Goods Log", doc_name)
        
        # Create a new Shipment Manifest
        shipment_manifest = frappe.new_doc("Shipment Manifest")
        shipment_manifest.customer = left_goods_log.customer
        shipment_manifest.destination = left_goods_log.destination
        shipment_manifest.reference_left_goods = left_goods_log.name
        shipment_manifest.status = "Open"  # Set the initial status as "Open"

        # Add items from Left Goods Log to the Shipment Manifest
        for item in left_goods_log.left_goods_details:
            shipment_manifest.append("manifest_details", {
                "item_name": item.item_name,
                "quantity": item.quantity_left,
                "uom": item.uom,
                "shipping_charges": item.shipping_charges  # Assuming the shipping charges are in left_goods_details
            })

        # Insert the Shipment Manifest
        shipment_manifest.insert()

        # Update the reference in Left Goods Log
        left_goods_log.db_set("reference_shipment_manifest", shipment_manifest.name)
        left_goods_log.db_set("status", "Shipped")  # Change the status to Shipped

        # Submit the Shipment Manifest (Optional)
        shipment_manifest.submit()

        # Return the created Shipment Manifest ID
        return shipment_manifest.name

    except Exception as e:
        # Log any errors that occur
        frappe.log_error(str(e), "Error in create_shipment_manifest_from_left_goods_log")
        frappe.throw(_("An error occurred while creating Shipment Manifest from Left Goods Log."))
