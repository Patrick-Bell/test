
const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    id: {
    type: String,
    unique: true,
    },
    name: String,
    email: String,
    address: String,
    lineItems: [{ name: String, quantity: Number, unitPrice: Number }],
    totalPrice: Number,
  });
    


  const OrderModel = mongoose.model('Order', orderSchema);

  module.exports = OrderModel
  