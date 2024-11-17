// Copyright (c) 2024, Joshua Joseph Michael and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Left Goods Log", {
// 	refresh(frm) {

// 	},
// });

// Custom Script: LeftGoodsLog
// frappe.ui.form.on('Left Goods Log', {
//     refresh: function(frm) {
//         frm.add_custom_button(__('Create New Shipment Manifest'), function() {
//             frm.call('create_new_shipment_manifest');
//         });
//     }
// });




// frappe.ui.form.on('Left Goods Log', {
//     refresh: function(frm) {
//         frm.add_custom_button(__('Create Shipment Manifest'), function() {
//             frappe.call({
//                 method: "tenaciousfreightmaster.tenacious_freightmaster.doctype.shipment_manifest.shipment_manifest.create_shipment_manifest_from_left_goods_log",
//                 args: {
//                     left_goods_log: frm.doc.name
//                 },
//                 callback: function(r) {
//                     if (!r.exc) {
//                         frappe.msgprint(__("New Shipment Manifest created."));
//                     }
//                 }
//             });
//         });
//     }
// });



frappe.ui.form.on('Left Goods Log', {
    refresh: function(frm) {
        // Add custom button to trigger shipment manifest creation
        if (frm.doc.status !== 'Shipped') {
            frm.add_custom_button(__('Create Shipment Manifest'), function() {
                // Call the server method to create and submit the Shipment Manifest
                frappe.call({
                    method: 'tenaciousfreightmaster.tenacious_freightmaster.doctype.shipment_manifest.shipment_manifest.create_and_submit_shipment_manifest',
                    args: {
                        left_goods_log_name: frm.doc.name
                    },
                    callback: function(r) {
                        if (!r.exc) {
                            // Success message
                            frappe.msgprint(__('Shipment Manifest has been created and submitted.'));
                            // Optionally, redirect to the new Shipment Manifest
                            frappe.set_route('Form', 'Shipment Manifest', r.message);
                        } else {
                            frappe.msgprint(__('Failed to create and submit Shipment Manifest.'));
                        }
                    }
                });
            });
        }
    }
});
