# Copyright (c) 2024, Joshua Joseph Michael and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import nowdate
from frappe import _ 


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
                "shipping_date": doc.shipment_date,
                "destination": doc.destination
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
        vehicle_log_doc.status = "Awaiting"  # or set as appropriate
        
        # Add the Shipment Manifest to the child table
        vehicle_log_doc.append("vehicle_log_details", {
            "reference_shipment_manifest": doc.name,
            "shipping_date": doc.shipment_date,
            "destination": doc.destination
        })
        
        # Insert and save the new Vehicle Log
        vehicle_log_doc.insert()
        frappe.msgprint(f"New Vehicle Log created: {vehicle_log_doc.name}")
        
        # Update the reference_vehicle_log field in Shipment Manifest
        doc.reference_vehicle_log = vehicle_log_doc.name
        doc.db_set("reference_vehicle_log", vehicle_log_doc.name)  # save the update immediately

# Hook this function to be called on submit of the Shipment Manifest

# @frappe.whitelist()
# def create_shipment_manifest_from_left_goods_log(left_goods_log):
#     """
#     Create a new Shipment Manifest from the Left Goods Log.
#     """
#     left_goods_log = frappe.get_doc('Left Goods Log', left_goods_log)

#     new_shipment_manifest = frappe.new_doc('Shipment Manifest')
#     new_shipment_manifest.customer = left_goods_log.customer
#     new_shipment_manifest.status = 'Open'

#     for item_details in left_goods_log.left_goods_details:
#         new_shipment_manifest.append('manifest_details', {
#             'item_name': item_details.item_name,
#             'quantity': item_details.quantity_left,
#             'uom': item_details.uom
#         })

#     new_shipment_manifest.insert()
#     frappe.msgprint(f"New Shipment Manifest {new_shipment_manifest.name} has been created for the left goods.")


@frappe.whitelist()
def create_and_submit_shipment_manifest(left_goods_log_name):
    """
    Create a new Shipment Manifest from the Left Goods Log and submit it.
    """
    # Get the Left Goods Log document
    left_goods_log = frappe.get_doc('Left Goods Log', left_goods_log_name)

    # Ensure a shipment manifest doesn't already exist for the left goods log
    if left_goods_log.shipment_manifest:
        frappe.throw(_("A Shipment Manifest has already been created for this Left Goods Log."))

    # Create a new Shipment Manifest document
    shipment_manifest = frappe.new_doc('Shipment Manifest')
    shipment_manifest.customer = left_goods_log.customer
    shipment_manifest.status = 'Open'

    # Add the left goods details to the new manifest
    for item in left_goods_log.left_goods_details:
        shipment_manifest.append('manifest_details', {
            'item_name': item.item_name,
            'quantity': item.quantity_left,
            'uom': item.uom
        })

    # Insert the new manifest
    shipment_manifest.insert()

    # Submit the Shipment Manifest
    shipment_manifest.submit()

    # Update the Left Goods Log to mark it as "Shipped" and associate it with the manifest
    left_goods_log.status = 'Shipped'
    left_goods_log.shipment_manifest = shipment_manifest.name
    left_goods_log.save()

    # Return the name of the newly created Shipment Manifest for redirecting
    return shipment_manifest.name