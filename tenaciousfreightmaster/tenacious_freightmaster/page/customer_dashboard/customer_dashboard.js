frappe.pages['customer-dashboard'].on_page_load = function (wrapper) {
    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Customer Dashboard',
        single_column: true
    });

    // Add the dashboard container
    $(frappe.render_template("customer_dashboard", {})).appendTo(page.main);

    let customer_filter = null;

    // Explicitly check if the logged-in user is an Administrator
    frappe.call({
        method: "frappe.client.get",
        args: {
            doctype: "User",
            name: frappe.session.user
        },
        callback: function (response) {
            if (response.message) {
                let roles = response.message.roles.map(role => role.role);
                if (roles.includes("Administrator")) {
                    // Add the customer filter for administrators
                    customer_filter = page.add_field({
                        fieldname: "customer",
                        label: __("Customer"),
                        fieldtype: "Link",
                        options: "Customer",
                        change: function () {
                            // Fetch data for the selected customer
                            fetch_dashboard_data(customer_filter.get_value());
                        }
                    });
                }
            }
            // Fetch all data for administrators or data for the associated customer for regular users
            fetch_dashboard_data();
        }
    });

    function fetch_dashboard_data(customer = null) {
        frappe.call({
            method: "tenaciousfreightmaster.tenacious_freightmaster.page.customer_dashboard.customer_dashboard.get_dashboard_data",
            args: {
                customer: customer
            },
            callback: function (r) {
                if (r.message) {
                    toggle_table_visibility("#goods-receipt-section", r.message.goods_receipts);
					toggle_table_visibility("#delivery-notes-section", r.message.delivery_notes);
                    toggle_table_visibility("#sales-invoice-section", r.message.sales_invoices);
                    toggle_table_visibility("#payment-entry-section", r.message.payment_entries);
                    toggle_table_visibility("#shipment-manifest-section", r.message.shipment_manifests);
                    toggle_table_visibility("#vehicle-log-section", r.message.vehicle_logs);
                    toggle_table_visibility("#left-goods-log-section", r.message.left_goods_logs);

                    populate_table("#goods-receipt-table", r.message.goods_receipts);
					populate_table("#delivery-notes-table", r.message.delivery_notes);
                    populate_table("#sales-invoice-table", r.message.sales_invoices);
                    populate_table("#payment-entry-table", r.message.payment_entries);
                    populate_table("#shipment-manifest-table", r.message.shipment_manifests);
                    populate_table("#vehicle-log-table", r.message.vehicle_logs);
                    populate_table("#left-goods-log-table", r.message.left_goods_logs);
                } else {
                    console.error("No data returned from the server.");
                }
            },
            error: function (err) {
                console.error("Error fetching dashboard data: ", err);
            }
        });
    }

    function toggle_table_visibility(section_id, data) {
        const section = $(section_id);
        if (!data || data.length === 0) {
            section.hide(); // Hide the section if no data
        } else {
            section.show(); // Show the section if data exists
        }
    }

    function populate_table(table_id, data) {
        let table_body = $(table_id).find("tbody");
        table_body.empty();

        if (data && data.length > 0) {
            data.forEach(row => {
                let html_row = "<tr>";
                for (let key in row) {
                    // Format monetary values
                    if (['total', 'outstanding_amount', 'base_grand_total', 'paid_amount', 'shipping_charges', 'total_shipping_charges', 'total_amount'].includes(key)) {
                        html_row += `<td>${format_currency(row[key])}</td>`;
                    } else {
                        html_row += `<td>${row[key] || ""}</td>`;
                    }
                }
                html_row += "</tr>";
                table_body.append(html_row);
            });
        }
    }

    // Function to format currency
    function format_currency(value) {
        if (typeof value === 'number') {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TZS' }).format(value);
        }
        return value || ""; // Return the value as-is if it's not a number
    }
};
