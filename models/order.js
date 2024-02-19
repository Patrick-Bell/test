
const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    id: {
    type: String,
    unique: true,
    },
    name: String,
    address: String,
    totalPrice: Number,
    lineItems: [{ name: String, quantity: Number, unitPrice: Number }],
  });
  
  const OrderModel = mongoose.model('Order', orderSchema);

  module.exports = OrderModel
  