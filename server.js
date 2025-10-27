// server.js — DANSA Lab backend (Contact + Publications)

// ------------------ Imports ------------------
import express from "express";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

// If using Node <18, uncomment the next line:
// import fetch from "node-fetch";

// ------------------ Setup ------------------
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend
app.use(express.static(__dirname));

app.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// ------------------ Email setup ------------------
const transporter = nodemailer.createTransport({
    service: "Outlook365",
    auth: {
        user: process.env.OUTLOOK_USER,
        pass: process.env.OUTLOOK_PASS,
    },
});

// ------------------ Contact form endpoint ------------------
app.post("/api/contact", async(req, res) => {
    const { name, email, subject, message } = req.body;

    const mailOptions = {
        from: process.env.OUTLOOK_USER,
        to: "alhajj@ucalgary.ca",
        subject: subject || `New message from ${name}`,
        text: `From: ${name} <${email}>\n\n${message}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email successfully sent to alhajj@ucalgary.ca`);
        res.json({ ok: true, message: "Email sent successfully!" });
    } catch (err) {
        console.error("❌ Email send error:", err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

// ------------------ Publications Endpoints ------------------

// DBLP for Prof. Reda Alhajj
app.get("/api/pubs/dblp", async(req, res) => {
    const author = req.query.author || "Reda Alhajj";
    const url = `https://dblp.org/search/publ/api?q=author:${encodeURIComponent(
    author
  )}&format=json`;

    try {
        const response = await fetch(url);
        const json = await response.json();
        const hits = json.result ? .hits ? .hit || [];
        const pubs = hits.map((h) => ({
            title: h.info.title,
            authors: Array.isArray(h.info.authors ? .author) ?
                h.info.authors.author.map((a) => a.text).join(", ") :
                h.info.authors ? .author ? .text || "",
            year: h.info.year,
            url: h.info.url,
        }));
        res.json({ ok: true, pubs });
    } catch (err) {
        console.error("DBLP fetch error:", err);
        res.status(500).json({ ok: false, error: "Failed to load DBLP data" });
    }
});

// Placeholder Rokne publications
app.get("/api/pubs/rokne", (_req, res) => {
    res.json({
        ok: true,
        pubs: [{
                title: "Big Data Analytics in Complex Networks",
                authors: "Jon Rokne, Reda Alhajj",
                year: 2021,
                url: "https://scholar.google.com/",
            },
            {
                title: "Graph Mining and Network Science",
                authors: "Jon Rokne, Reda Alhajj",
                year: 2020,
                url: "https://scholar.google.com/",
            },
        ],
    });
});

// ------------------ Start server ------------------
app.listen(PORT, () => {
    console.log(`🚀 DANSA Lab backend running at http://127.0.0.1:${PORT}`);
});