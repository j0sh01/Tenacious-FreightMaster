// Copyright (c) 2024, Joshua Joseph Michael and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Left Goods Log", {
// 	refresh(frm) {

// 	},
// });


frappe.ui.form.on('Left Goods Log', {
    refresh: function(frm) {
        // Add "Create Shipment Manifest" button if status is 'Manifest Left'
        if (frm.doc.docstatus === 1 && frm.doc.status === 'Manifest Left' && !frm.doc.reference_shipment_manifest) {
            frm.add_custom_button(__('Create Shipment Manifest'), function() {
                frappe.call({
                    method: "tenaciousfreightmaster.tenacious_freightmaster.doctype.left_goods_log.left_goods_log.create_shipment_manifest_from_left_goods",
                    args: { left_goods_log_id: frm.doc.name },
                    callback: function(r) {
                        if (r.message) {
                            frappe.show_alert({
                                message: __("Shipment Manifest created: " + r.message),
                                indicator: 'green'
                            });
                            frm.reload_doc();
                            frappe.set_route('Form', 'Shipment Manifest', r.message);
                        }
                    }
                });
            });
        }
        // Add "View Shipment Manifest" button if reference_shipment_manifest exists
        else if (frm.doc.reference_shipment_manifest) {
            frm.add_custom_button(__('View Shipment Manifest'), function() {
                frappe.set_route('Form', 'Shipment Manifest', frm.doc.reference_shipment_manifest);
            });
        }
    }
});
