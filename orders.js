const OrderModel = require('./models/order');
const ProductModel = require('./models/product');
const nodemailer = require('nodemailer');
require('dotenv').config();


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
  try {
    console.log('Stock update process started...');

    for (const lineItem of orderData.lineItems) {
      const { name, quantity } = lineItem;

      const updatedProduct = await ProductModel.findOneAndUpdate(
        { title: name },
        { $inc: { stock: -quantity } },
        { new: true }
      );

      console.log(`Stock updated for product ${name}`, updatedProduct);
    }

    console.log('Stock update process completed.');

    return { success: true };
  } catch (error) {
    console.error('Error updating stock:', error.message);
    throw error;
  }
}


// emailService.js

function sendOrderConfirmationEmail(orderData) {
  console.log('Email Check 1:', orderData);
  // Create a nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER,
      pass: process.env.PASS
    },
  });


    console.log('Email Check 2:', orderData);


  // Prepare email content
  const emailContent = `
  <p>Dear ${orderData.name},</p>
  <p>Thank you for your order! Your purchase is complete.</p>
  <p>Order Details:</p>
  <ul>
    <li><strong>Order ID:</strong> ${orderData.id}</li>
    <li><strong>Name:</strong> ${orderData.name}</li>
    <li><strong>Email:</strong> ${orderData.email}</li>
    <li><strong>Phone:</strong> ${orderData.phone}</li>
    <li><strong>Shipping Address:</strong> ${orderData.address}</li>
    <li><strong>Total Price:</strong> £${(orderData.totalPrice / 100)}</li>
    <li><strong>Shipping Cost:</strong> ${orderData.shipping}</li>
    <li>
      <strong>Ordered Items:</strong>
      <ul>
        ${orderData.lineItems.map(item => `<li>${item.quantity} x ${item.name} - £${(item.unitPrice / 100).toFixed(2)} each</li>`).join('')}
      </ul>
    </li>
  </ul>
  <p>Thank you for choosing us!</p>
`;
  // Mail options for sending automatic response to the user
  const userOrderConfirmation = {
    from: process.env.USER, // Your email address
    to: orderData.email, 
    subject: 'Your Order is Complete!',
    html: emailContent,
  };

  console.log('Email Check 3:', orderData);

  // Send the email to the user
  transporter.sendMail(userOrderConfirmation, (error, info) => {
    if (error) {
      console.error('Error sending automatic response to user:', error);
      console.log('Email Check 4:', orderData);
    } else {
      console.log('Automatic response sent to user successfully', info.response);
      console.log('Email Check 5:', orderData);
    }
  });
}



module.exports = { addOrderToTable, getOrdersFromTable, updateStock, sendOrderConfirmationEmail };
