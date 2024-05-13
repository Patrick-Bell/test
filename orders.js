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
      <strong>Discounts:</strong> £${(updatedOrder.discount / 100).toFixed(2)}<br>
      <strong>Shipping Cost:</strong> £${(updatedOrder.shipping / 100).toFixed(2)}<br>
      <strong>Total Price:</strong> £${(updatedOrder.totalPrice / 100).toFixed(2)}<br><br>`
  
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
      emailBody = `Dear ${updatedOrder.name},<br><br>
        Your order with ID <strong>${updatedOrder.id}</strong> has been successfully delivered.<br><br>
        Remember to keep an eye out for our new products coming soon! You can find them on the shop 
        <a href="https://test-admin-wdmf.onrender.com/products">here</a>.<br><br>
        We hope you enjoy your purchase!<br>
        Thank you for shopping with us!`;
      break;
      case 'cancelled':
        emailSubject = `Your order can been cancelled.`;
        emailBody = `Hi ${updatedOrder.name}<br><br>
        This is confirmation that your order (<strong>${updatedOrder.id}</strong>) with us has been <strong>cancelled</strong>.<br><br>
        You will be refunded the total payment of <strong>£${((updatedOrder.totalPrice - updatedOrder.shipping) / 100).toFixed(2)}</strong> within 3-5 working days.<br><br>
        Please note that we are unable to refund shipping if you have paid for this.<br><br>
        Thank you,<br>
        Cointology Customer Service
        `
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
    <li><strong>Total Price:</strong> £${(orderData.totalPrice / 100).toFixed(2)}</li>
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




async function sendStockUpdateEmail() {
  try {
    // Retrieve all products from the database
    const products = await ProductModel.find();
    const orders = await OrderModel.find()

    // Filter products with low stock (less than 10)
    const lowStockProducts = products.filter(product => product.stock < 10 && product.stock > 0);
    const outOfStockProducts = products.filter(product => product.stock <= 0)

    if (lowStockProducts.length === 0) {
      console.log('No low-stock products found.');
      return; // Exit function if no low-stock products
    }

    if (outOfStockProducts.length === 0) {
      console.log('No products out of stock')
      return
    }

    const date = new Date();
    const options = {
        year: 'numeric', // "numeric" or "2-digit"
        month: 'short', // "short", "long", "numeric", "2-digit"
        day: 'numeric', // "numeric", "2-digit"
        weekday: 'long', // "short", "long", "narrow"
        hour: 'numeric', // "numeric", "2-digit"
        minute: 'numeric', // "numeric", "2-digit"
    };
    
    const formattedDate = date.toLocaleDateString('en-US', options);
    console.log(formattedDate);


    const productQuantities = {};

    // Iterate over each order and aggregate product quantities
    orders.forEach(order => {
      order.lineItems.forEach(item => {
        const productName = item.name;
        const productQuantity = item.quantity;

        // Update or initialize product quantity in the object
        if (productQuantities[productName]) {
          productQuantities[productName] += productQuantity;
        } else {
          productQuantities[productName] = productQuantity;
        }
      });
    });

    // Convert productQuantities object to array of { productName, quantity } objects
    const productQuantitiesArray = Object.entries(productQuantities).map(([productName, quantity]) => ({
      productName,
      quantity
    }));

    // Sort productQuantitiesArray by quantity (descending order)
    const sortedOrders = productQuantitiesArray.sort((a, b) => b.quantity - a.quantity);

    // Log the top 5 best-selling products
    console.log('Top 5 Best Sellers:');
    sortedOrders.slice(0, 5).forEach((product, index) => {
      console.log(`${index + 1} - ${product.productName}: ${product.quantity}`);
    });

    // Log the bottom 5 least-selling products
    console.log('Bottom 5 Least Sellers:');
    sortedOrders.slice(-5).reverse().forEach((product, index) => {
      console.log(`${index + 1} - ${product.productName}: ${product.quantity}`);
    });
    
  
  // Format the date using specified options
    let emailContent = `This is an update for low and out of stock products, as well as best and worse selling products. This report is generated on ${formattedDate}.<br>
    <strong>Low Stock Items</strong> - Items less than 10 quantities remaining.<br>
    <strong>Out of Stock Items</strong> - Items with 0 stock remaining.<br>
    <strong>Best Sellers</strong> - Items that have sold the most across all orders.<br>
    <strong>Worse Sellers</strong> - Items that have sold the least across all orders (items with 0 sales will not show here).<br><br>`
    emailContent += `<h2>Low Stock Alert (${lowStockProducts.length})</h2>`;
    emailContent += '<ul>';
    lowStockProducts.forEach(product => {
      emailContent += `<li>${product.title} - <strong>Stock: ${product.stock}</strong></li>`;
    });
    emailContent += '</ul>';
    emailContent += `<h2>Out of Stock Items (${outOfStockProducts.length})</h2>`
    emailContent += `<ul>`;
    outOfStockProducts.forEach(product => {
      emailContent += `<li>${product.title} - <strong> Stock: ${product.stock}</strong></li>`
    })
    emailContent += `</ul>`
    emailContent += `<h2>Best Sellers</h2>`
    sortedOrders.slice(0, 5).forEach((product, index) => {
      emailContent += `<li>${index + 1} - ${product.productName}: <strong>${product.quantity}</strong> sold</li>`;
    });
    emailContent += `<h2>Worse Sellers</h2>`
    sortedOrders.slice(-5).reverse().forEach((product, index) => {
     emailContent += `<li>${index + 1} - ${product.productName}: <strong>${product.quantity}</strong> sold </li>`;
    });
    



    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER,
        pass: process.env.PASS
      }
    });

    // Email options
    const emailOptions = {
      from: process.env.USER,
      to: process.env.USER, // Change recipient email address as needed
      subject: 'Low Stock Alert',
      html: emailContent
    };

    // Send the email
    const info = await transporter.sendMail(emailOptions);
    console.log('Low stock alert email sent successfully:', info.response);
  } catch (error) {
    console.error('Error sending low stock alert email:', error);
  }
}




async function countProductQuantities() {
  try {
    // Fetch all orders from the database
    const orders = await OrderModel.find();

    // Object to store product quantities across all orders
    const productQuantities = {};

    // Iterate over each order and aggregate product quantities
    orders.forEach(order => {
      order.lineItems.forEach(item => {
        const productName = item.name;
        const productQuantity = item.quantity;

        // Update or initialize product quantity in the object
        if (productQuantities[productName]) {
          productQuantities[productName] += productQuantity;
        } else {
          productQuantities[productName] = productQuantity;
        }
      });
    });

    // Convert productQuantities object to array of { productName, quantity } objects
    const productQuantitiesArray = Object.entries(productQuantities).map(([productName, quantity]) => ({
      productName,
      quantity
    }));

    // Sort productQuantitiesArray by quantity (descending order)
    const sortedOrders = productQuantitiesArray.sort((a, b) => b.quantity - a.quantity);

    // Log the top 5 best-selling products
    console.log('Top 5 Best Sellers:');
    sortedOrders.slice(0, 5).forEach((product, index) => {
      console.log(`${index + 1} - ${product.productName}: ${product.quantity}`);
    });

    // Log the bottom 5 least-selling products
    console.log('Bottom 5 Least Sellers:');
    sortedOrders.slice(-5).reverse().forEach((product, index) => {
      console.log(`${index + 1} - ${product.productName}: ${product.quantity}`);
    });

  } catch (error) {
    console.error('Error counting product quantities:', error);
  }
}





module.exports = { addOrderToTable, getOrdersFromTable, updateStock, sendOrderConfirmationEmail, sendOrderStatusEmail, sendStockUpdateEmail };