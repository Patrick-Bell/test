
const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
   timestamp: {
    type: Date,
    default: Date.now,
  },
    id: {
    type: String,
    unique: true,
    },
    name: String,
    email: String,
    phone: String,
    address: String,
    lineItems: [{ name: String, quantity: Number, unitPrice: Number }],
    shipping: Number,
    totalPrice: Number,
  });
    


  const OrderModel = mongoose.model('Order', orderSchema);

  module.exports = OrderModel
  