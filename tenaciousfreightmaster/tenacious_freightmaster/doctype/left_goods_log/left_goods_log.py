# Copyright (c) 2024, Joshua Joseph Michael and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class LeftGoodsLog(Document):
	pass

import frappe
# from frappe.model.document import Document

class LeftGoodsLog(Document):
    @frappe.whitelist()
    def create_new_shipment_manifest(self):
        # Create a new Shipment Manifest document
        new_shipment_manifest = frappe.new_doc('Shipment Manifest')
        new_shipment_manifest.customer = self.customer
        new_shipment_manifest.status = 'Open'

        # Populate the new Shipment Manifest with details from the Left Goods Log
        for item_details in self.left_goods_details:
            new_shipment_manifest.append('manifest_details', {
                'item_name': item_details.item_name,
                'quantity': item_details.quantity_left,
                'uom': item_details.uom
            })

        new_shipment_manifest.insert()
        # new_shipment_manifest.submit()
        frappe.msgprint(f"New Shipment Manifest {new_shipment_manifest.name} has been created for the left goods.")