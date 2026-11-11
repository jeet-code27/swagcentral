import nodemailer from "nodemailer";
import { IOrderItem } from "@/models/Order";
import path from "path";
import fs from "fs";

export interface MailOrder {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: IOrderItem[];
  totalAmount: number;
  downloadToken: string;
}

type MailResult = { success: boolean; messageId?: string; error?: string };

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!transporter) {
    const port = parseInt(process.env.SMTP_PORT || "465");
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS?.replace(/"/g, ""),
      },
    });
  }
  return transporter;
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function logoAttachment() {
  const logoPath = path.join(process.cwd(), "public", "images", "logo-email.png");
  return fs.existsSync(logoPath)
    ? [{ filename: "swagcentral-logo.png", path: logoPath, cid: "company-logo" }]
    : [];
}

function formatLabel(deliveryType: string) {
  return deliveryType === "pdf"
    ? "Direct PDF"
    : deliveryType === "both"
    ? "Drive Cloud Folder + PDF"
    : "Google Drive / Canva Link";
}

/**
 * Shared branded email shell (header, order box, support box, footer)
 */
function renderEmail(opts: {
  title: string;
  badge: string;
  badgeColors: { bg: string; border: string; text: string };
  intro: string;
  order: MailOrder;
  statusLabel: string;
  statusColor: string;
  itemsHeading: string;
  itemsHtml: string;
  footerCta: string;
}) {
  const { order } = opts;
  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${escapeHtml(opts.title)}</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 30px 10px; background-color: #f4f4f5;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 8px 30px rgba(0,0,0,0.08); border: 1px solid #eaeaea;">

                <!-- Brand Header -->
                <tr>
                  <td style="background-color: #0d1117; padding: 32px 24px; text-align: center; border-bottom: 3px solid #ff5500;">
                    <img src="cid:company-logo" alt="SwagCentral" width="180" style="display: inline-block; max-width: 180px; height: auto;" />
                    <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600;">
                      Digital Products Hub
                    </p>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 36px 32px; background-color: #ffffff;">
                    <div style="display: inline-block; background-color: ${opts.badgeColors.bg}; border: 1px solid ${opts.badgeColors.border}; color: ${opts.badgeColors.text}; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 16px;">
                      ${opts.badge}
                    </div>

                    <h2 style="color: #0f172a; margin: 0 0 10px 0; font-size: 22px; font-weight: 800;">
                      Namaste ${escapeHtml(order.customerName || "Friend")},
                    </h2>
                    <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                      ${opts.intro}
                    </p>

                    <!-- Order Box -->
                    <div style="background-color: #fff7ed; border-left: 4px solid #ff5500; border-radius: 8px; padding: 16px 20px; margin-bottom: 28px;">
                      <p style="margin: 0; font-size: 13px; color: #9a3412;">
                        <strong>Order ID:</strong> <span style="font-family: monospace; font-size: 14px;">${escapeHtml(order.orderId)}</span><br/>
                        <strong>Customer Email:</strong> ${escapeHtml(order.customerEmail)}<br/>
                        <strong>Order Total:</strong> ₹${escapeHtml(order.totalAmount)}<br/>
                        <strong>Status:</strong> <span style="color: ${opts.statusColor}; font-weight: bold;">${opts.statusLabel}</span>
                      </p>
                    </div>

                    <h3 style="color: #0f172a; font-size: 16px; margin: 0 0 14px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${opts.itemsHeading}
                    </h3>

                    <div>
                      ${opts.itemsHtml}
                    </div>

                    ${opts.footerCta}

                    <!-- WhatsApp & Contact Box -->
                    <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 18px; margin-top: 30px; text-align: center;">
                      <p style="margin: 0 0 8px 0; font-size: 13px; color: #334155; font-weight: 600;">
                        Need assistance or have questions regarding your order?
                      </p>
                      <p style="margin: 0; font-size: 13px; color: #64748b;">
                        WhatsApp Support: <a href="https://wa.me/919821774565" style="color: #25d366; font-weight: bold; text-decoration: none;">+91 9821774565</a><br/>
                        Email Support: <a href="mailto:swagcentral012@gmail.com" style="color: #ff5500; font-weight: bold; text-decoration: none;">swagcentral012@gmail.com</a>
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #0f172a; padding: 24px; text-align: center; border-top: 1px solid #1e293b;">
                    <p style="color: #94a3b8; font-size: 12px; margin: 0 0 6px 0;">
                      <strong>SwagCentral</strong> • Gurgaon, Haryana, India
                    </p>
                    <p style="color: #64748b; font-size: 11px; margin: 0;">
                      © 2026 SwagCentral. All Rights Reserved. This is an automated email.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
}

function renderItemRow(item: IOrderItem, index: number, actionsHtml: string) {
  return `
          <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="70" valign="top">
                  <img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)}" width="65" height="65" style="border-radius: 10px; object-fit: cover; display: block; border: 1px solid #f1f5f9;" />
                </td>
                <td valign="top" style="padding-left: 16px;">
                  <span style="font-size: 11px; font-weight: bold; color: #ff5500; text-transform: uppercase; letter-spacing: 0.5px;">Item #${index + 1}</span>
                  <h4 style="margin: 4px 0 6px 0; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 15px; color: #111827; line-height: 1.4;">${escapeHtml(item.title)}</h4>
                  <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px;">Price: ₹${escapeHtml(item.price)} • Format: ${formatLabel(item.deliveryType)}</p>
                  <div>${actionsHtml}</div>
                </td>
              </tr>
            </table>
          </div>
        `;
}

/**
 * Sent right after checkout: order received, products will be delivered after confirmation.
 */
