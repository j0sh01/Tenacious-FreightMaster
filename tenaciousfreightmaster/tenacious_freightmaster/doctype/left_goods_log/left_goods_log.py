# Copyright (c) 2024, Joshua Joseph Michael and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe import _



class LeftGoodsLog(Document):
    pass



@frappe.whitelist()
def create_shipment_manifest_from_left_goods_log(doc_name):
    # Get the Left Goods Log document by name
    left_goods_log = frappe.get_doc('Left Goods Log', doc_name)

    # Proceed only if the document exists
    if left_goods_log:
        # Check if the status is 'Manifest Left' or any other condition you need
        if left_goods_log.status == 'Manifest Left':
            # Create a new Shipment Manifest
            shipment_manifest = frappe.new_doc('Shipment Manifest')
            shipment_manifest.reference_left_goods = left_goods_log.name
            shipment_manifest.status = 'Draft'  # Set the initial status
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
        else:
            frappe.throw(f"Left Goods Log {doc_name} is not eligible for shipment manifest creation.")
    else:
        frappe.throw(f"Left Goods Log {doc_name} not found.")
