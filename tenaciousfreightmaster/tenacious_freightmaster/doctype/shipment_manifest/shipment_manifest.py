# Copyright (c) 2024, Joshua Joseph Michael and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import nowdate


class ShipmentManifest(Document):
    pass

def create_left_goods_log(doc, method):
    try:
        # Fetch the Shipment Manifest document
        shipment_manifest = frappe.get_doc('Shipment Manifest', doc.name)

        # Create a new Left Goods Log document
        left_goods_log = frappe.new_doc('Left Goods Log')
        left_goods_log.customer = shipment_manifest.customer
        left_goods_log.shipment_manifest = doc.name
        left_goods_log.destination = doc.destination
        left_goods_log.goods_receipt = shipment_manifest.reference_goods_receipt
        left_goods_log.log_date = frappe.utils.nowdate()  # Set today's date for the log

        # Populate the Left Goods Log details
        left_goods_details = {}
        for manifest_item in shipment_manifest.manifest_details:
            goods_receipt_doc = frappe.get_doc('Goods Receipt', shipment_manifest.reference_goods_receipt)
            for gr_item in goods_receipt_doc.goods_details:
                if gr_item.item_name == manifest_item.item_name:
                    quantity_submitted = gr_item.quantity
                    quantity_shipped = manifest_item.quantity
                    quantity_left = quantity_submitted - quantity_shipped
                    if quantity_left > 0:
                        if gr_item.item_name not in left_goods_details:
                            left_goods_details[gr_item.item_name] = {
                                'item_name': gr_item.item_name,
                                'quantity_submitted': 0,
                                'quantity_shipped': 0,
                                'quantity_left': 0,
                                'uom': gr_item.uom,
                                'remarks': f"Discrepancy found for {gr_item.item_name}"
                            }
                        left_goods_details[gr_item.item_name]['quantity_submitted'] += quantity_submitted
                        left_goods_details[gr_item.item_name]['quantity_shipped'] += quantity_shipped
                        left_goods_details[gr_item.item_name]['quantity_left'] += quantity_left

        # Add the Left Goods Log details
        for item_details in left_goods_details.values():
            left_goods_log.append('left_goods_details', item_details)

        # Save and submit the Left Goods Log if it has discrepancies
        if left_goods_log.left_goods_details:
            left_goods_log.insert()
            left_goods_log.submit()
            frappe.msgprint(f"Left Goods Log {left_goods_log.name} has been created successfully.")
        else:
            frappe.msgprint("No discrepancies found, so no Left Goods Log was created.")

    except Exception as e:
        frappe.log_error(e, "Error in create_left_goods_log")
        frappe.msgprint(f"Error: {str(e)}")



def create_or_update_vehicle_log(doc, method):
    # Get today's date
    today_date = nowdate()
    
    # Check if there's an existing Vehicle Log for the selected vehicle on the current date
    vehicle_log = frappe.db.get_value("Vehicle Log", 
                                      {"vehicle_id": doc.vehicle, "log_date": today_date}, 
                                      "name")
    
    if vehicle_log:
        # Fetch the existing Vehicle Log document
        vehicle_log_doc = frappe.get_doc("Vehicle Log", vehicle_log)
        
        # Check if this Shipment Manifest is already logged to avoid duplicates
        existing_manifest = any(detail.reference_shipment_manifest == doc.name 
                                for detail in vehicle_log_doc.vehicle_log_details)
        if not existing_manifest:
            # Add the Shipment Manifest to the child table
            vehicle_log_doc.append("vehicle_log_details", {
                "reference_shipment_manifest": doc.name,
                "shipping_date": doc.shipment_date
            })
            vehicle_log_doc.save()
            frappe.msgprint(f"Shipment Manifest added to existing Vehicle Log: {vehicle_log_doc.name}")
        
        # Update the reference_vehicle_log field in Shipment Manifest
        doc.reference_vehicle_log = vehicle_log_doc.name
        doc.db_set("reference_vehicle_log", vehicle_log_doc.name)  # save the update immediately
    
    else:
        # Create a new Vehicle Log for today
        vehicle_log_doc = frappe.new_doc("Vehicle Log")
        vehicle_log_doc.vehicle_id = doc.vehicle
        vehicle_log_doc.log_date = today_date
        vehicle_log_doc.status = "In Transit"  # or set as appropriate
        
        # Add the Shipment Manifest to the child table
        vehicle_log_doc.append("vehicle_log_details", {
            "reference_shipment_manifest": doc.name,
            "shipping_date": doc.shipment_date
        })
        
        # Insert and save the new Vehicle Log
        vehicle_log_doc.insert()
        frappe.msgprint(f"New Vehicle Log created: {vehicle_log_doc.name}")
        
        # Update the reference_vehicle_log field in Shipment Manifest
        doc.reference_vehicle_log = vehicle_log_doc.name
        doc.db_set("reference_vehicle_log", vehicle_log_doc.name)  # save the update immediately

# Hook this function to be called on submit of the Shipment Manifest