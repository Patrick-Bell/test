import stripeLib from 'stripe';

import dotenv from 'dotenv';

dotenv.config();

const stripeInstance = stripeLib(process.env.stripe_key);

const handleWebhookEvent = (request, response) => {
    const sig = request.headers['stripe-signature'];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_ENDPOINT_SECRET);
    } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntentSucceeded = event.data.object;
            console.log('Payment Intent Succeeded:', paymentIntentSucceeded);
            // Handle the successful payment event here
            break;
        // Add more cases for other event types as needed
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
};

export { handleWebhookEvent };

