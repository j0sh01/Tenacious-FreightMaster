import frappe

@frappe.whitelist()
def get_customer_history():
    # Identify the logged-in customer
    customer = frappe.db.get_value("Customer", {"user_id": frappe.session.user}, "name")
    if not customer:
        frappe.throw("No customer linked to this user")

    # Fetch data for the customer
    history = {
        "goods_receipts": frappe.get_all("Goods Receipt", filters={"customer": customer}, fields=["name", "received_date", "status"]),
        "delivery_notes": frappe.get_all("Delivery Note", filters={"customer": customer}, fields=["name", "posting_date", "status"]),
        "shipment_manifests": frappe.get_all("Shipment Manifest", filters={"customer": customer}, fields=["name", "status"]),
        "sales_invoices": frappe.get_all("Sales Invoice", filters={"customer": customer}, fields=["name", "posting_date", "status", "grand_total"]),
        "payments": frappe.get_all("Payment Entry", filters={"party_name": customer}, fields=["name", "posting_date", "amount"]),
        "vehicle_logs": frappe.get_all("Vehicle Log", filters={"customer": customer}, fields=["name", "date", "vehicle"]),
    }

    return history
