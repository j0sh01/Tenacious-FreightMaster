$(document).ready(function () {
    // Ensure the script only runs on the correct page
    if (window.location.pathname === "/customer-history") {
        frappe.call({
            method: "tenaciousfreightmaster.tenacious_freightmaster.custom.customer_history.get_customer_history",
            callback: function (r) {
                if (r.message) {
                    const history = r.message;

                    // Build content dynamically
                    let content = `<div><h3>Customer History</h3>`;
                    content += `<h4>Goods Receipts</h4>`;
                    content += generate_table(history.goods_receipts);
                    content += `<h4>Delivery Notes</h4>`;
                    content += generate_table(history.delivery_notes);
                    content += `<h4>Shipment Manifests</h4>`;
                    content += generate_table(history.shipment_manifests);
                    content += `<h4>Sales Invoices</h4>`;
                    content += generate_table(history.sales_invoices);
                    content += `<h4>Payments</h4>`;
                    content += generate_table(history.payments);
                    content += `<h4>Vehicle Logs</h4>`;
                    content += generate_table(history.vehicle_logs);
                    content += `</div>`;

                    $("#main-content").html(content);
                }
            }
        });

        function generate_table(data) {
            if (!data || data.length === 0) return `<p>No data available</p>`;
            let table = `<table class="table table-bordered"><tr>`;
            const headers = Object.keys(data[0]);
            headers.forEach(header => table += `<th>${header}</th>`);
            table += `</tr>`;
            data.forEach(row => {
                table += `<tr>`;
                headers.forEach(header => table += `<td>${row[header]}</td>`);
                table += `</tr>`;
            });
            table += `</table>`;
            return table;
        }
    }
});
