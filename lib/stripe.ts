import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

if (!stripeSecretKey) {
    console.warn('STRIPE_SECRET_KEY is missing. Stripe integration will not work.');
}

export const stripe = new Stripe(stripeSecretKey, {
});
