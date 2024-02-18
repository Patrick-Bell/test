import { stripeGateway } from './server';  // Adjust the import path based on your project structure

const app = express();
app.use(bodyParser.raw({ type: 'application/json', verify: (req, res, buf) => { req.rawBody = buf; } }));


// Webhook endpoint
app.post('/webhook', express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
  
    try {
      event = stripeGateway.webhooks.constructEvent(
        req.rawBody,
        sig,
        process.env.STRIPE_ENDPOINT_SECRET
      );
    } catch (err) {
      console.error('Webhook error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log(session)
      const customerDetails = session.customer_details;
  
      // Logging customer name to the console
      console.log('Customer Name:', customerDetails.name);
    }
  
    res.json({ received: true });
  });