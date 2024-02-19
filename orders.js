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

async function getOrdersFromTable() {
  try {
    const orders = await OrderModel.find().exec();
    return orders;
  } catch (error) {
    console.error('Error retrieving orders from the database:', error);
    return [];
  }
}

async function renderOrdersTable() {
  const orderTbody = document.querySelector('#orders-table tbody');
  orderTbody.innerHTML = '';

  try {
    const orders = await getOrdersFromTable();

    orders.forEach(order => {
      const row = orderTbody.insertRow();
      const cell1 = row.insertCell(0);
      const cell2 = row.insertCell(1);
      const cell3 = row.insertCell(2);
      const cell4 = row.insertCell(3);
      const cell5 = row.insertCell(4);
      const cell6 = row.insertCell(5);

      cell1.textContent = order._id; // Use _id for MongoDB ID
      cell2.textContent = order.lineItems;
      cell3.textContent = order.price;
      cell4.innerHTML = `<img class="table-image" src="${order.image}" alt="order Image">`;
      cell5.textContent = order.stock;
      cell6.innerHTML = order.address;
    });

  } catch (error) {
    console.error('Error rendering orders:', error);
  }
}

module.exports = { addOrderToTable, getOrdersFromTable, renderOrdersTable };
