import crypto from "crypto";

/**
 * PayU India (Hosted Checkout) helpers.
 *
 * Env:
 *   PAYU_MERCHANT_KEY   - "Key" from PayU Dashboard > Developer > API Keys
 *   PAYU_MERCHANT_SALT  - "Salt" from the same screen (keep secret)
 *   PAYU_MODE           - "test" or "live" (default "test")
 */

const URLS = {
  test: {
    payment: "https://test.payu.in/_payment",
    verify: "https://test.payu.in/merchant/postservice.php?form=2",
  },
  live: {
    payment: "https://secure.payu.in/_payment",
    verify: "https://info.payu.in/merchant/postservice.php?form=2",
  },
};

export function getPayuConfig() {
  const key = process.env.PAYU_MERCHANT_KEY?.trim();
  const salt = process.env.PAYU_MERCHANT_SALT?.trim();
  if (!key || !salt) return null;
  const mode = process.env.PAYU_MODE === "live" ? "live" : "test";
  return { key, salt, mode, urls: URLS[mode] } as const;
}

const sha512 = (value: string) => crypto.createHash("sha512").update(value).digest("hex");

/** PayU fields must not contain the "|" hash separator. */
const clean = (value: string, max: number) => value.replace(/[|]/g, " ").trim().slice(0, max);

export interface PayuPaymentInput {
  txnid: string;
  amount: number;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  /** Our order ID, echoed back by PayU. */
  orderId: string;
}

/**
 * Builds the form fields the browser POSTs to PayU's hosted payment page.
 * Hash: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
 */
export function buildPayuPayment(input: PayuPaymentInput) {
  const config = getPayuConfig();
  if (!config) throw new Error("PayU is not configured");

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const callbackUrl = `${appUrl}/api/payment/payu/callback`;

  const fields = {
    key: config.key,
    txnid: input.txnid,
    amount: input.amount.toFixed(2),
    productinfo: clean(input.productinfo, 100) || "SwagCentral Order",
    firstname: clean(input.firstname, 60) || "Customer",
    email: input.email,
    phone: input.phone,
    udf1: input.orderId,
    udf2: "",
    udf3: "",
    udf4: "",
    udf5: "",
    surl: callbackUrl,
    furl: callbackUrl,
  };

  const hash = sha512(
    [
      fields.key,
      fields.txnid,
      fields.amount,
      fields.productinfo,
      fields.firstname,
      fields.email,
      fields.udf1,
      fields.udf2,
      fields.udf3,
      fields.udf4,
      fields.udf5,
      "",
      "",
      "",
      "",
      "",
      config.salt,
    ].join("|")
  );

  return { action: config.urls.payment, fields: { ...fields, hash } };
}

/**
 * Checks the hash PayU sends back to our callback / webhook.
 * Reverse hash: sha512([additionalCharges|]SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export function verifyPayuResponseHash(data: Record<string, string>): boolean {
  const config = getPayuConfig();
  if (!config || !data.hash) return false;

  const parts = [
    config.salt,
    data.status || "",
    "",
    "",
    "",
    "",
    "",
    data.udf5 || "",
    data.udf4 || "",
    data.udf3 || "",
    data.udf2 || "",
    data.udf1 || "",
    data.email || "",
    data.firstname || "",
    data.productinfo || "",
    data.amount || "",
    data.txnid || "",
    config.key,
  ];
  if (data.additionalCharges) parts.unshift(data.additionalCharges);

  const expected = sha512(parts.join("|"));
  const received = data.hash.toLowerCase();
  return (
    expected.length === received.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received))
  );
}

export interface PayuTransaction {
  status: "success" | "failure" | "pending";
  amount: number;
  mihpayid: string;
  mode: string;
  unmappedStatus: string;
  errorMessage: string;
}

/**
 * Asks PayU's server (verify_payment API) for the real status of a transaction.
 * This is the source of truth; browser callbacks can be faked, this call cannot.
 */
export async function verifyPayuTransaction(txnid: string): Promise<PayuTransaction | null> {
  const config = getPayuConfig();
  if (!config) return null;

  const command = "verify_payment";
  const body = new URLSearchParams({
    key: config.key,
    command,
    var1: txnid,
    hash: sha512(`${config.key}|${command}|${txnid}|${config.salt}`),
  });

  const res = await fetch(config.urls.verify, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PayU verify failed with HTTP ${res.status}`);

  const json = await res.json();
  const tx = json?.transaction_details?.[txnid];
  if (!tx || tx.status === "Not Found") return null;

  const status = String(tx.status || "").toLowerCase();
  const unmapped = String(tx.unmappedstatus || tx.status || "");
  // PayU puts "NO ERROR" in error_Message for cancellations; field9 / unmappedstatus are more useful
  const rawError = [tx.error_Message, tx.field9].find(
    (m) => typeof m === "string" && m.trim() && m.trim().toUpperCase() !== "NO ERROR"
  );
  const errorMessage = unmapped === "userCancelled" ? "Cancelled by customer" : String(rawError || unmapped);
  return {
    status: status === "success" ? "success" : status === "pending" ? "pending" : "failure",
    amount: parseFloat(tx.amt ?? tx.transaction_amount ?? "0"),
    mihpayid: String(tx.mihpayid || ""),
    mode: String(tx.mode || ""),
    unmappedStatus: unmapped,
    errorMessage,
  };
}
