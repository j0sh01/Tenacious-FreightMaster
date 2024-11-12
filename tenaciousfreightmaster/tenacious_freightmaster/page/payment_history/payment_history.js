frappe.pages['payment-history'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Payment History',
		single_column: true
	});
}

   // Add customer selector
   page.add_field({
	label: 'Select Customer',
	fieldtype: 'Link',
	fieldname: 'customer',
	options: 'Customer',
	change: function() {
		var customer_name = page.fields_dict.customer.get_value();
		if (customer_name) {
			load_payment_history(customer_name);
		}
	}
});

// Create a container to display payment data
var payment_history_container = $('<div class="payment-history-container"></div>').appendTo(page.main);

// Function to load payment history
function load_payment_history(customer_name) {
	payment_history_container.empty(); // Clear previous data

	// Fetch payment entries related to the selected customer
	frappe.call({
		method: 'frappe.client.get_all',
		args: {
			doctype: 'Payment Entry',
			filters: { 'party': customer_name, 'party_type': 'Customer' },  // filter by customer
			fields: ['name', 'posting_date', 'amount', 'payment_type', 'status']
		},
		callback: function(r) {
			if (r.message && r.message.length) {
				var table = $('<table class="table table-bordered">')
					.append('<thead><tr><th>Payment ID</th><th>Date</th><th>Amount</th><th>Payment Type</th><th>Status</th></tr></thead>')
					.append('<tbody></tbody>')
					.appendTo(payment_history_container);

				// Loop through the payments and display them in the table
				r.message.forEach(function(payment) {
					var row = $('<tr>')
						.append('<td>' + payment.name + '</td>')
						.append('<td>' + payment.posting_date + '</td>')
						.append('<td>' + payment.amount + '</td>')
						.append('<td>' + payment.payment_type + '</td>')
						.append('<td>' + payment.status + '</td>')
						.appendTo(table.find('tbody'));
				});
			} else {
				payment_history_container.append('<p>No payment history found for this customer.</p>');
			}
		},
		error: function(err) {
			frappe.msgprint(__('Failed to load payment history.'));
		}
	});
};