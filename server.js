const express  = require("express");
const mongoose = require("mongoose");
const multer   = require("multer");
const path     = require("path");
const fs       = require("fs");

// Load local .env (git-ignored) — in production (Vercel) MONGO_URI comes from project env vars
try {
  const envFile = path.join(__dirname, ".env");
  if (fs.existsSync(envFile)) {
    fs.readFileSync(envFile, "utf8").split(/\r?\n/).forEach(line => {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    });
  }
} catch (e) {}

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) console.error("⚠️ MONGO_URI is not set");
const PORT = 3000;
const ADMIN_PASS = "adminpass";

const app = express();

const dbReady = mongoose.connect(MONGO_URI);
dbReady.then(() => console.log("✅ MongoDB connected")).catch(err => console.error("❌ MongoDB error:", err.message));

// serverless: make sure the DB is connected before any API call
app.use("/api", async (_req, res, next) => {
  try { await dbReady; next(); }
  catch (e) { res.status(500).json({ ok: false, error: "DB connect failed: " + e.message }); }
});
app.use("/uploads", async (_req, res, next) => {
  try { await dbReady; next(); }
  catch (e) { res.status(500).send("DB connect failed"); }
});

const webpush = require("web-push");
webpush.setVapidDetails(
  "mailto:ahmad@example.com",
  "BI4JV-0mUc-lylpBOXcwrfxDZPx74VKQ7pCF8TdwlDKz55LPvJMC75e7uK7nBrjbFxFRp42Lwf6RVuuL-s7xqzA",
  "ne_omXm2AZJ_XUryuNm6ESiZf4m9q8CgTNI17dtyDMc"
);

const Upload = mongoose.model("Upload", new mongoose.Schema({
  subject: String,
  folder:  String,
  name:    String,
  url:     String,
  time:    String,
}));

const PushSub = mongoose.model("PushSub", new mongoose.Schema({
  endpoint: { type: String, unique: true },
  keys: Object,
}));

const Deadline = mongoose.model("Deadline", new mongoose.Schema({
  subject:     { type: String, unique: true, index: true },
  code:        String,
  deadline:    String,
  currentDate: String,
  uploaded:    Boolean,
}));

const DEFAULT_DEADLINES = [
  { subject: "Visual Programming (Lab)",       code: "ADCS-III",     deadline: "2026-10-08", currentDate: "2026-10-04", uploaded: true  },
  { subject: "Visual Programming (Theory)",    code: "ADCS-III",     deadline: "2026-10-10", currentDate: "2026-10-04", uploaded: false },
  { subject: "Data-Structures(Lab.)",          code: "ADSCS-III-A",  deadline: "2026-10-03", currentDate: "2026-10-04", uploaded: false },
  { subject: "Calculus & Analytical Geometry", code: "ADSCS_3A",     deadline: "2026-10-12", currentDate: "2026-10-04", uploaded: true  },
  { subject: "Full Stack Web Development",     code: "ADSCS-III-A",  deadline: "2026-10-04", currentDate: "2026-10-04", uploaded: false },
  { subject: "CS-215L-Information Security",   code: "ADCS-III-A",   deadline: "2026-10-06", currentDate: "2026-10-04", uploaded: true  },
  { subject: "Theory Information Security",    code: "ADCS-III-A",   deadline: "2026-10-02", currentDate: "2026-10-04", uploaded: false },
  { subject: "DSA F-26",                       code: "ADCS 3rd A",   deadline: "2026-10-15", currentDate: "2026-10-04", uploaded: false },
  { subject: "CS-371 Software Engineering",    code: "ADCS III A",   deadline: "2026-10-09", currentDate: "2026-10-04", uploaded: true  },
];

async function seedDeadlines() {
  try {
    for (const d of DEFAULT_DEADLINES) {
      await Deadline.updateOne({ subject: d.subject }, { $setOnInsert: d }, { upsert: true });
    }
  } catch (e) { console.error("Seed failed:", e.message); }
}

