const express = require('express')
require('dotenv').config();
const stripe = require('stripe')
const mongoose = require('mongoose')
const OrderModel = require('./models/order')
const ProductModel = require('./models/product');
const EmailModel = require('./models/message');
const User = require('./models/user'); // Importing the User model
const registerRouter = require('./register');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const path = require('path')
const fs = require('fs').promises;
const multer = require('multer'); 
const nodemailer = require('nodemailer')

const { addOrderToTable, getOrdersFromTable, updateStock, sendOrderConfirmationEmail, sendOrderStatusEmail } = require('./orders'); // Updated import statement

const bodyParser = require('body-parser')



const app = express();
const initializePassport = require('./passport-setup');
initializePassport(
  passport,
  async (email) => {
    try {
      const user = await User.findOne({ email: email });
      return user;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  async (id) => {
    try {
      const user = await User.findById(id);
      return user;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
);

let stripeGateway = stripe(process.env.stripe_key);

const upload = multer({ dest: 'uploads/' });
// Set up middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(flash());


app.use(
  session({
    secret: 'sessionSecret',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.use((req, res, next) => {
  if (req.path === '/webhooks') {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      req.rawBody = data;
      next();
    });
  } else {
    express.json()(req, res, next);
  }
});

const uri = process.env.MONGO_URI

mongoose.connect(uri);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB database');
});


app.get("/", (req, res) => {
    res.sendFile("index.html", { root: "public" });
});

app.get("/cart", (req, res) => {
    res.sendFile("cart.html", { root: "public" });
});

app.get("/faq", (req, res) => {
    res.sendFile("faq.html", { root: "public" });
});

app.get("/success", (req, res) => {
  res.sendFile("success.html", { root: "public" });
});


app.get("/cancel", (req, res) => {
    res.sendFile("cancel.html", { root: "public" });
});

app.get("/thanks", (req, res) => {
    res.sendFile("thanks.html", { root: "public" });
});

app.get("/products", (req, res) => {
    res.sendFile("products.html", { root: "public" });
});

app.get("/delivery", (req, res) => {
  res.sendFile("delivery.html", { root: "public" });
});

app.get(['/admin', '/admin.ejs'], (req, res) => {
  res.render('admin.ejs',);
});


app.get(['/orders', '/orders.html'], checkAuthenticated, (req, res) => {
  res.sendFile('orders.html', { root: "public" });
});

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs');
});

app.get('/register', (req, res) => {
  res.render('register.ejs');
});

app.use('/register', registerRouter);


app.get('/api/orders', async (req, res) => {
  try {
    const orders = await getOrdersFromTable();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await ProductModel.find();
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/totalorders', async (req, res) => {
  try{
    const orders = await OrderModel.find()
    res.status(200).json(orders)
  }catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.put('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body; // Assuming the client sends { "newStatus": "delivered" }

    console.log('Updating order status:', orderId, status);

    // Update order status in the database
    const updatedOrder = await OrderModel.findOneAndUpdate(
      { id: orderId },
      { status: status },
      { new: true } // Ensure to return the updated document
    );

    if (!updatedOrder) {
      // Handle case where order with given ID is not found
      return res.status(404).json({ error: 'Order not found' });
    }
    sendOrderStatusEmail(updatedOrder)
    console.log('Updated order:', updatedOrder);

    res.status(200).json({ message: 'Order status updated successfully', order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

app.get('/api/product/:id', async (req, res) => {
  try {
    const productId = req.params.id
    console.log('received data for', productId)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'error'})
  }
})

app.route('/api/products/:id')
  .get(async (req, res) => {
    const productId = req.params.id;
    console.log('Fetching product details for ID:', productId);

    try {
      const product = await ProductModel.findOne({ id: productId });
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.status(200).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  .put(async (req, res) => {
    const productId = req.params.id;

    // Extract the updated product data from the request body
    const updatedProductData = req.body;

    try {
      // Find and update the product in the database
      const updatedProduct = await ProductModel.findOneAndUpdate(
        { id: productId },
        { $set: updatedProductData },
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // ... Your existing code ...

  app.delete('/api/products/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        // Find the product in the database by the id field
        const result = await ProductModel.deleteOne({ id: productId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Respond with a success message
        return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/logout', (req, res) => {
  console.log("logging out")
  // Use a callback function as required by req.logout
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/login');
  });
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/admin',
  failureRedirect: '/login',
  failureFlash: true,
}), (req, res, next) => {
  // This callback will be called after authentication is successful
  // You can use req.user here
  console.log('Authenticated User:', req.user);

  // Continue with the next middleware
  next();
});


app.post('/send', upload.array('attachments'), async function (req, res) {
  let transporter;  // Move the declaration outside the try block
  try {
      // Validate form inputs (add your validation logic here)

      const data = req.body;
      const attachments = req.files; // use req.files for multiple files

      // Create a nodemailer transporter
       transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: process.env.USER,
              pass: process.env.PASS,
          },
          
      });

  

      const newEmail = new EmailModel({
          name: req.body.name,
          email: req.body.email.toLowerCase(), // Check and convert to lowercase
          phone: req.body.phone,
          subject: req.body.subject,
          message: req.body.message,
      });
      console.log("request body", req.body)

      await newEmail.save();

      // Prepare email content
      const emailContent = `<p>${data.message}</p><p>Phone Number: ${data.phone}</p>`;

      // Prepare attachments array
      const attachmentsArray = [];

      if (attachments) {
          // Loop through each attachment
          for (const attachment of attachments) {
              const attachmentContent = (await fs.readFile(path.join(__dirname, 'uploads', attachment.filename))).toString('base64');
              attachmentsArray.push({
                  filename: attachment.originalname,
                  content: attachmentContent,
                  encoding: 'base64',
                  contentType: attachment.mimetype,
              });
          }
      }

      // Mail options for sending email to admin
      const adminMailOptions = {
          from: data.email,
          to: process.env.USER,
          subject: data.subject,
          html: emailContent,
          replyTo: data.email,
          attachments: attachmentsArray,
      };

      // Mail options for sending automatic response to the user
      const userMailOptions = {
          from: process.env.USER, // Your email address
          to: data.email, // User's email address
          subject: 'Thank you for contacting us, ' + data.name + '!',
          html: 'Thank you for contacting us! We have received your message and will get back to you as soon as possible.<br><br>For more information, please visit our page at www.info.com',
      };

      // Send the email to admin
      transporter.sendMail(adminMailOptions, function (error, info) {
          if (error) {
              console.error('Error sending email to admin:', error);
              res.status(500).send('Error sending email');
          } else {
              console.log('Email sent to admin successfully', info.response);

              // Send the automatic response email to the user
              transporter.sendMail(userMailOptions, function (userError, userInfo) {
                  if (userError) {
                      console.error('Error sending automatic response to user:', userError);
                  } else {
                      console.log('Automatic response sent to user successfully', userInfo.response);
                  }
              });

              res.redirect('/thanks');
          }
      });
  } catch (error) {
      console.error('Error processing form submission:', error);
      res.status(500).send('Internal server error');
  }
});


app.post('/api/products', async (req, res) => {
  try {
    const { id, title, image, price, description, stock, category, tag } = req.body;
    console.log('Received product data:', req.body);


    const newProduct = new ProductModel({
      id,
      title,
      image,
      price,
      description,
      stock,
      category,
      tag
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post("/stripe-checkout", async (req, res) => {
    const lineItems = req.body.items.map((item) => {
        const unitAmount = parseInt(parseFloat(item.price) * 100)
        console.log("item-price:", item.price);
        console.log("unitAmount:", unitAmount);
        return{
            price_data: {
                currency: "gbp",
                product_data: {
                    name: item.title,
                    images: [item.image]
                },
                unit_amount: unitAmount,
            },
            quantity: item.quantity,
        }
    })

    
    const session = await stripeGateway.checkout.sessions.create({
        payment_method_types: ['card'],
        shipping_address_collection: {
            allowed_countries: ['GB'],
          },
          shipping_options: [
            {
              shipping_rate_data: {
                type: 'fixed_amount',
                fixed_amount: {
                  amount: 0,
                  currency: 'gbp',
                },
                display_name: 'Same Day In-Store Collection',
                delivery_estimate: {
                  minimum: {
                    unit: 'hour',
                    value: 1,
                  },
                  maximum: {
                    unit: 'hour',
                    value: 6,
                  },
                },
              },
            },
            {
              shipping_rate_data: {
                type: 'fixed_amount',
                fixed_amount: {
                  amount: 0,
                  currency: 'gbp',
                },
                display_name: 'In-Store Collection',
                delivery_estimate: {
                  minimum: {
                    unit: 'business_day',
                    value: 3,
                  },
                  maximum: {
                    unit: 'business_day',
                    value: 5,
                  },
                },
              },
            },
            {
              shipping_rate_data: {
                type: 'fixed_amount',
                fixed_amount: {
                  amount: 0,
                  currency: 'gbp',
                },
                display_name: 'Standard Shipping',
                delivery_estimate: {
                  minimum: {
                    unit: 'business_day',
                    value: 5,
                  },
                  maximum: {
                    unit: 'business_day',
                    value: 10,
                  },
                },
              },
            },
            {
              shipping_rate_data: {
                type: 'fixed_amount',
                fixed_amount: {
                  amount: 500,
                  currency: 'gbp',
                },
                display_name: 'Premium Shipping',
                delivery_estimate: {
                  minimum: {
                    unit: 'business_day',
                    value: 1,
                  },
                  maximum: {
                    unit: 'business_day',
                    value: 3,
                  },
                },
              },
            },
            {
              shipping_rate_data: {
                type: 'fixed_amount',
                fixed_amount: {
                  amount: 750,
                  currency: 'gbp',
                },
                display_name: 'Next Day Delivery',
              },
            },
          ],
          phone_number_collection: {
            enabled: true
          },
          invoice_creation: {
            enabled: true,
          },
          allow_promotion_codes: true,
        mode: "payment",
        success_url: "https://test-admin-wdmf.onrender.com/success.html?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "https://test-admin-wdmf.onrender.com/cancel.html?session_id={CHECKOUT_SESSION_ID}",
        billing_address_collection: "required",
        line_items: lineItems, 
    })

    // "https://test-admin-wdmf.onrender.com/success.html?session_id={CHECKOUT_SESSION_ID}"
    
    console.log(session); // Log the session object to the console   

    res.json({ sessionId: session.id, url: session.url });

})

app.post('/webhooks', async (req, res) => {
  try {
    console.log("Received Stripe Webhook request:", req.body);

    const sig = req.headers['stripe-signature'];
    const rawBody = req.rawBody;

    let event;

    try {
      event = stripeGateway.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_ENDPOINT_SECRET
      );
    } catch (err) {
      console.error('Webhook error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'invoice.finalized') {
      const invoice = event.data.object;

      const orderData = {
        timestamp: new Date().toLocaleString(),
        id: invoice.id,
        name: invoice.customer_name,
        email: invoice.customer_email,
        phone: invoice.customer_phone,
        address: `${invoice.customer_address.line1}\n${invoice.customer_address.city}, ${invoice.customer_address.postal_code}\n${invoice.customer_address.country}`,
        totalPrice: invoice.total,
        shipping: invoice.shipping_cost.amount_total,
        lineItems: invoice.lines.data.map(item => ({
          name: item.description,
          quantity: item.quantity,
          unitPrice: item.amount / item.quantity,
        })),
        status: 'pending'
      };

    
      // Log order data for debugging
      console.log('Order data (test#1):', orderData);
      addOrderToTable(orderData)
      console.log("Added Order to table")
      updateStock(orderData)
      console.log("Updating Stock, test #123")
      sendOrderConfirmationEmail(orderData)
      console.log(`Order confirmation email sent to ${orderData.name}`)

      res.json({ received: true });
    } else {
      console.log('Received a webhook event of type:', event.type);
    }
  } catch (error) {
    console.error('Error processing webhook:', error.message);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});



function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/login');
  }
  next();
}

app.listen(3001, () => {
    console.log("Listening on port 3001");
});


