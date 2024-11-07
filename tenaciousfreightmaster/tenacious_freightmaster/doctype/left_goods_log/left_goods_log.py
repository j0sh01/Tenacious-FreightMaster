# Copyright (c) 2024, Joshua Joseph Michael and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class LeftGoodsLog(Document):
	pass

import frappe

@frappe.whitelist()
def create_shipment_for_left_goods(left_goods_log_name):
    try:
        # Fetch the Left Goods Log document
        left_goods_log = frappe.get_doc("Left Goods Log", left_goods_log_name)

        # Check if already shipped
        if left_goods_log.status == 'Shipped':
            frappe.throw("This Left Goods Log has already been shipped.")

        # Create a new Shipment Manifest with zero-cost items
        shipment_manifest = frappe.new_doc("Shipment Manifest")
        shipment_manifest.customer = left_goods_log.customer
        shipment_manifest.reference_goods_receipt = left_goods_log.goods_receipt
        shipment_manifest.posting_date = frappe.utils.nowdate()

        # Add items with zero cost
        for item in left_goods_log.left_goods_details:
            shipment_manifest.append("manifest_details", {
                "item_name": item.item_name,
                "quantity": item.quantity_left,
                "rate": 0  # Set cost to 0
            })

        # Save and submit the new Shipment Manifest
        shipment_manifest.insert()
        shipment_manifest.submit()

        # Update the status of Left Goods Log to 'Shipped' and save
        left_goods_log.db_set("status", "Shipped")
        frappe.db.commit()

        return shipment_manifest.name

    except Exception as e:
        frappe.throw(f"An error occurred: {str(e)}")