// files are stored in MongoDB GridFS (free, works on Vercel serverless)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    /\.(pdf|doc|docx)$/i.test(file.originalname) ? cb(null, true) : cb(new Error("Only PDF/DOC/DOCX"));
  },
});

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-pass");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});
app.use(express.static(path.join(__dirname, "public")));

const isAdmin = (req) => req.get("x-admin-pass") === ADMIN_PASS;

app.get("/api/deadlines", async (_req, res) => {
  try { res.json(await Deadline.find().sort({ _id: 1 })); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.post("/api/deadlines", async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ ok: false, error: "Wrong admin password" });
  try {
    const rows = Array.isArray(req.body?.deadlines) ? req.body.deadlines : [];
    for (const row of rows) {
      const subject = String(row.subject || "").trim();
      if (!subject) continue;
      await Deadline.updateOne({ subject }, { $set: {
        subject, code: String(row.code || ""),
        deadline: String(row.deadline || ""),
        currentDate: String(row.currentDate || ""),
        uploaded: !!row.uploaded,
      } }, { upsert: true });
    }
    res.json({ ok: true, deadlines: await Deadline.find().sort({ _id: 1 }) });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, error: "No file received" });
    const subject = String(req.body.subject || "misc").slice(0, 80);
    const folder  = String(req.body.folder  || "General").slice(0, 80);
    const filename = Date.now() + "_" + path.basename(req.file.originalname).slice(0, 120);

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
    await new Promise((resolve, reject) => {
      const ws = bucket.openUploadStream(filename, { metadata: { subject, folder, contentType: req.file.mimetype } });
      ws.end(req.file.buffer);
      ws.on("finish", resolve);
      ws.on("error", reject);
    });

    const doc = await Upload.create({
      subject, folder,
      name: path.basename(req.file.originalname),
      url: `/uploads/${encodeURIComponent(filename)}`,
      time: new Date().toISOString(),
    });
    await Deadline.updateOne({ subject: req.body.subject }, { $set: { uploaded: true } }).catch(() => {});

    // push notification to every subscriber (works on mobile, like news alerts)
    try {
      const subs = await PushSub.find();
      const payload = JSON.stringify({
        title: "🔔 New Assignment Uploaded",
        body: `${doc.name} — ${subject} / ${folder}`,
        url: doc.url,
      });
      await Promise.all(subs.map(s =>
        webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, payload)
          .catch(async err => { if (err.statusCode === 410 || err.statusCode === 404) await PushSub.deleteOne({ endpoint: s.endpoint }); })
      ));
    } catch (e) { console.error("Push error:", e.message); }

    res.json({ ok: true, file: doc, savedTo: `${subject} / ${folder}` });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.get("/uploads/:filename", async (req, res) => {
  try {
    const files = await mongoose.connection.db.collection("uploads.files").find({ filename: req.params.filename }).toArray();
    if (!files.length) return res.status(404).send("Not found");
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
    res.setHeader("Content-Type", files[0].contentType || files[0].metadata?.contentType || "application/octet-stream");
    bucket.openDownloadStreamByName(req.params.filename).pipe(res);
  } catch (e) { res.status(500).send(e.message); }
});

app.post("/api/subscribe", async (req, res) => {
  try {
    const sub = req.body;
    if (!sub || !sub.endpoint) return res.status(400).json({ ok: false });
    await PushSub.updateOne({ endpoint: sub.endpoint }, { $set: { endpoint: sub.endpoint, keys: sub.keys } }, { upsert: true });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.get("/api/uploads", async (req, res) => {
  const q = {};
  if (req.query.subject) q.subject = String(req.query.subject);
  if (req.query.folder)  q.folder  = String(req.query.folder);
  res.json(await Upload.find(q).sort({ time: -1 }));
});

if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log(`🚀 Server running: http://localhost:${PORT}`);
    await seedDeadlines();
  });
} else {
  mongoose.connection.once("open", seedDeadlines);
}

module.exports = app;
