require("dotenv").config();

const express = require("express");
const sgMail = require("@sendgrid/mail");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(__dirname));

// Store subscribers during server runtime
const subscribers = [];

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Subscribe endpoint
app.post("/subscribe", async (req, res) => {
    try {
        const { email } = req.body;

        // Check if email is provided
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email address is required."
            });
        }

        
        

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        // Convert email to lowercase
        const normalisedEmail = email.toLowerCase();

        // Check for duplicate subscription
        if (subscribers.includes(normalisedEmail)) {
            return res.status(409).json({
                success: false,
                message: "This email is already subscribed."
            });
        }

        // Send welcome email
        const message = {
            to: normalisedEmail,
            from: process.env.SENDGRID_FROM_EMAIL,
            subject: "Welcome to DEV@Deakin!",
            text: "Welcome to DEV@Deakin! Thank you for subscribing to our newsletter. You will now receive updates, news and information from DEV@Deakin. Happy learning!"
        };

        const response = await sgMail.send(message);

        console.log("SendGrid Status Code:", response[0].statusCode);

        // Add subscriber after successful email
        subscribers.push(normalisedEmail);

        console.log("New subscriber:", normalisedEmail);
        console.log("Total subscribers:", subscribers.length);

        // Send success response
        return res.status(200).json({
            success: true,
            message: "Successfully subscribed! A welcome email has been sent."
        });

    } catch (error) {
        console.error("Email sending error:");

        if (error.response) {
            console.error(error.response.body);
        } else {
            console.error(error.message);
        }

        return res.status(500).json({
            success: false,
            message: "Subscription failed. Please try again later."
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log("Server running at http://localhost:" + PORT);
});