// Copyright (c) 2024, Joshua Joseph Michael and contributors
// For license information, please see license.txt

frappe.ui.form.on('Vehicle Log', {
    validate: function(frm) {
        if (frm.doc.return_datetime && frm.doc.return_datetime < frm.doc.departure_datetime) {
            frappe.throw(__('Return Date/Time must be after the Departure Date/Time.'));
        }
    }
});

frappe.ui.form.on('Vehicle Log', {
    refresh: function(frm) {
        calculate_total_amount(frm); // Recalculate when form is refreshed
    },
    before_save: function(frm) {
        calculate_total_amount(frm); // Ensure the total is updated before saving
    }
});

frappe.ui.form.on('Vehicle Log Details', {
    shipping_charges: function(frm, cdt, cdn) {
        calculate_total_amount(frm); // Recalculate when a row's shipping charge changes
    },
    vehicle_log_details_remove: function(frm) {
        calculate_total_amount(frm); // Recalculate when a row is removed
    }
});

// Helper function to calculate total shipping charges in Vehicle Log
function calculate_total_amount(frm) {
    let total = 0;

    // Sum up shipping charges from the child table
    if (frm.doc.vehicle_log_details) {
        frm.doc.vehicle_log_details.forEach(row => {
            total += row.shipping_charges || 0;
        });
    }

    // Update the parent field
    frm.set_value('total_amount', total);
}
