import express from "express";
import dotenv from "dotenv";
import stripe from "stripe";
import bodyParser from 'body-parser';



dotenv.config();


const app = express();
let stripeGateway = stripe(process.env.stripe_key); // Define stripeGateway here
let products = [];  // Initialize an empty array for products


app.use(express.static("public"));
app.use(express.json());

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


function fetchProductDetails(items) {
  // Your logic to fetch product details from the dynamic array
  const productDetails = items.map((item) => {
    const product = products.find((p) => p.id === item.id);
    return {
      ...item,
      productDetails: product,
    };
  });

  return productDetails;
}

app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  let sig = req.headers['stripe-signature'];


  try {
    event = stripeGateway.webhooks.constructEvent(req.body, sig, process.env.STRIPE_ENDPOINT_SECRET);
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Fetch product details based on the session information
    const productDetails = fetchProductDetails(session.line_items);
    console.log('Product Details:', productDetails);
  }

  res.json({ received: true });
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

    res.json({ url: session.url });

})


app.listen(3000, () => {
    console.log("Listening on port 3000");
});
