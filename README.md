# Tenacious Freight Master

**Tenacious Freight Master** is a robust, custom-built solution designed to streamline logistics and freight management processes in **ERPNext**. The app focuses on optimizing workflows for shipment handling, goods receipt, vehicle logging, discrepancy management, and seamless integration of custom business rules. It empowers freight companies to efficiently manage operations with precision and transparency.

## Key Features

### 1. Goods Receipt & Shipment Manifest Management
- Automates the creation of **Shipment Manifests** from **Goods Receipts** or **Left Goods Logs**.
- Tracks shipment discrepancies and seamlessly integrates with **Left Goods Logs** to manage leftover goods.
- Provides dynamic handling of customer details, destinations, and item details with real-time updates.

### 2. Left Goods Log
- Manages items left during shipment due to discrepancies in quantity.
- Enables re-shipment of left goods with a single click, creating new shipment manifests.
- Updates statuses (e.g., "Manifest Left" → "Shipped") automatically upon re-shipment.

### 3. Vehicle Log Management
- Maintains detailed records of vehicle movements, linked to shipment manifests.
- Aggregates shipping charges in the parent **Vehicle Log** from child records.
- Provides actionable insights for operational and financial reporting.

### 4. Custom Print Formats
- Dynamic print formats for documents like **Goods Receipts**, **Shipment Manifests**, and **Vehicle Logs**.
- Includes terms and conditions and neatly styled outputs for operational use.

### 5. Custom Scripts for Enhanced Usability
- Client-side scripts for automatic field population, seamless workflow transitions, and user-friendly interfaces.
- Handles intricate logic like syncing charges, statuses, and references across related documents.

### 6. Workspace Customization
- Tailored workspaces to provide users with focused and role-specific landing pages.

### 7. Terms and Conditions Management
- Customizable terms and conditions added dynamically to relevant documents to ensure transparency and adherence to company policies.

## Technologies Used
- **ERPNext Framework**: Built on the Frappe framework for rapid development and integration.
- **Python & JavaScript**: Core languages for backend and frontend customization.
- **Jinja**: Template engine used for dynamic print formats.
- **MySQL**: Database for managing and storing all logistics and shipment data.

## How It Works
1. Goods are received and discrepancies, if any, are logged in **Left Goods Logs**.
2. Shipment Manifests are created either from **Goods Receipts** or **Left Goods Logs** based on the operational requirements.
3. Vehicles used for shipments are logged in the **Vehicle Log**, consolidating all financial and shipment details.
4. Comprehensive print formats and workspaces make accessing and managing data seamless for users.

## Installation
1. Clone the repository into your ERPNext environment:
   ```bash
   bench get-app https://github.com/j0sh01/Tenacious-FreightMaster.git
   ```
2. Install the app to the required site:
   ```bash
   bench --site (site-name) install-app Tenacious-FreightMaster
   ```
3. Run migrations and start the server:
   ```bash
   bench migrate
   bench restart
   ```

## Future Enhancements
- Integration with third-party logistics systems for real-time tracking.
- Advanced reporting and analytics for freight operations.
- Mobile-friendly interface for on-the-go shipment tracking.


#### License

mit
