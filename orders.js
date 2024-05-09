require('dotenv').config();
const OrderModel = require('./models/order');
const ProductModel = require('./models/product');
const nodemailer = require('nodemailer');
const UserModel = require('./models/user')


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


function sendOrderStatusEmail(updatedOrder) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER,
      pass: process.env.PASS
    },
  });

  let orderDate = new Date(updatedOrder.timestamp);

  let twoDays = new Date(orderDate);
  twoDays.setDate(orderDate.getDate() + 2);

  let threeDays = new Date(orderDate)
  threeDays.setDate(orderDate.getDate() + 3)

  let fiveDays = new Date(orderDate)
  fiveDays.setDate(orderDate.getDate() + 5);

  let sevenDays = new Date(orderDate)
  sevenDays.setDate(orderDate.getDate() + 7);

  let formattedThreeDays = threeDays.toLocaleDateString()
  let formattedTwoDays = twoDays.toLocaleDateString();
  let formattedFiveDays = fiveDays.toLocaleDateString();
  let formattedSevenDays = sevenDays.toLocaleDateString()

  let emailSubject, emailBody
  let status = updatedOrder.status

  switch (status) {
    case 'shipped':
      emailSubject = `Your order has been shipped!`;
      emailBody = `Hi ${updatedOrder.name},<br><br>
        Your order <strong>(${updatedOrder.id})</strong> has been shipped.<br><br>
        <li>
        <strong>Personal Summary</strong>
        <ul>
        <li>${updatedOrder.email}</li>
        <li>${updatedOrder.phone}</li>
        <li>${updatedOrder.address}</li>
        </ul>
        </li>
        <li>
        <strong>Ordered Summary:</strong>
        <ul>
        ${updatedOrder.lineItems.map(item => `<li>${item.quantity} x ${item.name} - £${(item.unitPrice / 100).toFixed(2)} each</li>`).join('')}
        </ul>
      </li>
      <strong>Shipping Cost:</strong> £${(updatedOrder.shipping / 100).toFixed(2)}<br>
      <strong>Total Price:</strong> £${(updatedOrder.totalPrice / 100)}<br><br>`
  
      // Check the shipping value to personalize the message
      if (updatedOrder.shipping === 0) {
        emailBody += ` The estimated delivery time will be between 5-7 working days. This will be between ${formattedFiveDays} - ${formattedSevenDays}.<br><br>`;
      } else if (updatedOrder.shipping == 500) {
        emailBody += ` The estimated delivery time will be between 2-3 working days. This will be between ${formattedTwoDays} - ${formattedThreeDays}.<br><br>`;
      } else {
        emailBody += ` With premium shipping, your order will be with you tomorrow! If there are any expected delays, we will inform you as soon as possible.<br><br>`;
      }
  
      emailBody += `If you have any questions, please get in touch with us.<br><br>
        Thank you for shopping with us!`;
      break;
    case 'delivered':
      emailSubject = `Your order has been delivered!`;
      emailBody = `Dear Customer,<br>
        Your order with ID <strong>${updatedOrder.id}</strong> has been successfully delivered.<br>
        We hope you enjoy your purchase!<br>
        Thank you for shopping with us!`;
      break;
    default:
      emailSubject = `Update on your order (ID: ${updatedOrder.id})`;
      emailBody = `Dear Customer,<br>
        Your order with ID <strong>${updatedOrder.id}</strong> has been updated to status: ${updatedOrder.status}.<br>
        Thank you for shopping with us!`;
  }

  const userOrderStatusEmail = {
    from: process.env.USER,
    to: updatedOrder.email, 
    subject: emailSubject,
    html: emailBody,
  };

  // Send the email to the user
  transporter.sendMail(userOrderStatusEmail, (error, info) => {
    if (error) {
      console.error('Error sending automatic response to user:', error);
    } else {
      console.log('Automatic response sent to user successfully', info.response);
    }
  });
  
}


function sendOrderConfirmationEmail(orderData) {
  console.log('Email Check 1:', orderData);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER,
      pass: process.env.PASS
    },
  });


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
    <li><strong>Shipping Cost:</strong> £${(orderData.shipping / 100).toFixed(2)}</li>
    <li>
      <strong>Ordered Items:</strong>
      <ul>
        ${orderData.lineItems.map(item => `<li>${item.quantity} x ${item.name} - £${(item.unitPrice / 100).toFixed(2)} each</li>`).join('')}
      </ul>
    </li>
  </ul>
  <p>Your order status is now pending. This means we are packaging your coins ready to be shipped as soon as tomorrow. If the address you have provided
  is incorrect, there is still time to reach out before we ship your order. Please contact us soon as possible.</p><br>
  <p>Thank you for choosing us!</p>
`;

const userOrderConfirmation = {
    from: process.env.USER,
    to: orderData.email, 
    subject: 'Your Order is Complete!',
    html: emailContent,
  };

  console.log('Email Check 3:', orderData);

  // Send the email to the user
  transporter.sendMail(userOrderConfirmation, (error, info) => {
    if (error) {
      console.error('Error sending automatic response to user:', error);
    } else {
      console.log('Automatic response sent to user successfully', info.response);
    }
  });
}

module.exports = { addOrderToTable, getOrdersFromTable, updateStock, sendOrderConfirmationEmail, sendOrderStatusEmail };