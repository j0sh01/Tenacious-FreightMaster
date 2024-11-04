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
