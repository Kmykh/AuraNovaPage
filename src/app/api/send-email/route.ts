import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { order, customer, items, subtotal, deliveryType, estimatedDeliveryCost, emailType = 'receipt' } = await request.json();

    const token = order.trackingToken || order.TrackingToken || order.token || 'NO-DISPONIBLE';

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const formatCurrency = (val: number) => `S/ ${val.toFixed(2)}`;

    const itemsHtml = items.map((item: any) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px dashed #d38b8b;">
          <strong>${item.quantity}x</strong> ${item.name || item.productName}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px dashed #d38b8b; text-align: right;">
          ${formatCurrency((item.price || item.unitPrice) * item.quantity)}
        </td>
      </tr>
    `).join('');

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f6f3ef; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #4a3933; -webkit-font-smoothing: antialiased;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f6f3ef; padding: 40px 10px;">
        <tr>
          <td align="center">
            
            <table width="100%" max-width="520" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background: #ffffff; padding: 45px 35px; border: 1px solid #e4d8cd; box-shadow: 0 20px 40px rgba(74, 57, 51, 0.04);">
              
              <!-- Elegant Header with Flower -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <img src="https://jfxbsnhzbkdawncdatwb.supabase.co/storage/v1/object/public/payment-evidence/mail/flortallo.png" width="70" style="display: block; margin-bottom: 20px; opacity: 0.85;" alt="Flor Aura Nova" />
                  <h1 style="font-family: 'Georgia', 'Times New Roman', serif; font-size: 38px; font-weight: normal; color: #b89759; font-style: italic; margin: 0; letter-spacing: 3px;">Aura Nova</h1>
                  <p style="font-size: 10px; color: #d38b8b; text-transform: uppercase; letter-spacing: 5px; margin-top: 12px; margin-bottom: 0;">Detalles con cariño</p>
                </td>
              </tr>
              
              <!-- Decorative Divider -->
              <tr>
                <td align="center" style="padding: 15px 0;">
                  <p style="color: #c8a96b; font-size: 14px; letter-spacing: 4px; margin: 0; opacity: 0.6;">✧ ✦ ✧</p>
                </td>
              </tr>
              
              <!-- Letter Greeting -->
              <tr>
                <td style="padding: 15px 0;">
                  <p style="font-family: 'Georgia', 'Times New Roman', serif; font-size: 26px; color: #4a3933; font-style: italic; margin: 0 0 15px 0; text-align: center;">
                    ¡Gracias por tu pedido, ${customer.name}!
                  </p>
                  <p style="font-size: 15px; line-height: 1.8; color: #887870; text-align: center; margin: 0;">
                    Hemos recibido tu solicitud y estamos muy felices de preparar este detalle especial para ti. Cada arreglo es elaborado con suma dedicación y magia.
                  </p>
                </td>
              </tr>

              <!-- Decorative Divider -->
              <tr>
                <td align="center" style="padding: 25px 0 15px 0;">
                  <div style="width: 60px; height: 1px; background-color: #e4d8cd;"></div>
                </td>
              </tr>

              <!-- Order Info (Greek Minimalist) -->
              <tr>
                <td style="padding: 15px 0;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td width="50%" align="center">
                        <p style="margin: 0 0 8px 0; font-size: 9px; color: #a4968f; text-transform: uppercase; letter-spacing: 3px;">Pedido</p>
                        <p style="margin: 0; font-family: 'Georgia', serif; font-size: 20px; color: #4a3933; font-style: italic;">${order.orderCode}</p>
                      </td>
                      <td width="1%" align="center">
                        <div style="width: 1px; height: 40px; background-color: #e4d8cd;"></div>
                      </td>
                      <td width="49%" align="center">
                        <p style="margin: 0 0 8px 0; font-size: 9px; color: #a4968f; text-transform: uppercase; letter-spacing: 3px;">Token de rastreo</p>
                        <p style="margin: 0; font-family: monospace; font-size: 18px; color: #b89759; letter-spacing: 2px;">${token}</p>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 25px 0 0 0; font-size: 12px; color: #a4968f; text-align: center; font-style: italic; letter-spacing: 0.5px;">
                    Utiliza el token en nuestra web para rastrear el progreso de tu pedido.
                  </p>
                </td>
              </tr>

              <!-- Receipt Details or Quote Received Message -->
              <tr>
                <td style="padding: 35px 0 20px 0;">
                  ${emailType === 'quote_received' ? `
                    <div style="background-color: #faf7f2; padding: 35px 25px; border: 1px solid #e4d8cd; text-align: center;">
                      <h3 style="font-family: 'Georgia', 'Times New Roman', serif; font-size: 22px; color: #b89759; font-weight: normal; font-style: italic; margin: 0 0 15px 0;">
                        Solicitud Recibida
                      </h3>
                      <p style="font-size: 14px; color: #887870; line-height: 1.7; margin: 0;">
                        Nuestro equipo revisará los detalles de tu pedido personalizado y calculará el monto total. Nos pondremos en contacto contigo a través de WhatsApp para confirmar el monto y enviarte tu comprobante de pago final.
                      </p>
                    </div>
                  ` : `
                    <div style="background-color: #faf7f2; padding: 35px 30px; border: 1px solid #e4d8cd;">
                      <h3 style="font-family: 'Georgia', 'Times New Roman', serif; font-size: 22px; color: #b89759; font-weight: normal; font-style: italic; text-align: center; margin: 0 0 30px 0;">
                        Comprobante de Pago
                      </h3>
                      
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px;">
                        ${items && items.length > 0 ? itemsHtml : `
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #e4d8cd; color: #4a3933;">
                            <strong>1x</strong> Pedido Personalizado
                          </td>
                          <td style="padding: 12px 0; border-bottom: 1px solid #e4d8cd; text-align: right; color: #887870;">
                            ${formatCurrency(subtotal || 0)}
                          </td>
                        </tr>
                        `}
                        ${items && items.length > 0 ? `
                        <tr>
                          <td style="padding: 20px 0 12px 0; color: #887870; font-size: 13px;">Subtotal</td>
                          <td style="padding: 20px 0 12px 0; text-align: right; color: #4a3933;">${formatCurrency(subtotal)}</td>
                        </tr>
                        ` : ''}
                        <tr>
                          <td style="padding: 8px 0 20px 0; color: #887870; font-size: 13px; border-bottom: 1px solid #e4d8cd;">Modalidad: <span style="color: #b89759; font-style: italic;">${deliveryType === 0 || deliveryType === 'Delivery' ? 'Delivery' : deliveryType === 1 || deliveryType === 'MeetingPoint' ? 'Punto de Encuentro' : 'Envío Nacional'}</span></td>
                          <td style="padding: 8px 0 20px 0; text-align: right; color: #4a3933; border-bottom: 1px solid #e4d8cd;">${estimatedDeliveryCost !== undefined && estimatedDeliveryCost !== null ? formatCurrency(estimatedDeliveryCost) : '0.00'}</td>
                        </tr>
                      </table>
                      
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 25px;">
                        <tr>
                          <td align="right">
                            <span style="font-size: 10px; color: #a4968f; text-transform: uppercase; letter-spacing: 2px; margin-right: 15px;">Total a Pagar</span>
                            <span style="font-size: 30px; color: #4a3933; font-family: 'Georgia', serif; font-style: italic;">
                              ${formatCurrency((subtotal || 0) + (estimatedDeliveryCost || 0))}
                            </span>
                          </td>
                        </tr>
                      </table>
                    </div>
                  `}
                </td>
              </tr>
              
              <!-- Footer with Big Aesthetic Images -->
              <tr>
                <td align="center" style="padding-top: 30px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td width="30%" align="left" valign="middle">
                         <img src="https://jfxbsnhzbkdawncdatwb.supabase.co/storage/v1/object/public/payment-evidence/mail/muroromano.png" width="70" style="display: block; max-width: 70px; opacity: 0.9;" alt="" />
                      </td>
                      <td width="40%" align="center" valign="middle">
                        <p style="font-family: 'Georgia', 'Times New Roman', serif; font-size: 17px; color: #d38b8b; font-style: italic; margin: 0 0 10px 0; letter-spacing: 0.5px;">
                          Hecho en Huancayo<br>con amor
                        </p>
                        <p style="font-size: 11px; color: #887870; line-height: 1.8; margin: 0; letter-spacing: 0.5px;">
                          <a href="mailto:auranova1606@gmail.com" style="color: #b89759; text-decoration: none;">auranova1606@gmail.com</a><br>
                          WhatsApp: <span style="color: #b89759;">950 482 596</span>
                        </p>
                      </td>
                      <td width="30%" align="right" valign="middle">
                         <img src="https://jfxbsnhzbkdawncdatwb.supabase.co/storage/v1/object/public/payment-evidence/mail/angeles.png" width="130" style="display: block; max-width: 130px; opacity: 0.9;" alt="" />
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
            </table>
            
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    const mailOptions = {
      from: '"Aura Nova" <' + process.env.SMTP_USER + '>',
      to: customer.email,
      subject: `Confirmación de Pedido ${order.orderCode} - Aura Nova`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Error sending email' }, { status: 500 });
  }
}