export async function sendOrderConfirmationEmail(order: MailOrder): Promise<MailResult> {
  try {
    const statusPageUrl = `${appUrl()}/download/${order.downloadToken}`;
    const itemsHtml = order.items.map((item, i) => renderItemRow(item, i, "")).join("");

    const html = renderEmail({
      title: "Order Received - SwagCentral",
      badge: "✓ Order Confirmed • Payment Received",
      badgeColors: { bg: "#fffbeb", border: "#f59e0b", text: "#b45309" },
      intro: `Thank you for shopping with <strong>SwagCentral</strong>! We have received your payment of <strong style="color: #ff5500;">₹${escapeHtml(order.totalAmount)}</strong> and your order is confirmed. <strong>You will receive your digital products on this email within 12 hours.</strong>`,
      order,
      statusLabel: "Processing",
      statusColor: "#b45309",
      itemsHeading: "Your Order Summary:",
      itemsHtml,
      footerCta: `
                    <div style="text-align: center; margin: 36px 0 24px 0;">
                      <a href="${statusPageUrl}" style="background-color: #111111; color: #ffffff; padding: 14px 32px; border-radius: 10px; font-size: 14px; font-weight: bold; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
                        Track Order Status
                      </a>
                      <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0 0;">
                        Your download links will be emailed to you within 12 hours. You can also track your order anytime using the button above.
                      </p>
                    </div>`,
    });

    const info = await getTransporter().sendMail({
      from: process.env.SMTP_FROM || `"SwagCentral" <${process.env.SMTP_USER}>`,
      to: order.customerEmail,
      subject: `Order Confirmed: [Order #${order.orderId}] - Products within 12 hours`,
      html,
      attachments: logoAttachment(),
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Sent by the admin from the orders panel: contains the product access links / PDFs.
 */
export async function sendOrderDeliveryEmail(order: MailOrder): Promise<MailResult> {
  try {
    const base = appUrl();
    const accessPageUrl = `${base}/download/${order.downloadToken}`;

    const itemsHtml = order.items
      .map((item, index) => {
        let accessBtn = "";
        if (item.accessUrl) {
          accessBtn += `<a href="${escapeHtml(item.accessUrl)}" style="background-color: #ff5500; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block; margin-right: 8px; margin-top: 8px; box-shadow: 0 2px 6px rgba(255,85,0,0.3);">Open Access Link</a>`;
        }
        if (item.pdfFileName) {
          const pdfUrl = `${base}/api/download/file?file=${encodeURIComponent(item.pdfFileName)}&token=${order.downloadToken}`;
          accessBtn += `<a href="${escapeHtml(pdfUrl)}" style="background-color: #111111; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block; margin-top: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">Download PDF File</a>`;
        }
        return renderItemRow(item, index, accessBtn);
      })
      .join("");

    const html = renderEmail({
      title: "Your Digital Products from SwagCentral",
      badge: "✓ Order Delivered • Access Ready",
      badgeColors: { bg: "#ecfdf5", border: "#10b981", text: "#047857" },
      intro: `Thank you for choosing <strong>SwagCentral</strong>! Your order of <strong style="color: #ff5500;">₹${escapeHtml(order.totalAmount)}</strong> is confirmed. Your digital products are ready below.`,
      order,
      statusLabel: "Delivered • Lifetime Access",
      statusColor: "#15803d",
      itemsHeading: "Your Purchased Digital Assets:",
      itemsHtml,
      footerCta: `
                    <div style="text-align: center; margin: 36px 0 24px 0;">
                      <a href="${accessPageUrl}" style="background-color: #ff5500; color: #ffffff; padding: 15px 36px; border-radius: 10px; font-size: 15px; font-weight: bold; text-decoration: none; display: inline-block; box-shadow: 0 6px 18px rgba(255,85,0,0.35); text-transform: uppercase; letter-spacing: 0.5px;">
                        Access All Downloads Online
                      </a>
                      <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0 0;">
                        You can bookmark and revisit your access hub anytime using the button above.
                      </p>
                    </div>`,
    });

    const info = await getTransporter().sendMail({
      from: process.env.SMTP_FROM || `"SwagCentral" <${process.env.SMTP_USER}>`,
      to: order.customerEmail,
      subject: `🎉 Access Ready: Your Digital Products [Order #${order.orderId}]`,
      html,
      attachments: logoAttachment(),
    });

    console.log(`✓ Delivery email sent to ${order.customerEmail} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending delivery email:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Sends the 6-digit code a customer uses to sign in and view their orders.
 */
export async function sendLoginCodeEmail(email: string, code: string): Promise<MailResult> {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <body style="margin:0; padding:0; background-color:#f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 30px 10px;">
          <tr>
            <td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; border: 1px solid #eaeaea;">
                <tr>
                  <td style="background-color: #0d1117; padding: 24px; text-align: center; border-bottom: 3px solid #ff5500;">
                    <img src="cid:company-logo" alt="SwagCentral" width="150" style="display: inline-block; max-width: 150px; height: auto;" />
                  </td>
                </tr>
                <tr>
                  <td style="padding: 32px; text-align: center;">
                    <h2 style="color: #0f172a; margin: 0 0 10px 0; font-size: 20px;">Your login code</h2>
                    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                      Use this code to see your SwagCentral orders. It expires in 10 minutes.
                    </p>
                    <div style="font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #ff5500; background: #fff7ed; border-radius: 12px; padding: 16px 0; font-family: monospace;">
                      ${escapeHtml(code)}
                    </div>
                    <p style="color: #94a3b8; font-size: 12px; margin: 24px 0 0 0;">
                      If you didn't ask for this code, you can ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const info = await getTransporter().sendMail({
      from: process.env.SMTP_FROM || `"SwagCentral" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `${code} is your SwagCentral login code`,
      html,
      attachments: logoAttachment(),
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending login code email:", error);
    return { success: false, error: (error as Error).message };
  }
}
