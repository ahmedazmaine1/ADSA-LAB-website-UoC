// server.js — LOCAL STATIC PREVIEW ONLY.
//
// The site is fully static: in production you just upload the public/ folder
// to any web host. This little server exists only so `npm run dev` can serve
// public/ over http for local testing (Crossref fetch + Blogger JSONP need a
// real origin). It is NOT deployed.

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`DANSA Lab — static preview at http://localhost:${PORT}`);
    console.log("Production is fully static — deploy the public/ folder.");
});
