import express from "express";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(".")); // serve current folder
app.use(express.json());

// Health check
app.get("/api/health", (_, res) => res.json({ ok: true }));

// Contact form endpoint
app.post("/api/contact", async(req, res) => {
    try {
        const { name, email, subject = "Website contact", message, to } = req.body;

        if (!name || !email || !message || !to) {
            return res.status(400).json({ ok: false, error: "Missing fields" });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
            from: "ADSA Lab Contact <onboarding@resend.dev>",
            to, // receiver → hidden input in form ("ahmed.alvee1@ucalgary.ca")
            subject,
            replyTo: email, // allows replying to sender directly
            text: `From: ${name} <${email}>\n\n${message}`,
            html: `
        <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p>${String(message).replace(/\n/g, "<br/>")}</p>
      `,
        });

        res.json({ ok: true, message: "Email sent successfully!" });
    } catch (err) {
        console.error("Email error:", err);
        res.status(500).json({ ok: false, error: "Email send failed" });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});