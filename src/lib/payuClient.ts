/**
 * Browser helper: posts the payment form returned by our API to PayU's hosted payment page.
 */
export function redirectToPayu(payment: { action: string; fields: Record<string, string> }) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = payment.action;
  form.style.display = "none";
  Object.entries(payment.fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}
