// // Copyright (c) 2024, Joshua Joseph Michael and contributors
// // For license information, please see license.txt

frappe.ui.form.on('Vehicle Log', {
    // Store the current filters and filtered data
    current_destination_filters: [],
    filtered_data: null,

    validate: function(frm) {
        if (frm.doc.return_datetime && frm.doc.return_datetime < frm.doc.departure_datetime) {
            frappe.throw(__('Return Date/Time must be after the Departure Date/Time.'));
        }
    },

    refresh: function (frm) {
        calculate_total_amount(frm); // Calculate total on refresh

        frm.add_custom_button('Filter Destination', function () {
            frappe.db.get_link_options('Destination').then(destinations => {
                frappe.prompt([
                    {
                        fieldtype: 'MultiSelect',
                        label: 'Destinations',
                        fieldname: 'destination_filters',
                        options: destinations.map(d => d.value),
                        description: 'You can select multiple destinations'
                    }
                ],
                function (values) {
                    frm.events.current_destination_filters = values.destination_filters 
                        ? values.destination_filters.split(',').map(d => d.trim().toLowerCase())
                        : [];

                    let selected_filters = frm.events.current_destination_filters;

                    // Get the original grid data
                    const original_data = frm.fields_dict['vehicle_log_details'].grid.data.slice();

                    // Filter rows in the child table
                    const filtered_rows = original_data.filter(row => {
                        return (
                            selected_filters.length === 0 || 
                            (row.destination && selected_filters.includes(row.destination.toLowerCase()))
                        );
                    });

                    if (filtered_rows.length === 0) {
                        frappe.msgprint(__('No entries found for the selected destination(s).'));
                        return;
                    }

                    // Store filtered data for calculations
                    frm.events.filtered_data = filtered_rows;

                    // Clear the grid completely
                    frm.clear_table('vehicle_log_details');

                    // Add filtered rows back to the grid
                    filtered_rows.forEach(row => {
                        let new_row = frm.add_child('vehicle_log_details');
                        
                        let child_table_meta = frappe.get_meta('Vehicle Log Details');
                        
                        child_table_meta.fields.forEach(field => {
                            let fieldname = field.fieldname;
                            if (row.hasOwnProperty(fieldname)) {
                                new_row[fieldname] = row[fieldname];
                            }
                        });
                    });

                    // Refresh the grid and recalculate total
                    frm.refresh_field('vehicle_log_details');
                    calculate_filtered_total(frm);

                    if (selected_filters.length > 0) {
                        frappe.show_alert({
                            message: __(`Filtered by destinations: ${selected_filters.join(', ')}`),
                            indicator: 'green'
                        });
                    }
                },
                'Filter Destinations',
                'Apply');
            }).catch(error => {
                frappe.msgprint(__('Error fetching destinations: ') + error);
            });
        });

        // Reset Filter button
        frm.add_custom_button('Reset Destination Filters', function() {
            frm.events.filtered_data = null;
            frm.reload_doc();
        });
    },

    before_save: function(frm) {
        calculate_total_amount(frm);
    }
});

frappe.ui.form.on('Vehicle Log Details', {
    shipping_charges: function(frm, cdt, cdn) {
        if (frm.events.filtered_data) {
            calculate_filtered_total(frm);
        } else {
            calculate_total_amount(frm);
        }
    },
    vehicle_log_details_remove: function(frm) {
        if (frm.events.filtered_data) {
            calculate_filtered_total(frm);
        } else {
            calculate_total_amount(frm);
        }
    }
});

// Helper function to calculate total shipping charges for all data
function calculate_total_amount(frm) {
    let total = 0;
    if (frm.doc.vehicle_log_details) {
        frm.doc.vehicle_log_details.forEach(row => {
            total += row.shipping_charges || 0;
        });
    }
    frm.set_value('total_amount', total);
}

// Helper function to calculate total shipping charges for filtered data
function calculate_filtered_total(frm) {
    let total = 0;
    if (frm.events.filtered_data) {
        frm.events.filtered_data.forEach(row => {
            total += row.shipping_charges || 0;
        });
    }
    frm.set_value('total_amount', total);
}