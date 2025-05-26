// server.js (main application file)
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const chatRouter = require('./controllers/chatController');
const petRouter = require('./controllers/pets');
const shelterRouter = require('./controllers/shelters');
const lostfoundPetRouter = require('./controllers/lostnfoundController');
const postRoutes = require('./controllers/post');
const commentRoutes = require('./controllers/commentController');
const scannerRoutes= require('./controllers/scanner');
const petDoctorRoutes = require('./controllers/petdoc');
const searchRoutes = require('./controllers/searchGlobal');
const nodemailer = require('nodemailer');

const app = express();
const path = require('path');
const axios = require('axios');
const veterinarianRoutes = require('./controllers/vet');
const multer = require("multer");
const fs = require('fs');  // Add this


// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.send('🐾 Pet Rescue API is running!');
});

// MongoDB Connection
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/chat', chatRouter);
app.use('/api/pet', petRouter);
app.use('/api/shelter', shelterRouter);
app.use('/api/lostfound', require('./controllers/lostnfoundController'));
app.use('/api/post', postRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/vet', veterinarianRoutes);
app.use('/', scannerRoutes);
app.use('/api', petDoctorRoutes);
app.use('/api', searchRoutes);

app.post('/api/send-email', async (req, res) => {
  const { name, email, address, subject, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'pawsafe123@gmail.com',       // Your Gmail
      pass: 'rbcx aggm ducs wsvh',         // App Password (not your Gmail password)
    },
  });

 const mailOptions = {
  from: '"Pet Adoption Team" <yourteamemail@gmail.com>',
  replyTo: email, // User’s email for reply
  to: 'pawsafe123@gmail.com', // Team email
  subject: subject || 'No Subject Provided',
  html: `
    <p>Hi Team,</p>
    <p>My name is <strong>${name}</strong>, and I would like to ask about the following:</p>
    <p><em>${subject || 'No subject provided'}</em></p>
    <p>You can reach me at: <a href="mailto:${email}">${email}</a></p>
    <p>Message:</p>
    <p>${message.replace(/\n/g, '<br>')}</p>
    <br>
    <p>Thanks and best regards,<br>${name}</p>
  `,
};


  try {
    await transporter.sendMail(mailOptions);
   res.status(200).json({ message: 'Email sent successfully' });
  }catch (error) {
  console.error('Nodemailer Error:', error);
  res.status(500).json({ error: 'Failed to send email', details: error.toString() });
}

});

// Static file serving - important for accessing uploaded images
app.use('/uploads', express.static('uploads'));
// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
 
