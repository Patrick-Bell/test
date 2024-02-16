import express from "express";
import dotenv from "dotenv";
import stripeLib from "stripe";
import bodyParser from 'body-parser';



dotenv.config();

const app = express();

app.use(express.static("public"));
app.use(express.json());


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

    
    let stripeGateway = stripeLib(process.env.stripe_key);
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
        success_url: `https://test-admin-wdmf.onrender.com/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://test-admin-wdmf.onrender.com/cancel.html?session_id={CHECKOUT_SESSION_ID}`,
        billing_address_collection: "required",
        line_items: lineItems, 
    })
    
    console.log(session); // Log the session object to the console

    res.json({ url: session.url })
})



app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (request, response) => {
  const sig = request.headers['stripe-signature'];
  let event;

  try {
    event = await stripeGateway.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_ENDPOINT_SECRET
    );
    console.log('Webhook Event:', event);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const sessionCompleted = event.data.object;
      console.log('Checkout Session Completed:', sessionCompleted);
      // Handle the successful checkout event here
      break;
    // Add more cases for other event types as needed
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});




app.listen(3000, () => {
    console.log("Listening on port 3000");
});
