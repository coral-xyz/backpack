import { FEATURE_GATES } from "./FEATURES";

const STRIPE_PROD_URL = "https://api.stripe.com/v1";

export const getStripeEnabledGate = async (
  ip: string,
  stripeSecret: string
) => {
  if (!FEATURE_GATES["STRIPE_ENABLED"]) {
    return false;
  }

  try {
    const data = await fetch(`${STRIPE_PROD_URL}/crypto/onramp_sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(stripeSecret),
      },
      body: `customer_ip_address=${ip}&customer_wallet_address=0x793cd67cb4F6F0d8b4Efec582382074766a00C11`,
    });
    if (data.status >= 400) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};
