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


frappe.ui.form.on('Vehicle Log', {
    // Store the current filter to use across methods
    current_destination_filter: null,

    refresh: function (frm) {
        frm.add_custom_button('Filter Destination', function () {
            // Fetch destination options dynamically from the Destination Doctype
            frappe.db.get_link_options('Destination').then(destinations => {
                frappe.prompt([
                    {
                        fieldtype: 'Select',
                        label: 'Destination',
                        fieldname: 'destination_filter',
                        options: [''].concat(destinations.map(d => d.value))
                    }
                ],
                function (values) {
                    // Store the current filter
                    frm.events.current_destination_filter = values.destination_filter ? values.destination_filter.toLowerCase() : '';

                    let selected_filter = frm.events.current_destination_filter;

                    // Get the original grid data
                    const original_data = frm.fields_dict['vehicle_log_details'].grid.data.slice();

                    // Filter rows in the child table
                    const filtered_rows = original_data.filter(row => {
                        return (
                            !selected_filter || // Show all rows if no filter is selected
                            (row.destination && row.destination.toLowerCase() === selected_filter) // Match selected filter
                        );
                    });

                    if (filtered_rows.length === 0) {
                        frappe.msgprint(__('No entries found for the selected destination.'));
                        return;
                    }

                    // Clear the grid completely
                    frm.clear_table('vehicle_log_details');

                    // Add filtered rows back to the grid
                    filtered_rows.forEach(row => {
                        let new_row = frm.add_child('vehicle_log_details');
                        
                        // Get all fields of the child table
                        let child_table_meta = frappe.get_meta('Vehicle Log Details');
                        
                        // Copy all fields from the original row
                        child_table_meta.fields.forEach(field => {
                            let fieldname = field.fieldname;
                            if (row.hasOwnProperty(fieldname)) {
                                new_row[fieldname] = row[fieldname];
                            }
                        });
                    });

                    // Refresh the child table grid
                    frm.refresh_field('vehicle_log_details');
                },
                'Filter Destination',
                'Apply');
            }).catch(error => {
                frappe.msgprint(__('Error fetching destinations: ') + error);
            });
        });

        // Optional: Add a "Reset Filter" button
        frm.add_custom_button('Reset Destination Filter', function() {
            frm.reload_doc();
        });
    },
});
