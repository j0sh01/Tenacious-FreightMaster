// Copyright (c) 2024, Joshua Joseph Michael and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Goods Receipt", {
// 	refresh(frm) {

// 	},
// });

frappe.ui.form.on('Goods Receipt', {
    onload: function(frm) {
        // Set the main_agent field to the current logged-in user if it's empty
        if (!frm.doc.main_agent) {
            frm.set_value('main_agent', frappe.session.user);
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
