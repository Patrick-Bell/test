// Helper function to get month name from month index (0-based)
function getMonthName(monthIndex) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex];
}

async function fetchOrders() {
  try {
    const response = await axios.get('/api/orders');
    const orders = response.data;
    console.log('Fetched orders:', orders);
    renderOrders(orders);

    const numOfOrders = document.querySelector('.order-num');
    numOfOrders.innerHTML = `Number of Orders: <strong>${orders.length}</strong>`;
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
}

async function applyFilters() {
  console.log('Applying filters...');
  try {
    const response = await fetch('/api/orders');
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    const data = await response.json();

    // Obtain filter criteria from input elements
    const customerName = document.getElementById('customerName').value.trim().toLowerCase();
    const orderId = document.getElementById('orderID').value.trim().toLowerCase();
    const sortByMonth = document.getElementById('sortByMonth').value;
    const sortByStatus = document.getElementById('orderStatus').value

    let filteredOrders

    // Filter orders based on selected criteria
     filteredOrders = data.filter(order => {
      const matchesCustomerName = !customerName || order.name.toLowerCase().includes(customerName);
      const matchesOrderId = !orderId || order.id.toLowerCase().includes(orderId);
      const matchesMonth = sortByMonth === 'all' || getMonthName(new Date(order.timestamp).getMonth()).toLowerCase() === sortByMonth.toLowerCase();  
      const statusMatch = sortByStatus === 'all' || order.status.toLowerCase().includes(sortByStatus)

      return matchesCustomerName && matchesOrderId && matchesMonth && statusMatch;
    });

  
    

    // Display number of filtered orders
    const numOfOrders = document.querySelector('.order-num');
    numOfOrders.innerHTML = `Number of filtered orders: <strong>${filteredOrders.length}</strong> out of ${data.length}`;

    if (filteredOrders.length === 0) {
      numOfOrders.innerHTML = 'No orders found with these filters.';
    }

    console.log('Filtered and sorted orders:', filteredOrders);

    // Render the filtered and sorted orders
    renderOrders(filteredOrders);

  } catch (error) {
    console.error('Error applying filters:', error);
  }
}


function resetFilters() {
  document.getElementById('customerName').value = ''
  document.getElementById('orderID').value = ''
  document.getElementById('sortByMonth').value = 'all'
  document.getElementById('orderStatus').value = 'all'

  fetchOrders()
}

const resetFiltersBtn = document.getElementById('reset-filters-btn')
resetFiltersBtn.addEventListener('click', () => {
  console.log('clicking reset filters')
  resetFilters()
})

function renderOrders(orders) {
  const ordersByMonthYear = groupOrdersByMonthYear(orders);
  renderOrdersByMonthYear(ordersByMonthYear);
}

function groupOrdersByMonthYear(orders) {
  const ordersByMonthYear = {};

  orders.forEach(order => {
    const date = new Date(order.timestamp);
    const month = date.getMonth();
    const year = date.getFullYear();

    const key = `${year}-${month}`;
    if (!ordersByMonthYear[key]) {
      ordersByMonthYear[key] = {
        month: month,
        year: year,
        orders: []
      };
    }

    ordersByMonthYear[key].orders.push(order);
  });

  return ordersByMonthYear;
}



function renderOrdersByMonthYear(ordersByMonthYear) {
  const orderListElement = document.getElementById('order-list');
  orderListElement.innerHTML = ''; // Clear existing content in the order list element

  const keys = Object.keys(ordersByMonthYear);

  // Iterate over keys (which are in format 'year-month') in reverse order
  keys.reverse().forEach(key => {
    const { month, year, orders } = ordersByMonthYear[key];

    // Sort orders within the current month-year group by timestamp (latest first)
    orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Create a header displaying the month and year
    const header = document.createElement('div');
    header.classList.add('month-style');
    header.textContent = `${getMonthName(month)} ${year}`;
    orderListElement.appendChild(header);

    // Create a container to hold all order items for the current month-year
    const container = document.createElement('div');

    // Iterate over each order within the current month-year group
    orders.forEach(order => {
      const { id, name, email, address, phone, lineItems, shipping, totalPrice, timestamp, status } = order;

      let backgroundColor, iconClass;

      switch (status) {
        case 'pending':
          backgroundColor = '#CCCCCC'; // Light Grey
          iconClass = `bx bx-loader`;
          break;
        case 'shipped':
          backgroundColor = '#FFCC99'; // Light Orange
          iconClass = `bx bx-car`
          break;
        case 'delivered':
          backgroundColor = '#99CC99'; // Light Green
          iconClass = `bx bx-package`
          break;
        case 'cancelled':
          backgroundColor = 'red';
          iconClass = 'bx bx-x'
          break;
        default:
          backgroundColor = 'transparent'; // Default color if none of the cases match
      }
      


     
      // Create a div element to represent each order item
      const orderItem = document.createElement('div');
      orderItem.classList.add('order-item');

      // Construct HTML for displaying order details with icons and styled elements
      const orderDetails = `
      <div class="order-details" style="margin: 10px;">
      <div class="order-header">

          <div class="flex-container">
            <div><i class='bx bx-badge'></i> ${id}</div>
            <div class="order-status">
            <div>
            <select class="select-status">
            <option disabled selected>Status</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
            </div>
            <div>
            </div>
          </div>
          </div>
            
            <div>
              <i class='bx bxs-calendar'></i> ${new Date(timestamp).toLocaleString()}
            </div>
            <div>
              <i class='bx bx-user'></i> ${name}
            </div>
            <div>
              <i class='bx bx-envelope'></i> ${email}
            </div>
            <div>
              <i class='bx bx-map'></i> ${address}
            </div>
            <div>
              <i class='bx bx-phone'></i> ${phone}
            </div>
            <div style="background: ${backgroundColor}; width: 175px; border-radius: 0.4rem"; class="status-border">
              <i class='${iconClass}'></i> order ${status}
            </div>
          </div>
        
          <div class="order-items">
          <table style="width: 100%; margin-top: 10px; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border-bottom: 1px solid #ccc; padding: 8px;"><i class='bx bx-package'></i> Item</th>
              <th style="border-bottom: 1px solid #ccc; padding: 8px;"><i class='bx bx-shopping-bag'></i> Quantity</th>
              <th style="border-bottom: 1px solid #ccc; padding: 8px;"><i class='bx bx-dollar-circle'></i> Cost</th>
            </tr>
          </thead>
          <tbody>
            ${lineItems.map(item => `
              <tr>
                <td style="border-bottom: 1px solid #ccc; padding: 8px;">${item.name}</td>
                <td style="border-bottom: 1px solid #ccc; padding: 8px;">${item.quantity}</td>
                <td style="border-bottom: 1px solid #ccc; padding: 8px;">£${((item.quantity * item.unitPrice / 100)).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="text-align: right; padding: 8px;"><strong><i class='bx bx-truck'></i> Shipping:</strong></td>
              <td style="border-top: 1px solid #ccc; padding: 8px;">£${(shipping / 100).toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="2" style="text-align: right; padding: 8px;"><strong><i class='bx bx-dollar'></i> Total:</strong></td>
              <td style="border-top: 1px solid #ccc; padding: 8px;">£${(totalPrice / 100).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
          </div>
        </div>



        <div class="modal fade status-update-modal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Status Update</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body status-body">
            <p></p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-outline-success"id="status-btn">Save changes</button>
          </div>
        </div>
      </div>
    </div>
      `;

      // Set inner HTML of the orderItem div with orderDetails
      orderItem.innerHTML = orderDetails;

      // Append the orderItem to the container
      container.appendChild(orderItem);

      // Add event listener to save button inside the order item
      const selectStatusType = orderItem.querySelector('.select-status');
      const statusSaveBtn = orderItem.querySelector('#status-btn');
      const confirmStatusModal = orderItem.querySelector('.status-update-modal')
      const statusBody = orderItem.querySelector('.status-body')
      const statusBootstrap = new bootstrap.Modal(confirmStatusModal)

      selectStatusType.addEventListener('change', () => {
        statusBootstrap.show()
        const newStatus = selectStatusType.value;
        console.log(newStatus)
        statusBody.innerHTML = `Are you sure you want to update the status for order <strong>${id}</strong> to <strong>${newStatus}</strong>? 
        This will automatically send an email to the user (<strong>${email}</strong>). This action <strong>CANNOT</strong> be undone.`

      })

        statusSaveBtn.addEventListener('click', async () => {
          const newStatus = selectStatusType.value;
          console.log('Save button clicked'); // Check if this message appears in the console
          console.log(`Saving status update for order ${id} with new status: ${newStatus}`);
          try {
            await updateStatus(id, newStatus);
            statusBootstrap.hide()
            fetchOrders()
          } catch (error) {
            console.error('Failed to update order status:', error);
            // Handle error (e.g., show error message)
          }
        })
    });

    // Append the container (containing all order items for the current month-year) to the orderListElement
    orderListElement.appendChild(container);
  });
}



const updateStatus = async (id, newStatus) => {
  try {
    const response = await axios.put(`/api/orders/${id}`, { status: newStatus });
    console.log('Order status updated successfully:', response.data);
    // Optionally, update the UI or perform additional actions based on the response
  } catch (error) {
    console.error('Error updating order status:', error);
    // Display error message to the user or handle error appropriately
    alert('Failed to update order status. Please try again.');
  }
};




  




// Attach event listener to Apply Filters button
const applyFiltersBtn = document.getElementById('apply-filters-btn');
applyFiltersBtn.addEventListener('click', applyFilters);

// Fetch orders when the page loads





fetchOrders();
