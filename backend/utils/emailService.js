require('dotenv').config(); // Ensure environment variables are loaded
const nodemailer = require('nodemailer');

// Create a transporter for Gmail (using OAuth2 or App Password for better security)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME, // Your Gmail email
    pass: process.env.EMAIL_PASSWORD, // Your Gmail password or app password if using 2FA
  },
});

// Function to send adoption confirmation to adopter
const sendAdoptionConfirmation = async (adopterEmail, petName, shelterName) => {
  const mailOptions = {
    from: `"Pet Rescue Team" <${process.env.EMAIL_USERNAME}>`, // Sender's email
    to: adopterEmail, // Receiver's email (adopter's email)
    subject: `Your Adoption Request for ${petName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4E7D96;">Thank you for your adoption request!</h2>
        <p>We've received your request to adopt <strong>${petName}</strong> 
        
        <h3 style="color: #4E7D96;">What happens next?</h3>
        <ol>
          <li>The shelter will review your application</li>
          <li>They'll contact you within 3-5 business days</li>
          <li>Be prepared for a possible home visit or interview</li>
        </ol>
        
        <p>If you have any questions, please reply to this email.</p>
        
        <p style="margin-top: 30px; color: #777;">
          Warm regards,<br>
          The Pet Rescue Team
        </p>
      </div>
    `,
  };

  try {
    // Send email
    await transporter.sendMail(mailOptions);
    console.log('Adoption confirmation email sent to', adopterEmail);
  } catch (error) {
    console.error('Error sending adoption confirmation email:', error);
  }
};

// Function to notify shelter about new adoption request
const sendShelterNotification = async (shelterEmail, petName, adopterDetails) => {
  const mailOptions = {
    from: `"Pet Rescue Team" <${process.env.EMAIL_USERNAME}>`, // Sender's email
    to: shelterEmail, // Receiver's email (shelter's email)
    subject: `New Adoption Request for ${petName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4E7D96;">New Adoption Request!</h2>
        <p>You have a new adoption request for <strong>${petName}</strong>.</p>
        
        <h3 style="color: #4E7D96;">Adopter Information:</h3>
        <ul>
          <li><strong>Name:</strong> ${adopterDetails.name}</li>
          <li><strong>Email:</strong> ${adopterDetails.email}</li>
          <li><strong>Phone:</strong> ${adopterDetails.phone}</li>
          <li><strong>Reason for adoption:</strong> ${adopterDetails.reason || 'Not provided'}</li>
        </ul>
        
        <p style="margin-top: 20px;">
          <a href="${process.env.ADMIN_DASHBOARD_URL}" 
             style="background-color: #4E7D96; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
            View in Dashboard
          </a>
        </p>
        
        <p style="margin-top: 30px; color: #777;">
          Please respond to this request within 5 business days.<br>
          The Pet Rescue Team
        </p>
      </div>
    `,
  };

  try {
    // Send email to shelter
    await transporter.sendMail(mailOptions);
    console.log('Shelter notification email sent to', shelterEmail);
  } catch (error) {
    console.error('Error sending shelter notification email:', error);
  }
};

module.exports = {
  sendAdoptionConfirmation,
  sendShelterNotification,
};
