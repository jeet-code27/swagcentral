import nodemailer from "nodemailer";
import { IOrder } from "@/models/Order";
import path from "path";
import fs from "fs";

export async function sendOrderDeliveryEmail(order: IOrder): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT || "465");
    const user = process.env.SMTP_USER || "swagcentral012@gmail.com";
    const pass = process.env.SMTP_PASS?.replace(/"/g, "") || "ozvu bqlk djji jsys";
    const from = process.env.SMTP_FROM || `"SwagCentral" <${user}>`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const accessPageUrl = `${appUrl}/download/${order.downloadToken}`;

    // Generate product access list HTML
    const itemsHtml = order.items
      .map((item, index) => {
        let accessBtn = "";
        if (item.accessUrl) {
          accessBtn += `<a href="${item.accessUrl}" style="background-color: #ff5500; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block; margin-right: 8px; margin-top: 8px; box-shadow: 0 2px 6px rgba(255,85,0,0.3);">Open Access Link</a>`;
        }
        if (item.pdfFileName) {
          accessBtn += `<a href="${appUrl}/api/download/file?file=${item.pdfFileName}" style="background-color: #111111; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block; margin-top: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">Download PDF File</a>`;
        }

        return `
          <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="70" valign="top">
                  <img src="${item.thumbnail}" alt="${item.title}" width="65" height="65" style="border-radius: 10px; object-fit: cover; display: block; border: 1px solid #f1f5f9;" />
                </td>
                <td valign="top" style="padding-left: 16px;">
                  <span style="font-size: 11px; font-weight: bold; color: #ff5500; text-transform: uppercase; letter-spacing: 0.5px;">Bundle #${index + 1}</span>
                  <h4 style="margin: 4px 0 6px 0; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 15px; color: #111827; line-height: 1.4;">${item.title}</h4>
                  <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px;">Format: ${item.deliveryType === 'pdf' ? 'Direct PDF' : item.deliveryType === 'both' ? 'Drive Cloud Folder + PDF' : 'Google Drive / Canva Link'}</p>
                  <div>${accessBtn}</div>
                </td>
              </tr>
            </table>
          </div>
        `;
      })
      .join("");

    const attachments: Array<{ filename: string; path: string; cid?: string }> = [];

    // Attach Company Logo as inline CID
    const logoPath = path.join(process.cwd(), "public", "images", "swagat_central_transparent.png");
    if (fs.existsSync(logoPath)) {
      attachments.push({
        filename: "swagat_central_transparent.png",
        path: logoPath,
        cid: "company-logo",
      });
    }

    // Attach small PDF guides if available
    for (const item of order.items) {
      if (item.pdfFileName) {
        const filePath = path.join(process.cwd(), "public", "downloads", item.pdfFileName);
        if (fs.existsSync(filePath)) {
          attachments.push({
            filename: item.pdfFileName,
            path: filePath,
          });
        }
      }
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your Digital Products from SwagCentral</title>
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
                    <!-- Badge -->
                    <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #10b981; color: #047857; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 16px;">
                      ✓ Payment Confirmed • Instant Access Ready
                    </div>

                    <h2 style="color: #0f172a; margin: 0 0 10px 0; font-size: 22px; font-weight: 800;">
                      Namaste ${order.customerName || "Friend"},
                    </h2>
                    <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                      Thank you for choosing <strong>SwagCentral</strong>! Your payment of <strong style="color: #ff5500;">₹${order.totalAmount}</strong> has been successfully verified. Your digital assets are ready for download below.
                    </p>

                    <!-- Order Box -->
                    <div style="background-color: #fff7ed; border-left: 4px solid #ff5500; border-radius: 8px; padding: 16px 20px; margin-bottom: 28px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <p style="margin: 0; font-size: 13px; color: #9a3412;">
                              <strong>Order ID:</strong> <span style="font-family: monospace; font-size: 14px;">${order.orderId}</span><br/>
                              <strong>Customer Email:</strong> ${order.customerEmail}<br/>
                              <strong>Access Status:</strong> <span style="color: #15803d; font-weight: bold;">Lifetime Unlocked</span>
                            </p>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- Products Header -->
                    <h3 style="color: #0f172a; font-size: 16px; margin: 0 0 14px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                      Your Purchased Digital Assets:
                    </h3>

                    <!-- Items List -->
                    <div>
                      ${itemsHtml}
                    </div>

                    <!-- Central All-Access Button -->
                    <div style="text-align: center; margin: 36px 0 24px 0;">
                      <a href="${accessPageUrl}" style="background-color: #ff5500; color: #ffffff; padding: 15px 36px; border-radius: 10px; font-size: 15px; font-weight: bold; text-decoration: none; display: inline-block; box-shadow: 0 6px 18px rgba(255,85,0,0.35); text-transform: uppercase; letter-spacing: 0.5px;">
                        Access All Downloads Online
                      </a>
                      <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0 0;">
                        You can bookmark and revisit your access hub anytime using the button above.
                      </p>
                    </div>

                    <!-- WhatsApp & Contact Box -->
                    <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 18px; margin-top: 30px; text-align: center;">
                      <p style="margin: 0 0 8px 0; font-size: 13px; color: #334155; font-weight: 600;">
                        Need assistance or have questions regarding your bundle?
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
                      © 2026 SwagCentral. All Rights Reserved. This is an automated digital product delivery receipt.
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

    const info = await transporter.sendMail({
      from,
      to: order.customerEmail,
      subject: `🎉 Access Ready: Your Digital Products [Order #${order.orderId}]`,
      html: htmlContent,
      attachments,
    });

    console.log(`✓ Real email dispatched to ${order.customerEmail} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending delivery email:", error);
    return { success: false, error: (error as Error).message };
  }
}
