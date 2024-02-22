
const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: false,
    },
    title: String,
    image: String,
    price: String,
    description: String,
    stock: String,
    category: String,
    tag: String,
  });
    

  const ProductModel = mongoose.model('Product', productSchema);

  module.exports = ProductModel
  