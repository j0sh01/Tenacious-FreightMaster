// Copyright (c) 2024, Joshua Joseph Michael and contributors
// For license information, please see license.txt

frappe.ui.form.on('Goods Receipt', {
    onload: function(frm) {
        if (!frm.doc.main_agent) {
            frappe.db.get_value('User', frappe.session.user, 'full_name', (r) => {
                if (r && r.full_name) {
                    frm.set_value('main_agent', r.full_name);
                }
            });
        }
    }
});


frappe.ui.form.on('Goods Receipt', {
    onload: function(frm) {
        if (!frm.doc.received_date) {
            frm.set_value('received_date', frappe.datetime.get_today());
        }
    }
});

frappe.ui.form.on('Goods Details', {
    quantity: function(frm, cdt, cdn) {
        calculate_amount(frm, cdt, cdn);
    },
    rate: function(frm, cdt, cdn) {
        calculate_amount(frm, cdt, cdn);
    }
});

function calculate_amount(frm, cdt, cdn) {
    let row = frappe.get_doc(cdt, cdn);
    if (row.quantity && row.rate) {
        row.amount = row.quantity * row.rate;
        frm.refresh_field("goods_details");  // Assuming 'goods_details' is the child table field name
    }
}


frappe.ui.form.on("Goods Receipt", {
    refresh: function(frm) {
        // Check if the document is submitted
        if (frm.doc.docstatus == 1 && !frm.doc.delivery_note) {
            frm.add_custom_button(__('Create Delivery Note'), function() {
                // Refresh the form first to avoid stale data
                frm.refresh();

                // Now call the server method to create the Delivery Note
                frappe.call({
                    method: "tenaciousfreightmaster.tenacious_freightmaster.doctype.goods_receipt.goods_receipt.create_delivery_note",
                    args: {
                        doc_name: frm.doc.name
                    },
                    callback: function(r) {
                        if (r.message) {
                            // Set the created Delivery Note ID directly
                            frappe.db.set_value("Goods Receipt", frm.doc.name, "delivery_note", r.message)
                                .then(() => {
                                    frappe.show_alert({message: __("Delivery Note created: " + r.message), indicator: 'green'});
                                });
                                frappe.set_route('Form', 'Delivery Note', r.message);
                        }
                    }
                });
            });
        } else if (frm.doc.delivery_note) {
            // If the delivery note is already created, show a button to view it
            frm.add_custom_button(__('View Delivery Note'), function() {
                frappe.set_route('Form', 'Delivery Note', frm.doc.delivery_note);
            });
        }
    }
});


frappe.ui.form.on("Goods Receipt", {
    refresh: function(frm) {
        // Check if document is submitted and status is 'Available for Shipment'
        if (frm.doc.docstatus == 1 && frm.doc.status === "Available for Shipment") {
            frm.add_custom_button(__('Create Shipment Manifest'), function() {
                // Refresh the form first to avoid stale data
                frm.refresh();

                // Call server method to create Shipment Manifest
                frappe.call({
                    method: "tenaciousfreightmaster.tenacious_freightmaster.doctype.goods_receipt.goods_receipt.create_shipment_manifest",
                    args: {
                        doc_name: frm.doc.name
                    },
                    callback: function(r) {
                        if (r.message) {
                            // Set the created Shipment Manifest ID and refresh
                            frappe.db.set_value("Goods Receipt", frm.doc.name, {
                                "shipment_manifest": r.message,
                                "status": "Shipped"
                            }).then(() => {
                                frm.reload_doc();
                                frappe.show_alert({
                                    message: __("Shipment Manifest created: " + r.message), 
                                    indicator: 'green'
                                });
                                // Navigate to the new Shipment Manifest
                                frappe.set_route('Form', 'Shipment Manifest', r.message);
                            });
                        }
                    }
                });
            });
        } else if (frm.doc.shipment_manifest) {
            // If shipment manifest exists, show button to view it
            frm.add_custom_button(__('View Shipment Manifest'), function() {
                frappe.set_route('Form', 'Shipment Manifest', frm.doc.shipment_manifest);
            });
        }
    }
});

frappe.ui.form.on('Goods Receipt', {
    before_save: function(frm) {
        calculate_total_amount(frm);
    }
});

frappe.ui.form.on('Goods Details', {
    amount: function(frm, cdt, cdn) {
        calculate_total_amount(frm); 
    },
    amount_remove: function(frm) {
        calculate_total_amount(frm); 
    }
});

function calculate_total_amount(frm) {
    let total = 0;

    if (frm.doc.goods_details) {
        frm.doc.goods_details.forEach(row => {
            total += row.amount || 0;
        });
    }

    frm.set_value('total_amount', total);
}
