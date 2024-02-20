
const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    id: String,
    title: String,
    image: String,
    price: Number,
    description: String,
    stock: String,
    category: String,
    tags: String,
  });
    

  const ProductModel = mongoose.model('Product', productSchema);

  module.exports = ProductModel
  