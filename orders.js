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

function calculateTotal() {
  const cartTotalElement = document.getElementById('cartTotal');
  if (!cartTotalElement) {
      console.error("cartTotalElement not found");
      return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotalElement.textContent = `Total: £${total.toFixed(2)}`;
}

// Updating the number on the cart that shows the quantity
function updateCartIcon() {
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartIcon = document.getElementById("cart-icon");
  cartIcon.setAttribute("data-quantity", totalQuantity);
}

function updateCartIconOnCartChange() {
  updateCartIcon();
}

// Clearing the cart
function clearCart() {
  cart = [];
  saveToLocalStorage();
  updateCartIconOnCartChange();
  calculateTotal()
}

module.exports = { addOrderToTable, getOrdersFromTable, clearCart };
