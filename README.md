# 🦅 ADCS Assignment Hub

> **Free assignment portal for ADCS-III-A students** — track assignment deadlines, open LAB folders, and download or contribute assignment files for every subject in one place.

**🌐 Live site: [https://adcs-assignment.vercel.app](https://adcs-assignment.vercel.app)**

---

## What is ADCS Assignment Hub?

**ADCS Assignment Hub** is a free web portal built for **ADCS-III-A** students to manage every **ADCS assignment** in one place. It replaces scattered WhatsApp messages and deadlinedocs with a single, fast, mobile-friendly website.

### Features

- 🗓️ **Assignment deadline tracker** — live table with deadline, current date, status (Open/Closed), days left, and upload status for every subject
- 📁 **LAB 1 – LAB 10 folders** for each subject with one-click browsing
- 📤 **Contribute uploads** — upload PDF/DOC/DOCX assignment files directly into the right subject and folder
- 🔔 **Push notifications** — every student gets a phone notification the moment a new assignment is uploaded (works even when the app is closed)
- 📬 **In-app notification bell** with unread badge, like Gmail
- 🔐 **Admin panel** — the admin can update deadlines and current dates, saved to the database
- 📱 **Installable PWA** — add to home screen and use it like a native app

### Subjects covered

| Code | Subject |
|------|---------|
| VPL | Visual Programming (Lab) |
| VPT | Visual Programming (Theory) |
| DSL | Data Structures (Lab) |
| CAG | Calculus & Analytical Geometry |
| FSWD | Full Stack Web Development |
| IS | CS-215L Information Security |
| TIS | Theory Information Security |
| DSA | DSA F-26 |
| SE | CS-371 Software Engineering |
| DL | ADCS Assignment Deadlines |

## Tech stack

- **Frontend:** HTML, CSS, vanilla JavaScript (separate files, no framework)
- **Backend:** Node.js + Express (serverless on Vercel)
- **Database:** MongoDB Atlas (free M0 tier) with Mongoose
- **File storage:** MongoDB GridFS (files live in the database, so uploads work on serverless)
- **Notifications:** Web Push API + Service Worker + VAPID keys (via `web-push`)
- **Deploy:** Vercel

## Local development

```bash
# 1. Clone
git clone https://github.com/Ahmad-952/adcs-assignment-hub.git
cd adcs-assignment-hub

# 2. Install dependencies
npm install

# 3. Create .env from the example and add your MongoDB Atlas connection string
cp .env.example .env

# 4. Run
node server.js
# → http://localhost:3000
```

## Project structure

```
├── api/
│   └── index.js          # Vercel serverless entry
├── public/
│   ├── index.html        # Main page + SEO structured data
│   ├── style.css         # Dark theme styling
│   ├── script.js         # App logic, deadlines, uploads, notifications
│   ├── sw.js             # Service worker (push notifications)
│   ├── manifest.json     # PWA manifest
│   ├── robots.txt        # Crawler rules
│   └── sitemap.xml       # Sitemap for Google
├── server.js             # Express app (deadlines + uploads APIs, GridFS)
├── vercel.json           # Vercel deployment config
└── package.json
```

## Environment variables

| Name | Where | Description |
|------|-------|-------------|
| `MONGO_URI` | Vercel project settings + local `.env` | MongoDB Atlas connection string |

> ⚠️ Never commit your `.env` file — it is git-ignored.

## License

MIT — free to use for academic purposes.

---

**ADCS Assignment Hub** · [Live site](https://adcs-assignment.vercel.app) · Free assignment portal for ADCS students
