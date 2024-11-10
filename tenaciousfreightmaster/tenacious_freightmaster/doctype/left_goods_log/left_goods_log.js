// Copyright (c) 2024, Joshua Joseph Michael and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Left Goods Log", {
// 	refresh(frm) {

// 	},
// });

// Custom Script: LeftGoodsLog
frappe.ui.form.on('Left Goods Log', {
    refresh: function(frm) {
        frm.add_custom_button(__('Create New Shipment Manifest'), function() {
            frm.call('create_new_shipment_manifest');
        });
    }
});

