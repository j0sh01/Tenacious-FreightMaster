// Copyright (c) 2024, Joshua Joseph Michael and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Left Goods Log", {
// 	refresh(frm) {

// 	},
// });

frappe.ui.form.on('Left Goods Log', {
    refresh: function(frm) {
        // Show button to create shipment manifest only if the status is "Manifest Left"
        if (frm.doc.status === 'Manifest Left' && !frm.doc.reference_shipment_manifest) {
            frm.add_custom_button(__('Create Shipment Manifest'), function() {
                create_shipment_manifest(frm);
            });
        }
    }
});

// Function to create Shipment Manifest from Left Goods Log
function create_shipment_manifest(frm) {
    // Call server-side method to create shipment manifest
    frappe.call({
        method: "tenaciousfreightmaster.tenacious_freightmaster.doctype.left_goods_log.left_goods_log.create_shipment_manifest_from_left_goods_log",
        args: {
            doc_name: frm.doc.name
        },
        callback: function(r) {
            if (r.message) {
                // Update the reference field with the newly created Shipment Manifest ID
                frm.set_value('reference_shipment_manifest', r.message);
                frm.set_value('status', 'Shipped'); // Update the status to Shipped
                frm.save();
                frappe.msgprint(__('Shipment Manifest created and status updated to Shipped'));
                // Optionally, navigate to the Shipment Manifest form
                frappe.set_route('Form', 'Shipment Manifest', r.message);
            }
        }
    });
}
