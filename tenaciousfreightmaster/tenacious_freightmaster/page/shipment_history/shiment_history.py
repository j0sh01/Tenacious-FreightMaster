# shipment_history.py

import frappe

@frappe.whitelist()
def get_customer_shipments(customer, status=None):
    filters = {'customer': customer}
    if status:
        filters['status'] = status

    shipments = frappe.get_all(
        'Shipment Manifest',
        fields=['shipment_date', 'item_name', 'quantity', 'status'],
        filters=filters,
        order_by='shipment_date desc'
    )

    return shipments
