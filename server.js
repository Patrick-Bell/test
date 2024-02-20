const express = require('express')
const dotenv = require('dotenv')
const stripe = require('stripe')
const mongoose = require('mongoose')
const OrderModel = require('./models/order')
const { addOrderToTable, getOrdersFromTable } = require('./orders'); // Updated import statement

const bodyParser = require('body-parser')


dotenv.config();

const app = express();
let stripeGateway = stripe(process.env.stripe_key);
let products = [];

// Set up middleware
app.use(express.static("public"));
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

app.get("/get-products", (req, res) => {
  res.json(products);
});

app.get("/", (req, res) => {
    res.sendFile("index.html", { root: "public" });
});

app.get("/cart.html", (req, res) => {
    res.sendFile("cart.html", { root: "public" });
});

app.get("/faq.html", (req, res) => {
    res.sendFile("faq.html", { root: "public" });
});

app.get("/success.html", (req, res) => {
    res.sendFile("success.html", { root: "public" });
});

app.get("/cancel.html", (req, res) => {
    res.sendFile("cancel.html", { root: "public" });
});

app.get("/thanks.html", (req, res) => {
    res.sendFile("thanks.html", { root: "public" });
});

app.get("/products.html", (req, res) => {
    res.sendFile("products.html", { root: "public" });
});

app.get("/delivery.html", (req, res) => {
  res.sendFile("delivery.html", { root: "public" });
});

app.get("/admin.html", (req, res) => {
  res.sendFile("admin.html", { root: "public" });
});

app.get('/orders', (req, res) => {
  const ordersArray = getOrdersArray();
  res.render('orders.html', { orders: ordersArray });
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await getOrdersFromTable();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
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
        cancel_url: "https://test-admin-wdmf.onrender.com?session_id={CHECKOUT_SESSION_ID}",
        billing_address_collection: "required",
        line_items: lineItems, 
    })
    
    console.log(session); // Log the session object to the console   

    res.json({ sessionId: session.id, url: session.url });

})

app.post('/webhooks', async (req, res) => {
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
      id: invoice.id,
      name: invoice.customer_name,
      email: invoice.customer_email,
      phone: invoice.customer_phone,
      address: `${invoice.customer_address.line1}\n${invoice.customer_address.city}, ${invoice.customer_address.postal_code}\n${invoice.customer_address.country}`,
      totalPrice: invoice.total,
      lineItems: invoice.lines.data.map(item => ({
        name: item.description,
        quantity: item.quantity,
        unitPrice: item.amount / item.quantity,
      })),
    };
    

    // Call a function to add this order data to your orders
    addOrderToTable(orderData);

    console.log('Order data:', orderData);


    res.json({ received: true });
  } else {
    // Optionally handle other event types differently, or just ignore them
    // res.json({ received: true });  // Commented out or remove this line
    console.log('Received a webhook event of type:', event.type);
  }
});



app.listen(3000, () => {
    console.log("Listening on port 3000");
});


