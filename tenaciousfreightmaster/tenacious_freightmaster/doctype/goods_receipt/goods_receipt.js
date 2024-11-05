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
