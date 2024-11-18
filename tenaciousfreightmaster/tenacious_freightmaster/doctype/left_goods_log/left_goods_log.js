// Copyright (c) 2024, Joshua Joseph Michael and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Left Goods Log", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on('Left Goods Log', {
    refresh: function(frm) {
        // Add a custom button to the Left Goods Log form
        frm.add_custom_button('Create Shipment Manifest', function() {
            frappe.call({
                method: 'tenaciousfreightmaster.tenacious_freightmaster.doctype.left_goods_log.left_goods_log.create_shipment_manifest_from_left_goods_log',
                args: {
                    doc_name: frm.doc.name  // Pass the name of the Left Goods Log document
                },
                callback: function(r) {
                    if(r.message) {
                        frappe.msgprint('Shipment Manifest ' + r.message + ' created successfully');
                        frm.reload_doc();  // Reload the form after submission
                    }
                }
            });
            
        });
    }
});
