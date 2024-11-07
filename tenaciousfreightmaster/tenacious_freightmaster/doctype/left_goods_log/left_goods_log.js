// Copyright (c) 2024, Joshua Joseph Michael and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Left Goods Log", {
// 	refresh(frm) {

// 	},
// });

frappe.ui.form.on('Left Goods Log', {
    refresh: function(frm) {
        if (frm.doc.docstatus === 1 && frm.doc.status !== 'Shipped') { // Ensure button shows only if the document is submitted and not already shipped
            frm.add_custom_button(__('Ship Left Goods'), function() {
                frappe.call({
                    method: "tenaciousfreightmaster.tenacious_freightmaster.doctype.left_goods_log.left_goods_log.create_shipment_for_left_goods",
                    args: {
                        left_goods_log_name: frm.doc.name
                    },
                    callback: function(r) {
                        if (r.message) {
                            frappe.msgprint(`New Shipment Manifest ${r.message} created and Left Goods Log marked as shipped.`);
                            frm.reload_doc(); // Refreshes the form to show the updated status
                        }
                    }
                });
            });
        }
    }
});

