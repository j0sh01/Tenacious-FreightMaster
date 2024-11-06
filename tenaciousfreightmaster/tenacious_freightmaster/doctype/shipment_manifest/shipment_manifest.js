// Copyright (c) 2024, Joshua Joseph Michael and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Shipment Manifest", {
// 	refresh(frm) {

// 	},
// });

frappe.ui.form.on('Shipment Manifest', {
    onload: function(frm) {
        if (!frm.doc.shipment_date) {
            frm.set_value('shipment_date', frappe.datetime.get_today());
        }
    }
});


// frappe.ui.form.on('Shipment Manifest', {
//     onload: function(frm) {
//         // Set the main_agent field to the current logged-in user if it's empty
//         if (!frm.doc.agent) {
//             frm.set_value('agent', frappe.session.user);
//         }
//     }
// });


frappe.ui.form.on('Shipment Manifest', {
    reference_goods_receipt: function(frm) {
        if (frm.doc.reference_goods_receipt) {
            frappe.call({
                method: 'frappe.client.get',
                args: {
                    doctype: "Goods Receipt",
                    filters: {
                        name: frm.doc.reference_goods_receipt
                    }
                },
                callback: function(r) {
                    if (r.message) {
                        frm.set_value('customer', r.message.customer);
                        frm.clear_table('manifest_details');

                        // Loop through goods_details items in Goods Receipt
                        r.message.goods_details.forEach(function(item) {
                            let child = frm.add_child('manifest_details');
                            child.item_name = item.item_name;
                            child.quantity = item.quantity;
                            child.uom = item.uom;
                            child.shipping_charges = item.amount;
                        });
                        frm.refresh_field('manifest_details');
                    }
                }
            });
        }
    }
});
