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

async function updateStock(orderData) {
  console.log('Received order data:', orderData);

  try {
    console.log('Stock update process started...');

    // Iterate through line items in the order and update the stock
    for (const lineItem of orderData.lineItems) {
      const { title, quantity } = lineItem;

      console.log(`Updating stock for product ${title}...`);

      // Use Mongoose to find and update the product
      const updatedProduct = await ProductModel.findOneAndUpdate(
        { title: title },
        { $inc: { stock: -quantity } },
        { new: true }
      );

      console.log(`Stock updated for product ${title}`, updatedProduct);
    }

    console.log('Stock update process completed.');

    // Return a success indicator or any relevant data if needed
    return { success: true };
  } catch (error) {
    // Log the error or handle it accordingly
    console.error('Error updating stock:', error.message);
    throw error;
  }
}


module.exports = { addOrderToTable, getOrdersFromTable, updateStock };
