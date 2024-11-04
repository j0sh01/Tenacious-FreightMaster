// Copyright (c) 2024, Joshua Joseph Michael and contributors
// For license information, please see license.txt

frappe.ui.form.on('Vehicle Log', {
    validate: function(frm) {
        if (frm.doc.return_datetime && frm.doc.return_datetime < frm.doc.departure_datetime) {
            frappe.throw(__('Return Date/Time must be after the Departure Date/Time.'));
        }
    }
});
