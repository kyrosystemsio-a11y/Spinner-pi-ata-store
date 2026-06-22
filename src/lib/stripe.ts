import Stripe from "stripe";

// TODO(jay): set STRIPE_SECRET_KEY in your environment (test mode key to start).
// Until then, checkout requests will fail with a clear 503 rather than crashing the build.
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;
