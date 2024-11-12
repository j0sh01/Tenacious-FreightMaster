frappe.pages['shipment-history'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Shipment History',
		single_column: true
	});
}

frappe.pages['shipment-history'].on_page_load = function(wrapper) {
    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Shipment History',
        single_column: true
    });

    // Container for the shipment data
    $(page.body).append(`
        <div>
            <div class="form-group">
                <label for="statusFilter">Filter by Status:</label>
                <select id="statusFilter" class="form-control">
                    <option value="">All</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>
            <button class="btn btn-primary" id="refreshButton">Refresh</button>
            <div id="shipmentTable" style="margin-top: 20px;"></div>
        </div>
    `);

    // Load initial data
    loadShipmentData();

    // Add event listener for filtering and refreshing
    $('#statusFilter').on('change', loadShipmentData);
    $('#refreshButton').on('click', loadShipmentData);
};

// Function to load shipment data based on filter
function loadShipmentData() {
    let status = $('#statusFilter').val();

    frappe.call({
        method: 'tenaciousfreightmaster.tenacious_freightmaster.page.shipment_history.shipment_history.get_customer_shipments',
        args: {
            customer: frappe.session.user,
            status: status
        },
        callback: function(r) {
            if (r.message) {
                renderShipmentTable(r.message);
            } else {
                $('#shipmentTable').html('<p>No shipments found.</p>');
            }
        }
    });
}

// Function to render the shipment table
function renderShipmentTable(data) {
    let tableHtml = `
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th>Shipment Date</th>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(shipment => `
                    <tr>
                        <td>${shipment.shipment_date}</td>
                        <td>${shipment.item_name}</td>
                        <td>${shipment.quantity}</td>
                        <td>${shipment.status}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    $('#shipmentTable').html(tableHtml);
}
