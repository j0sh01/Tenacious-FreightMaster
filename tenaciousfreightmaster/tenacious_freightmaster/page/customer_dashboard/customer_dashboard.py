import frappe

@frappe.whitelist()
def get_dashboard_data(customer=None):
    # If no customer is provided, check the logged-in user's linked customer
    if not customer and frappe.session.user != "Administrator":
        linked_customer = frappe.db.get_value("Portal User", {"user": frappe.session.user}, "parent")
        if not linked_customer:
            frappe.throw("You are not linked to any customer. Please contact the administrator.")
        customer = linked_customer

    filters = {}
    if customer:
        filters["customer"] = customer

    # Fetch data based on the customer filter
    sales_invoices = frappe.db.sql("""
        SELECT name, customer, posting_date, due_date, base_grand_total, outstanding_amount, status
        FROM `tabSales Invoice`
        WHERE docstatus = 1 {customer_condition}
        ORDER BY posting_date DESC
        LIMIT 10
    """.format(customer_condition="AND customer = %(customer)s" if customer else ""), filters, as_dict=True)

    payment_entries = frappe.db.sql("""
        SELECT name, posting_date, party, payment_type, paid_amount, status
        FROM `tabPayment Entry`
        WHERE docstatus = 1 {customer_condition}
        ORDER BY posting_date DESC
        LIMIT 10
    """.format(customer_condition="AND party = %(customer)s" if customer else ""), filters, as_dict=True)

    shipment_manifests = frappe.db.sql("""
        SELECT name, shipment_date, vehicle, customer, destination, total_shipping_charges
        FROM `tabShipment Manifest`
        WHERE docstatus = 1 {customer_condition}
        ORDER BY shipment_date DESC
        LIMIT 10
    """.format(customer_condition="AND customer = %(customer)s" if customer else ""), filters, as_dict=True)

    vehicle_logs = frappe.db.sql("""
        SELECT vl.name AS vehicle_log_name, vl.vehicle_id, vl.driver_name, vl.log_date,
               vld.reference_shipment_manifest, vld.shipping_date, vld.shipping_charges, 
               vld.customer AS log_customer, vld.destination, vl.status
        FROM `tabVehicle Log` vl
        LEFT JOIN `tabVehicle Log Details` vld ON vl.name = vld.parent
        {customer_condition}
        ORDER BY vl.log_date DESC
        LIMIT 10
    """.format(customer_condition="WHERE vld.customer = %(customer)s" if customer else ""), filters, as_dict=True)

    left_goods_logs = frappe.db.sql("""
        SELECT name, customer, log_date, destination, status
        FROM `tabLeft Goods Log`
        WHERE docstatus = 1 {customer_condition}
        ORDER BY log_date DESC
        LIMIT 10
    """.format(customer_condition="AND customer = %(customer)s" if customer else ""), filters, as_dict=True)

    goods_receipts = frappe.db.sql("""
        SELECT gr.name, gr.customer, gr.received_date, gr.destination, gr.total_amount, gr.status
        FROM `tabGoods Receipt` gr
        WHERE gr.docstatus = 1 {customer_condition}
        ORDER BY gr.received_date DESC
        LIMIT 10
    """.format(customer_condition="AND gr.customer = %(customer)s" if customer else ""), filters, as_dict=True)

        # Query for delivery notes
    delivery_notes = frappe.db.sql("""
        SELECT 
            name, customer, posting_date, total, status
        FROM 
            `tabDelivery Note`
        WHERE 
            docstatus = 1 {customer_condition}
        ORDER BY 
            posting_date DESC
        LIMIT 10
    """.format(customer_condition="AND customer = %(customer)s" if customer else ""), filters, as_dict=True)

    return {
        "delivery_notes": delivery_notes,
        "goods_receipts": goods_receipts,
        "sales_invoices": sales_invoices,
        "payment_entries": payment_entries,
        "shipment_manifests": shipment_manifests,
        "vehicle_logs": vehicle_logs,
        "left_goods_logs": left_goods_logs,
    }
