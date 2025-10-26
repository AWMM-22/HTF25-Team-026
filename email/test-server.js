
// This is the Node.js server that receives the request from your `UserDashboard.tsx` file and sends the email using your Gmail App Password.


// 1. Load dependencies
require('dotenv').config(); 
const express = require('express');
const cors = require('cors'); 
const nodemailer = require('nodemailer'); 

// 2. Get Credentials from environment (Loaded from .env file)
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS; 

const app = express();
const PORT = 3001; 

// 3. Initialize Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // Shortcut for Gmail SMTP settings
    auth: {
        user: GMAIL_USER, // Your full Gmail address
        pass: GMAIL_PASS, // Your 16-character App Password
    },
});

// Basic check (though already done in the caller, it's good practice)
if (!GMAIL_USER || !GMAIL_PASS) {
    console.error('FATAL: GMAIL credentials not set. Email service disabled.');
}

// 4. Use Middleware
// CORS is CRUCIAL to allow the React app (on its own port) to talk to this server.
app.use(cors()); 
app.use(express.json()); // Allows parsing of the JSON body sent from the frontend

// 5. Create the API Route
// This endpoint MUST match the URL in UserDashboard.tsx
app.post('/api/send-test-email', async (req, res) => {
  try {
    console.log('API Request received from frontend...');
    
    // Get the data sent from the UserDashboard.tsx component
    const { email, title, description } = req.body;

    // 5a. Validation & Configuration Check
    if (!email || !title || !description) {
      return res.status(400).json({ error: 'Missing required fields (email, title, or description).' });
    }
    if (!GMAIL_USER || !GMAIL_PASS) {
        return res.status(503).json({ error: 'Email service is offline. Check server configuration.' });
    }

    // 5b. Define mail options (The 'title' is the email subject, 'description' is the body)
    const mailOptions = {
        from: GMAIL_USER, 
        to: email, // The user's email address passed from the frontend
        subject: title,
        html: description,
    };
    
    // 5c. Send the email
    const info = await transporter.sendMail(mailOptions);

    // Send a success response back to the frontend (UserDashboard.tsx)
    console.log('Email sent successfully!', info.response);
    res.status(200).json({ success: true, message: `Email queued successfully.`, id: info.messageId });

  } catch (error) {
    console.error('EMAIL FAILED:', error);
    // Return a detailed error message to the frontend for debugging
    res.status(500).json({ success: false, error: `Email failed due to server error. Check terminal.` });
  }
});

// 6. Start the server
app.listen(PORT, () => {
  console.log(`Test email server running on http://localhost:${PORT}`);
});
