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
    <body style="margin: 0; padding: 0; background-color: #fdfaf6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #4a3933; -webkit-font-smoothing: antialiased;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fdfaf6; padding: 30px 0;">
        <tr>
          <td align="center">
            
            <table width="100%" max-width="500" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background: transparent; padding: 20px;">
              
              <!-- Elegant Header with Flower -->
              <tr>
                <td align="center" style="padding-bottom: 25px;">
                  <img src="https://jfxbsnhzbkdawncdatwb.supabase.co/storage/v1/object/public/payment-evidence/mail/flortallo.png" width="80" style="display: block; margin-bottom: 15px; opacity: 0.9;" alt="Flor Aura Nova" />
                  <h1 style="font-family: 'Georgia', 'Times New Roman', serif; font-size: 42px; font-weight: normal; color: #c8a96b; font-style: italic; margin: 0; letter-spacing: 2px;">Aura Nova</h1>
                  <p style="font-size: 11px; color: #d38b8b; text-transform: uppercase; letter-spacing: 4px; margin-top: 10px; margin-bottom: 0;">Detalles con cariño</p>
                </td>
              </tr>
              
              <!-- Letter Greeting -->
              <tr>
                <td style="padding: 20px 0; border-top: 1px solid #e8dcdc;">
                  <p style="font-family: 'Georgia', 'Times New Roman', serif; font-size: 26px; color: #4a3933; font-style: italic; margin: 0 0 15px 0; text-align: center;">
                    ¡Gracias por tu pedido, ${customer.name}!
                  </p>
                  <p style="font-size: 15px; line-height: 1.8; color: #887870; text-align: center; margin: 0 0 25px 0;">
                    Hemos recibido tu solicitud y estamos muy felices de preparar este detalle especial para ti. Cada arreglo es elaborado con suma dedicación y magia.
                  </p>
                </td>
              </tr>

              <!-- Order Info (Minimalist) -->
              <tr>
                <td style="padding: 25px 0; border-top: 1px dashed #d38b8b; border-bottom: 1px dashed #d38b8b;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td width="50%" align="center">
                        <p style="margin: 0 0 5px 0; font-size: 10px; color: #887870; text-transform: uppercase; letter-spacing: 2px;">Pedido</p>
                        <p style="margin: 0; font-family: 'Georgia', serif; font-size: 20px; color: #4a3933;">${order.orderCode}</p>
                      </td>
                      <td width="50%" align="center">
                        <p style="margin: 0 0 5px 0; font-size: 10px; color: #887870; text-transform: uppercase; letter-spacing: 2px;">Token de rastreo</p>
                        <p style="margin: 0; font-family: monospace; font-size: 18px; color: #c8a96b; letter-spacing: 2px;">${token}</p>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 20px 0 0 0; font-size: 13px; color: #887870; text-align: center; font-style: italic;">
                    Utiliza el token en nuestra web para rastrear el progreso de tu pedido.
                  </p>
                </td>
              </tr>

              <!-- Receipt Details or Quote Received Message -->
              <tr>
                <td style="padding: 30px 0 10px 0;">
                  ${emailType === 'quote_received' ? `
                    <div style="background-color: #fdf5f5; padding: 25px; border-radius: 16px; border: 1px solid rgba(211,139,139,0.2); text-align: center;">
                      <h3 style="font-family: 'Georgia', 'Times New Roman', serif; font-size: 20px; color: #c8a96b; font-weight: normal; font-style: italic; margin: 0 0 15px 0;">
                        ¡Recibimos tu solicitud de personalización!
                      </h3>
                      <p style="font-size: 14px; color: #887870; line-height: 1.6; margin: 0;">
                        Nuestro equipo revisará los detalles de tu pedido personalizado y calculará el monto total. Nos pondremos en contacto contigo a través de WhatsApp para confirmar el monto y enviarte tu comprobante de pago final.
                      </p>
                    </div>
                  ` : `
                    <h3 style="font-family: 'Georgia', 'Times New Roman', serif; font-size: 20px; color: #c8a96b; font-weight: normal; font-style: italic; text-align: center; margin: 0 0 25px 0;">
                      Comprobante de Pago
                    </h3>
                    
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px;">
                      ${items && items.length > 0 ? itemsHtml : `
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px dotted #e8dcdc; color: #4a3933;">
                          <strong>1x</strong> Pedido Personalizado
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px dotted #e8dcdc; text-align: right; color: #887870;">
                          ${formatCurrency(subtotal || 0)}
                        </td>
                      </tr>
                      `}
                      ${items && items.length > 0 ? `
                      <tr>
                        <td style="padding: 20px 0 10px 0; color: #887870;">Subtotal</td>
                        <td style="padding: 20px 0 10px 0; text-align: right; color: #4a3933;">${formatCurrency(subtotal)}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 5px 0 20px 0; color: #887870; border-bottom: 1px solid #e8dcdc;">Modalidad: <span style="color: #c8a96b; font-style: italic;">${deliveryType === 0 || deliveryType === 'Delivery' ? 'Delivery' : deliveryType === 1 || deliveryType === 'MeetingPoint' ? 'Punto de Encuentro' : 'Envío Nacional'}</span></td>
                        <td style="padding: 5px 0 20px 0; text-align: right; color: #4a3933; border-bottom: 1px solid #e8dcdc;">${estimatedDeliveryCost !== undefined && estimatedDeliveryCost !== null ? formatCurrency(estimatedDeliveryCost) : '0.00'}</td>
                      </tr>
                    </table>
                    
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
                      <tr>
                        <td align="right">
                          <span style="font-size: 11px; color: #887870; text-transform: uppercase; letter-spacing: 2px; margin-right: 15px;">Total a Pagar</span>
                          <span style="font-size: 28px; color: #4a3933; font-family: 'Georgia', serif; font-style: italic;">
                            ${formatCurrency((subtotal || 0) + (estimatedDeliveryCost || 0))}
                          </span>
                        </td>
                      </tr>
                    </table>
                  `}
                </td>
              </tr>
              
              <!-- Footer with Big Aesthetic Images -->
              <tr>
                <td align="center" style="padding-top: 50px;">
                  <!-- Roman Aesthetic Framing -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td width="30%" align="left" valign="middle">
                         <img src="https://jfxbsnhzbkdawncdatwb.supabase.co/storage/v1/object/public/payment-evidence/mail/muroromano.png" width="70" style="display: block; max-width: 70px; opacity: 0.85;" alt="" />
                      </td>
                      <td width="40%" align="center" valign="middle">
                        <p style="font-family: 'Georgia', 'Times New Roman', serif; font-size: 18px; color: #d38b8b; font-style: italic; margin: 0 0 10px 0;">
                          Hecho en Huancayo<br>con amor
                        </p>
                        <p style="font-size: 11px; color: #887870; line-height: 1.6; margin: 0;">
                          <a href="mailto:auranova1606@gmail.com" style="color: #c8a96b; text-decoration: none;">auranova1606@gmail.com</a><br>
                          WhatsApp: <span style="color: #c8a96b;">950 482 596</span>
                        </p>
                      </td>
                      <td width="30%" align="right" valign="middle">
                         <img src="https://jfxbsnhzbkdawncdatwb.supabase.co/storage/v1/object/public/payment-evidence/mail/angeles.png" width="130" style="display: block; max-width: 130px; opacity: 0.85;" alt="" />
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
