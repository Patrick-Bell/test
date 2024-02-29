const OrderModel = require('./models/order');

async function addOrderToTable(orderData) {
  try {
    const order = new OrderModel(orderData);
    await order.save();
    console.log('Order added to table and saved to the database:', orderData);
  } catch (error) {
    console.error('Error saving order to the database:', error);
  }
}

async function getOrdersFromTable() {
  try {
    const orders = await OrderModel.find();
    return orders;
  } catch (error) {
    console.error('Error retrieving orders from the database:', error);
    return [];
  }
}
let cart = JSON.parse(localStorage.getItem('cart')) || [];


function saveToLocalStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
  console.log(localStorage.getItem('cart'))
}

function updateCartIcon() {
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartIcon = document.getElementById("cart-icon");
  cartIcon.setAttribute("data-quantity", totalQuantity);
}

function clearCart() {
  cart = [];
  saveToLocalStorage();
  updateCartIcon();
}

module.exports = { addOrderToTable, getOrdersFromTable, clearCart };
