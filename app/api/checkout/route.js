import paypal from "@paypal/checkout-server-sdk";
const clientID = "AbRMwcea-gsUfQJlbJlw0snA3Y_dxNDuZ6oQL3odx7bH6ozFPULZ9iSXXdxpMiemd-pmZuMAe6cWpOw0";
const clientSecret ="EFPaGXnuEqFgKc-sFBLf1EAi4i2sJsDuzGyW0nkwHpVuxOUTho_IBktohrZghHwjr6Djyt860gpJgOU9";

const environment = new paypal.core.SandboxEnvironment(clientID, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

export function POST() {
    return Response.json({ message: "Procesando pago" });
}