const OrderModel = require('./models/order');

async function addOrderToTable(orderData) {
    try {
      const order = new OrderModel(orderData);
      await order.save();
      renderOrdersTable(); // Trigger an update of the table
      console.log('Order added to table and saved to the database:', orderData);
    } catch (error) {
      console.error('Error saving order to the database:', error);
    }
}

function renderOrdersTable() {
  const orderTbody = document.querySelector('#orders-table tbody');
  orderTbody.innerHTML = '';

  // Retrieve orders from the database and render them
  OrderModel.find({}, (err, orders) => {
    if (err) {
      console.error('Error fetching orders from the database:', err);
      return;
    }

    orders.forEach(order => {
      const row = orderTbody.insertRow();
      const cell1 = row.insertCell(0);
      const cell2 = row.insertCell(1);
      const cell3 = row.insertCell(2);
      const cell4 = row.insertCell(3);
      const cell5 = row.insertCell(4);
      const cell6 = row.insertCell(5);

      cell1.textContent = order.id;
      cell2.textContent = order.lineItems;
      cell3.textContent = order.price;
      cell4.innerHTML = `<img class="table-image" src="${order.image}" alt="order Image">`;
      cell5.textContent = order.stock;
      cell6.innerHTML = order.address;
    });
  });
}

module.exports = { addOrderToTable, renderOrdersTable };
