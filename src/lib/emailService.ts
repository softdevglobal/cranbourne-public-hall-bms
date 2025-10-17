import nodemailer from 'nodemailer';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure nodemailer with Gmail SMTP
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'dpawan434741@gmail.com',
        pass: 'tmoltlllrsvpflkm', // App-specific password
      },
    });
  }

  async sendBookingNotificationToHallOwner(bookingData: {
    bookingId: string;
    bookingCode?: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    eventType: string;
    hallName: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    guestCount: number | null;
    calculatedPrice: number;
    hallOwnerEmail: string;
  }) {
    const {
      bookingId,
      customerName,
      customerEmail,
      customerPhone,
      eventType,
      hallName,
      bookingDate,
      startTime,
      endTime,
      guestCount,
      calculatedPrice,
      hallOwnerEmail,
    } = bookingData;

    const subject = `New Booking Request - ${customerName}`;
    const html = this.generateHallOwnerEmailHTML(bookingData);

    const mailOptions = {
      from: 'dpawan434741@gmail.com',
      to: hallOwnerEmail,
      subject: subject,
      html: html,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Hall owner notification email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('❌ Failed to send hall owner email:', error);
      throw error;
    }
  }

  async sendBookingConfirmationToCustomer(bookingData: {
    bookingId: string;
    bookingCode?: string;
    customerName: string;
    customerEmail: string;
    eventType: string;
    hallName: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    guestCount: number | null;
    calculatedPrice: number;
  }) {
    const {
      bookingId,
      customerName,
      customerEmail,
      eventType,
      hallName,
      bookingDate,
      startTime,
      endTime,
      guestCount,
      calculatedPrice,
    } = bookingData;

    const subject = `Booking Request Received - ${eventType} at ${hallName}`;
    const html = this.generateCustomerEmailHTML(bookingData);

    const mailOptions = {
      from: 'dpawan434741@gmail.com',
      to: customerEmail,
      subject: subject,
      html: html,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Customer confirmation email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('❌ Failed to send customer email:', error);
      throw error;
    }
  }

  private generateHallOwnerEmailHTML(bookingData: {
    bookingId: string;
    bookingCode?: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    eventType: string;
    hallName: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    guestCount: number | null;
    calculatedPrice: number;
  }) {
    const {
      bookingId,
      bookingCode,
      customerName,
      customerEmail,
      customerPhone,
      eventType,
      hallName,
      bookingDate,
      startTime,
      endTime,
      guestCount,
      calculatedPrice,
    } = bookingData;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking Request</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">🎉 New Booking Request</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">New Booking from ${customerName}</h2>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e293b; margin: 0 0 15px 0;">Customer Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Name:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Email:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${customerEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Phone:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${customerPhone}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e293b; margin: 0 0 15px 0;">Booking Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Booking ID:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${bookingId}</td>
                </tr>
                ${bookingCode ? `
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Booking Code:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${bookingCode}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Event Type:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${eventType}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Venue:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${hallName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Date:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${bookingDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Time:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${startTime} - ${endTime}</td>
                </tr>
                ${guestCount ? `
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Guest Count:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${guestCount} guests</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Estimated Price:</td>
                  <td style="padding: 8px 0; color: #059669; font-weight: bold; font-size: 18px;">$${calculatedPrice.toFixed(2)} <span style="font-size: 12px; font-weight: 500; color: #64748b;">+ taxes</span></td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                ⚠️ Please review this booking request and respond to the customer at your earliest convenience.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #64748b; margin-bottom: 20px;">Log in to your admin dashboard to manage this booking.</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              Cranbourne Public Hall Management System
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateCustomerEmailHTML(bookingData: {
    bookingId: string;
    bookingCode?: string;
    customerName: string;
    eventType: string;
    hallName: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    guestCount: number | null;
    calculatedPrice: number;
  }) {
    const {
      bookingId,
      bookingCode,
      customerName,
      eventType,
      hallName,
      bookingDate,
      startTime,
      endTime,
      guestCount,
      calculatedPrice,
    } = bookingData;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Request Received</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Cranbourne Public Hall</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 28px; font-weight: 700;">Thank You for Your Booking Request!</h2>
            
            <div style="color: #475569; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              Dear ${customerName},
            </div>
            
            <div style="color: #475569; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              We've received your booking request for <strong>${eventType}</strong> at <strong>${hallName}</strong>. 
              Our team will review your request and get back to you within 24 hours.
            </div>
            
            <div style="background-color: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #0c4a6e; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px;">
                📋 Your Booking Details
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${bookingCode ? `
                <tr style="background-color: #fef3c7; border: 2px solid #f59e0b;">
                  <td style="padding: 15px 12px; color: #92400e; font-weight: bold; font-size: 18px;">🎫 Booking Reference:</td>
                  <td style="padding: 15px 12px; color: #92400e; font-weight: bold; font-size: 18px; font-family: monospace; text-align: right;">${bookingCode}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 12px 8px; color: #64748b; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Event Type:</td>
                  <td style="padding: 12px 8px; color: #1e293b; border-bottom: 1px solid #e2e8f0; text-align: right;">${eventType}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 8px; color: #64748b; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Venue:</td>
                  <td style="padding: 12px 8px; color: #1e293b; border-bottom: 1px solid #e2e8f0; text-align: right;">${hallName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 8px; color: #64748b; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Date:</td>
                  <td style="padding: 12px 8px; color: #1e293b; border-bottom: 1px solid #e2e8f0; text-align: right;">${bookingDate}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 8px; color: #64748b; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Time:</td>
                  <td style="padding: 12px 8px; color: #1e293b; border-bottom: 1px solid #e2e8f0; text-align: right;">${startTime} - ${endTime}</td>
                </tr>
                ${guestCount ? `
                <tr>
                  <td style="padding: 12px 8px; color: #64748b; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Guest Count:</td>
                  <td style="padding: 12px 8px; color: #1e293b; border-bottom: 1px solid #e2e8f0; text-align: right;">${guestCount} guests</td>
                </tr>
                ` : ''}
                <tr style="background-color: #dcfce7; border-top: 2px solid #22c55e;">
                  <td style="padding: 15px 12px; color: #166534; font-weight: bold; font-size: 18px;">💰 Estimated Price:</td>
                  <td style="padding: 15px 12px; color: #166534; font-weight: bold; font-size: 18px; text-align: right;">$${calculatedPrice.toFixed(2)} <span style="font-size: 12px; font-weight: 600; color: #64748b;">+ taxes</span></td>
                </tr>
              </table>
              <div style="margin-top: 15px; padding: 12px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  ℹ️ This is an estimated price. Final invoice will be sent once the booking is confirmed.
                </p>
              </div>
            </div>
            
            <div style="background-color: #dcfce7; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #15803d; margin: 0 0 15px 0;">What Happens Next?</h3>
              <ul style="color: #15803d; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>Our team will review your booking request</li>
                <li>You'll receive a confirmation email within 24 hours</li>
                <li>If approved, we'll send you payment instructions</li>
                <li>Keep this email for your records</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #64748b; margin-bottom: 20px;">If you have any questions, please don't hesitate to contact us.</p>
              <a href="mailto:cranbournepublichall@gmail.com" 
                 style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Contact Us
              </a>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; margin-top: 40px; padding-top: 30px; text-align: center;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                Thank you for choosing Cranbourne Public Hall!
              </p>
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                We look forward to hosting your event.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 10px 0;">
              Cranbourne Public Hall
            </p>
            <p style="color: #64748b; font-size: 12px; margin: 0 0 10px 0;">
              Cnr Clarendon High Streets, VIC, Australia
            </p>
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              (61) 400 908 740 | cranbournepublichall@gmail.com
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();

