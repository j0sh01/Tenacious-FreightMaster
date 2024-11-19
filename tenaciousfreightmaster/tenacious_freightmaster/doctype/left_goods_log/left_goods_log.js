// Copyright (c) 2024, Joshua Joseph Michael and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Left Goods Log", {
// 	refresh(frm) {

// 	},
// });
// frappe.ui.form.on('Left Goods Log', {
//     refresh: function(frm) {
//         // Add a custom button to the Left Goods Log form
//         frm.add_custom_button('Create Shipment Manifest', function() {
//             frappe.call({
//                 method: 'tenaciousfreightmaster.tenacious_freightmaster.doctype.left_goods_log.left_goods_log.create_shipment_manifest_from_left_goods_log',
//                 args: {
//                     doc_name: frm.doc.name  // Pass the name of the Left Goods Log document
//                 },
//                 callback: function(r) {
//                     if(r.message) {
//                         frappe.msgprint('Shipment Manifest ' + r.message + ' created successfully');
//                         frm.reload_doc();  // Reload the form after submission
//                     }
//                 }
//             });
            
//         });
//     }
// });


frappe.ui.form.on("Left Goods Log", {
    refresh: function(frm) {
        // Check if the document is submitted and has the required status for creating a Shipment Manifest
        if (frm.doc.docstatus == 1 && frm.doc.status == 'Manifest Left') {
            frm.add_custom_button(__('Create Shipment Manifest'), function() {
                // Refresh the form first to avoid stale data
                frm.refresh();

                // Call the server method to create the Shipment Manifest
                frappe.call({
                    method: "tenaciousfreightmaster.tenacious_freightmaster.doctype.left_goods_log.left_goods_log.create_shipment_manifest_from_left_goods_log",
                    args: {
                        doc_name: frm.doc.name
                    },
                    callback: function(r) {
                        if (r.message) {
                            // Set the created Shipment Manifest ID directly
                            frappe.db.set_value("Left Goods Log", frm.doc.name, "shipment_manifest", r.message)
                                .then(() => {
                                    frappe.show_alert({message: __("Shipment Manifest created: " + r.message), indicator: 'green'});
                                });
                            frappe.set_route('Form', 'Shipment Manifest', r.message);
                        }
                    }
                });
            });
        } else if (frm.doc.shipment_manifest) {
            // If the Shipment Manifest is already created, show a button to view it
            frm.add_custom_button(__('View Shipment Manifest'), function() {
                frappe.set_route('Form', 'Shipment Manifest', frm.doc.shipment_manifest);
            });
        }
    }
});
