require("dotenv").config();

const express = require("express");
const cors = require("cors");
const os = require("os");
const path = require("path");

require("./src/config/db"); // initialize the MySQL pool (logs connection status)

const registrationsRoutes = require("./src/routes/registrationsRoutes");
const programsRoutes = require("./src/routes/programsRoutes");
const authRoutes = require("./src/routes/authRoutes");
const contactRoutes = require("./src/routes/contactRoutes");
const brochureRoutes = require("./src/routes/brochureRoutes");
const newsletterRoutes = require("./src/routes/newsletterRoutes");
const companyProfileRoutes = require("./src/routes/companyProfileRoutes");
const accreditationRoutes = require("./src/routes/accreditationRoutes");
const statsRoutes = require("./src/routes/statsRoutes");
const parentSolutionsRoutes = require("./src/routes/parentSolutionsRoutes");
const childSolutionsRoutes = require("./src/routes/childSolutionsRoutes");
const solutionProgramsRoutes = require("./src/routes/solutionProgramsRoutes");
const publicSolutionsRoutes = require("./src/routes/publicSolutionsRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");
const blogRoutes = require("./src/routes/blogRoutes");
const publicBlogRoutes = require("./src/routes/publicBlogRoutes");
const { sendError } = require("./src/utils/http");

const app = express();

// Behind a proxy/load balancer, trust X-Forwarded-* so req.ip is the real client.
app.set("trust proxy", true);
app.disable("x-powered-by");

// --- CORS -------------------------------------------------------------------
// Restrict to configured website origins in production; allow all in dev when
// CORS_ORIGINS is empty.
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Non-browser clients (curl, server-to-server) send no Origin — allow them.
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0) return callback(null, true); // dev: allow all
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};
app.use(cors(corsOptions));

// --- Body parsing -----------------------------------------------------------
app.use(express.json({ limit: "32kb" }));

// Turn malformed JSON into a clean 400 instead of an unhandled error.
app.use((err, req, res, next) => {
  if (err && err.type === "entity.parse.failed") {
    return sendError(res, 400, "BAD_REQUEST", "Malformed JSON body");
  }
  if (err && err.type === "entity.too.large") {
    return sendError(res, 413, "PAYLOAD_TOO_LARGE", "Request body too large");
  }
  return next(err);
});

// --- AutoSSL / Let's Encrypt HTTP validation --------------------------------
// This Node app answers every path, so without this the ACME challenge would
// hit the 404 handler and AutoSSL could never issue a cert for the API domain.
// Serve the challenge files written into the docroot's .well-known folder.
app.use(
  "/.well-known",
  express.static(path.join(__dirname, ".well-known"), { dotfiles: "allow" })
);

// --- Static: uploaded assets (images/PDFs managed from the dashboard) --------
// Files live in <app-root>/uploads (created by the upload controller) and are
// served here so the public site can reference them by URL.
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: "7d",
    setHeaders: (res) => {
      // Defense in depth: never MIME-sniff an uploaded file, and neutralize any
      // <script> inside an uploaded SVG if it's opened directly as a document
      // (the `sandbox` directive blocks script execution). Icons loaded via <img>
      // are unaffected.
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox");
    },
  })
);

// --- Routes -----------------------------------------------------------------
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/apis/auth", authRoutes);
app.use("/apis/registrations", registrationsRoutes);
app.use("/apis/programs", programsRoutes);
app.use("/apis/contact", contactRoutes);
app.use("/apis/brochure-leads", brochureRoutes);
app.use("/apis/newsletter", newsletterRoutes);
app.use("/apis/public/company-profile", companyProfileRoutes.publicRouter);
app.use("/apis/admin/company-profile", companyProfileRoutes.adminRouter);
app.use("/apis/public/accreditation", accreditationRoutes.publicRouter);
app.use("/apis/admin/accreditation", accreditationRoutes.adminRouter);
app.use("/apis/stats", statsRoutes);

// Solutions & Programs content module
app.use("/apis/admin/parent-solutions", parentSolutionsRoutes);
app.use("/apis/admin/child-solutions", childSolutionsRoutes);
app.use("/apis/admin/programs", solutionProgramsRoutes);
app.use("/apis/public", publicSolutionsRoutes);
app.use("/apis/public/blogs", publicBlogRoutes);
app.use("/apis/admin/uploads", uploadRoutes);
app.use("/apis/admin/blogs", blogRoutes);

// 404 fallback
app.use((req, res) => sendError(res, 404, "NOT_FOUND", "Resource not found"));

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error("[unhandled]", err);
  if (err && err.message === "Not allowed by CORS") {
    return sendError(res, 403, "CORS_FORBIDDEN", "Origin not allowed");
  }
  return sendError(res, 500, "SERVER_ERROR", "Unexpected server error");
});

// --- Start ------------------------------------------------------------------
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const info of iface) {
      if (info.family === "IPv4" && !info.internal) return info.address;
    }
  }
  return "localhost";
}

app.listen(PORT, HOST, () => {
  console.log(`GATD registrations API running on http://${getLocalIP()}:${PORT}`);
});
