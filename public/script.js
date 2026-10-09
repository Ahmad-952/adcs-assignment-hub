/* ─── DATA ─── */
const ADMIN_PASS = "adminpass";

let subjects = [
  { name:"Visual Programming (Lab)",      code:"ADCS-III",    deadline:"2026-10-08", currentDate:"2026-10-04", uploaded:true  },
  { name:"Visual Programming (Theory)",   code:"ADCS-III",    deadline:"2026-10-10", currentDate:"2026-10-04", uploaded:false },
  { name:"Data-Structures(Lab.)",         code:"ADSCS-III-A", deadline:"2026-10-03", currentDate:"2026-10-04", uploaded:false },
  { name:"Calculus & Analytical Geometry",code:"ADSCS_3A",    deadline:"2026-10-12", currentDate:"2026-10-04", uploaded:true  },
  { name:"Full Stack Web Development",    code:"ADSCS-III-A", deadline:"2026-10-04", currentDate:"2026-10-04", uploaded:false },
  { name:"CS-215L-Information Security",  code:"ADCS-III-A",  deadline:"2026-10-06", currentDate:"2026-10-04", uploaded:true  },
  { name:"Theory Information Security",   code:"ADCS-III-A",  deadline:"2026-10-02", currentDate:"2026-10-04", uploaded:false },
  { name:"DSA F-26",                     code:"ADCS 3rd A",  deadline:"2026-10-15", currentDate:"2026-10-04", uploaded:false },
  { name:"CS-371 Software Engineering",   code:"ADCS III A",  deadline:"2026-10-09", currentDate:"2026-10-04", uploaded:true  },
];

let adminUnlocked = false;

/* ─── HELPERS ─── */
function parseDate(s) { const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d); }
function diffDays(dl,cd) { return Math.round((parseDate(dl)-parseDate(cd))/86400000); }
function formatDate(s) { return parseDate(s).toLocaleDateString("en-US",{day:"numeric",month:"short",year:"numeric"}); }
function getStatus(sub) {
  const d = diffDays(sub.deadline, sub.currentDate);
  return d < 0 ? "closed" : d === 0 ? "today" : "open";
}

/* ─── PAGE NAV ─── */
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}
function goHome()           { showPage("homePage"); }
function showDeadlinePage() { renderDeadlineTable(); showPage("deadlinePage"); }

/* ─── RENDER TABLE ─── */
function renderDeadlineTable() {
  const tbody = document.getElementById("deadlineTableBody");
  tbody.innerHTML = "";
  let open=0, closed=0, today=0;

  subjects.forEach((sub, i) => {
    const status = getStatus(sub);
    const diff   = diffDays(sub.deadline, sub.currentDate);
    if (status==="open")   open++;
    if (status==="closed") closed++;
    if (status==="today")  today++;

    const totalWindow = 30;
    const pct = status==="closed"||status==="today" ? 100
              : Math.min(100, Math.round(((totalWindow-diff)/totalWindow)*100));
    const barColor = status==="closed" ? "var(--red)"
                   : status==="today"  ? "var(--amber)"
                   : diff<=5           ? "var(--amber)" : "var(--green)";

    const statusHtml =
      status==="open"   ? `<span class="status-badge status-open">● Open</span>`
    : status==="today"  ? `<span class="status-badge status-today">● Due Today</span>`
    :                     `<span class="status-badge status-closed">● Closed</span>`;

    const daysHtml =
      status==="closed" ? `<span style="color:var(--red);font-family:'DM Mono',monospace;font-size:13px;">Expired</span>`
    : status==="today"  ? `<span style="color:var(--amber);font-family:'DM Mono',monospace;font-size:13px;">Last Day!</span>`
    : `<div class="days-left"><span class="num">${diff}</span> days
         <div class="progress-bar-track">
           <div class="progress-bar-fill" style="width:${pct}%;background:${barColor}"></div>
         </div>
       </div>`;

    const uploadHtml = sub.uploaded
      ? `<span class="upload-badge upload-yes">✓ Yes</span>`
      : `<span class="upload-badge upload-notyet">⏳ Not Yet</span>`;

    const tr = document.createElement("tr");
    tr.style.animationDelay = `${i*0.06}s`;
    tr.innerHTML = `
      <td>
        <div class="subject-name">${sub.name}</div>
        <div class="subject-code">${sub.code}</div>
      </td>
      <td><span class="date-chip">${formatDate(sub.deadline)}</span></td>
      <td><span class="date-chip today">${formatDate(sub.currentDate)}</span></td>
      <td>${statusHtml}</td>
      <td>${daysHtml}</td>
      <td>${uploadHtml}</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("statsRow").innerHTML = `
    <div class="stat-card"><div class="num" style="color:var(--green)">${open}</div><div class="lbl">OPEN</div></div>
    <div class="stat-card"><div class="num" style="color:var(--red)">${closed}</div><div class="lbl">CLOSED</div></div>
    <div class="stat-card"><div class="num" style="color:var(--amber)">${today}</div><div class="lbl">DUE TODAY</div></div>
    <div class="stat-card"><div class="num">${subjects.length}</div><div class="lbl">TOTAL</div></div>
  `;
}

/* ─── ADMIN AUTH ─── */
function openAuthOverlay() {
  if (adminUnlocked) { openEditPanel(); return; }
  document.getElementById("adminPassInput").value = "";
  document.getElementById("authMsg").textContent  = "";
  document.getElementById("authOverlay").classList.add("show");
  setTimeout(() => document.getElementById("adminPassInput").focus(), 200);
}
function closeAuthOverlay() { document.getElementById("authOverlay").classList.remove("show"); }
function confirmAuth() {
  const val = document.getElementById("adminPassInput").value.trim();
  if (val === ADMIN_PASS) {
    adminUnlocked = true;
    closeAuthOverlay();
    openEditPanel();
  } else {
    document.getElementById("authMsg").textContent = "❌ Wrong password. Try again.";
    document.getElementById("adminPassInput").value = "";
    document.getElementById("adminPassInput").focus();
  }
}

/* ─── EDIT PANEL ─── */
function openEditPanel() {
  const area = document.getElementById("adminHeaderArea");
  area.innerHTML = `
    <span class="admin-badge">🔓 ADMIN MODE</span>
    <button class="logout-admin" onclick="logoutAdmin()">🔒 Lock</button>
  `;
  const grid = document.getElementById("editGrid");
  grid.innerHTML = "";
  subjects.forEach((sub, i) => {
    grid.innerHTML += `
      <div class="edit-field">
        <label>${sub.name} — Deadline</label>
        <input type="date" id="edit_deadline_${i}" value="${sub.deadline}" />
      </div>
      <div class="edit-field">
        <label>${sub.name} — Current Date</label>
        <input type="date" id="edit_current_${i}" value="${sub.currentDate}" />
      </div>
      <div class="edit-field">
        <label>${sub.name} — Uploaded?</label>
        <select id="edit_upload_${i}">
          <option value="yes" ${sub.uploaded ? "selected" : ""}>Yes</option>
          <option value="no"  ${!sub.uploaded ? "selected" : ""}>Not Yet</option>
        </select>
      </div>
    `;
  });
  document.getElementById("editPanel").style.display = "block";
  document.getElementById("editPanel").scrollIntoView({ behavior:"smooth", block:"start" });
}
function closeEditPanel() { document.getElementById("editPanel").style.display = "none"; }
function saveEdits() {
  subjects.forEach((sub, i) => {
    const dl  = document.getElementById(`edit_deadline_${i}`).value;
    const cd  = document.getElementById(`edit_current_${i}`).value;
    const up  = document.getElementById(`edit_upload_${i}`).value;
    if (dl) sub.deadline    = dl;
    if (cd) sub.currentDate = cd;
    sub.uploaded = (up === "yes");
  });
  closeEditPanel();
  renderDeadlineTable();
  // persist to MongoDB (server checks x-admin-pass)
  fetch(`${API_BASE}/api/deadlines`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-pass": ADMIN_PASS },
    body: JSON.stringify({ deadlines: subjects.map(s => ({ subject: s.name, code: s.code, deadline: s.deadline, currentDate: s.currentDate, uploaded: s.uploaded })) }),
  })
    .then(r => r.json())
    .then(d => { if (d.ok) { const b = document.querySelector(".save-btn"); b.textContent = "✅ Saved to DB!"; setTimeout(() => b.textContent = "💾 Save Changes", 1600); } })
    .catch(() => alert("Could not save to database — is the server running?"));
  const btn = document.querySelector(".save-btn");
  const orig = btn.textContent;
  btn.textContent = "✅ Saved!";
  setTimeout(() => btn.textContent = orig, 1600);
}
function logoutAdmin() {
  adminUnlocked = false;
  closeEditPanel();
  document.getElementById("adminHeaderArea").innerHTML =
    `<button class="admin-update-btn" onclick="openAuthOverlay()">🔐 Update ADMIN</button>`;
}

/* ─── MongoDB BACKEND (Node server) ─── */
const API_BASE = "";  // same origin on Vercel / local server

/* Load deadlines from MongoDB on page load (fall back to defaults if server is down) */
fetch(`${API_BASE}/api/deadlines`)
  .then(r => r.json())
  .then(rows => {
    if (Array.isArray(rows) && rows.length) {
      subjects = rows.map(r => ({ name: r.subject || r.name, code: r.code, deadline: r.deadline, currentDate: r.currentDate, uploaded: !!r.uploaded }));
      const dlPage = document.getElementById("deadlinePage");
      if (dlPage.classList.contains("active")) renderDeadlineTable();
    }
  })
  .catch(() => {});

/* ─── ASSIGNMENT FOLDERS (LAB 1 .. LAB 10 for every subject) ─── */
const folderDatabase = {};
document.querySelectorAll(".card[data-subject]").forEach(c => {
  if (c.dataset.subject !== "DEADLINE") {
    folderDatabase[c.dataset.subject] = [];
    for (let i = 1; i <= 10; i++) {
      folderDatabase[c.dataset.subject].push({ name: `LAB ${i}`, url: "" });
    }
  }
});

function openModal(subject) {
  const folders = folderDatabase[subject] || [];
  document.getElementById("modalTitle").textContent = subject + " — Assignments";
  document.querySelector("#modalBackdrop .muted").textContent = "Select a folder to open";
  const list = document.getElementById("pdfList");
  list.innerHTML = "";
  folders.forEach(f => {
    const item = document.createElement("div");
    item.className = "pdf-item";
    item.innerHTML = `
      <svg width="52" height="42" viewBox="0 0 56 46" fill="none">
        <path d="M2 10a4 4 0 0 1 4-4h14l6 7h24a4 4 0 0 1 4 4v21a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V10z" fill="#f5c04e"/>
        <path d="M2 17h52v21a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V17z" fill="#ffd97a"/>
      </svg>
      <div class="pdf-meta">${f.name}</div>
      <div class="pdf-sub">Folder</div>
    `;
    item.addEventListener("click", () => openFolder(subject, f.name));
    list.appendChild(item);
  });
  document.getElementById("modalBackdrop").classList.add("show");
  document.getElementById("contribTitle").style.display = "none";
  document.getElementById("contribList").innerHTML = "";
}

/* ─── FOLDER VIEW (files inside one LAB folder) ─── */
let currentUpload = { subject: "", folder: "" };

async function openFolder(subject, folder) {
  currentUpload = { subject, folder };
  const title = document.getElementById("contribTitle");
  title.style.display = "block";
  title.textContent = `📁 ${folder} — ${subject}`;
  // mobile: auto-scroll down to the assignment list
  setTimeout(() => title.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  const box = document.getElementById("contribList");
  box.innerHTML = `<p style="color:var(--muted);font-size:13px;">Loading...</p>`;
  try {
    const res = await fetch(`${API_BASE}/api/uploads?subject=${encodeURIComponent(subject)}&folder=${encodeURIComponent(folder)}`);
    const list = await res.json();
    box.innerHTML = "";
    // plus tile — contribute into THIS folder
    const plus = document.createElement("div");
    plus.className = "pdf-item";
    plus.style.border = "1px dashed rgba(74,222,128,0.5)";
    plus.innerHTML = `<div style="font-size:34px;line-height:1;">➕</div>
      <div class="pdf-meta">Contribute</div><div class="pdf-sub">Upload to ${folder}</div>`;
    plus.addEventListener("click", () => openUploadOverlay(subject, folder));
    box.appendChild(plus);

    if (!list.length) {
      const p = document.createElement("p");
      p.style.cssText = "color:var(--muted);font-size:13px;grid-column:1/-1;";
      p.textContent = "No files uploaded yet — be the first!";
      box.appendChild(p);
      return;
    }
    list.forEach(d => {
      const item = document.createElement("div");
      item.className = "pdf-item";
      item.innerHTML = `<div class="pdf-meta">📄 ${d.name}</div>
        <a class="open-btn" href="${API_BASE}${d.url}" target="_blank" rel="noopener,noreferrer" style="text-decoration:none;">Open</a>`;
      box.appendChild(item);
    });
  } catch (err) {
    box.innerHTML = `<p style="color:var(--red);font-size:13px;">Cannot reach server. Start it with: node server.js</p>`;
  }
}

/* ─── CONTRIBUTIONS ─── */
function openUploadOverlay(subject, folder) {
  currentUpload = { subject, folder };
  document.getElementById("uploadTarget").textContent = `${subject}  /  ${folder}`;
  document.getElementById("uploadMsg").textContent = "";
  document.getElementById("uploadFile").value = "";
  document.getElementById("uploadOverlay").classList.add("show");
}
function closeUploadOverlay() { document.getElementById("uploadOverlay").classList.remove("show"); }

async function doUpload() {
  const msg = document.getElementById("uploadMsg");
  const { subject, folder } = currentUpload;
  const file = document.getElementById("uploadFile").files[0];
  if (!file) { msg.style.color = "#ef4444"; msg.textContent = "Choose a file first."; return; }
  if (!/\.(pdf|doc|docx)$/i.test(file.name)) { msg.style.color = "#ef4444"; msg.textContent = "Only PDF/DOC/DOCX allowed."; return; }
  msg.style.color = "#93c5fd"; msg.textContent = "Uploading...";
  try {
    const form = new FormData();
    form.append("subject", subject);
    form.append("folder", folder);
    form.append("file", file);
    const res = await fetch(`${API_BASE}/api/upload`, { method: "POST", body: form });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Upload failed");
    msg.style.color = "#22c55e"; msg.textContent = `✅ Saved to ${data.savedTo || folder}`;
    setTimeout(() => { closeUploadOverlay(); openFolder(subject, folder); }, 1200);
  } catch (err) {
    msg.style.color = "#ef4444"; msg.textContent = "❌ " + err.message + " (is the server running?)";
  }
}

function closeModal() { document.getElementById("modalBackdrop").classList.remove("show"); }

document.querySelectorAll(".card[data-subject]").forEach(card => {
  const btn = card.querySelector("[data-action='open']");
  if (btn) btn.addEventListener("click", () => openModal(card.dataset.subject));
});
document.getElementById("modalBackdrop").addEventListener("click", e => {
  if (e.target === document.getElementById("modalBackdrop")) closeModal();
});
document.addEventListener("keydown", e => { if(e.key==="Escape") { closeModal(); closeAuthOverlay(); closeUploadOverlay(); } });

/* ─── NOTIFICATIONS (new assignment uploaded) ─── */
function showToast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._hide);
  t._hide = setTimeout(() => t.classList.remove("show"), 6000);
}

function askNotificationPermission() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") Notification.requestPermission();
}
document.addEventListener("click", askNotificationPermission, { once: true });
window.addEventListener("load", () => setTimeout(askNotificationPermission, 1500));

/* ─── PUSH SUBSCRIPTION (real notifications on mobile, even closed) ─── */
const VAPID_PUBLIC_KEY = "BI4JV-0mUc-lylpBOXcwrfxDZPx74VKQ7pCF8TdwlDKz55LPvJMC75e7uK7nBrjbFxFRp42Lwf6RVuuL-s7xqzA";
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}
async function subscribePush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    if (Notification.permission !== "granted") return;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }
    await fetch(`${API_BASE}/api/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub),
    });
  } catch (e) { console.error("Push subscribe failed:", e); }
}
window.addEventListener("load", () => setTimeout(async () => {
  askNotificationPermission();
  // re-check permission after user possibly granted it
  setTimeout(subscribePush, 4000);
}, 1500));
document.addEventListener("click", () => setTimeout(subscribePush, 1000), { once: true });

function notifyAll(newest) {
  const title = "🔔 New Assignment Uploaded";
  const body  = `${newest.name} — ${newest.subject} / ${newest.folder}`;
  showToast(`🔔 New assignment: ${newest.name} — ${newest.subject} / ${newest.folder}`);
  // Gmail-style inbox notification
  try {
    const list = JSON.parse(localStorage.getItem("adcsNotifs") || "[]");
    list.unshift({ title: newest.name, body, time: newest.time });
    localStorage.setItem("adcsNotifs", JSON.stringify(list.slice(0, 20)));
    renderNotifPanel();
  } catch (e) {}
  if ("Notification" in window && Notification.permission === "granted") {
    try { new Notification(title, { body }); } catch (e) {}
  }
}

/* Gmail-style notification bell */
function renderNotifPanel() {
  const list = JSON.parse(localStorage.getItem("adcsNotifs") || "[]");
  const lastSeen = localStorage.getItem("adcsNotifSeen") || "";
  const unread = list.filter(n => n.time > lastSeen).length;
  const badge = document.getElementById("notifBadge");
  badge.style.display = unread ? "inline-block" : "none";
  badge.textContent = unread;
  document.getElementById("notifList").innerHTML = list.length
    ? list.map(n => `<div class="notif-item"><b>📄 ${n.title}</b><span>${n.body} · ${new Date(n.time).toLocaleString()}</span></div>`).join("")
    : `<p style="color:var(--muted);font-size:13px;">No notifications yet.</p>`;
}
document.getElementById("notifBell").addEventListener("click", (e) => {
  e.stopPropagation();
  document.getElementById("notifPanel").classList.toggle("show");
  const list = JSON.parse(localStorage.getItem("adcsNotifs") || "[]");
  if (list.length) localStorage.setItem("adcsNotifSeen", list[0].time);
  renderNotifPanel();
});
document.addEventListener("click", (e) => {
  if (!e.target.closest("#notifPanel") && !e.target.closest("#notifBell"))
    document.getElementById("notifPanel").classList.remove("show");
});
renderNotifPanel();

async function checkNotifications() {
  try {
    const res = await fetch(`${API_BASE}/api/uploads`);
    const list = await res.json();
    if (!Array.isArray(list) || !list.length) return;
    const newest = list[0]; // sorted by time desc
    const lastSeen = localStorage.getItem("adcsLastUpload");
    if (lastSeen && newest.time > lastSeen) {
      notifyAll(newest);
    }
    if (newest.time) localStorage.setItem("adcsLastUpload", newest.time);
  } catch (e) { /* server offline — ignore */ }
}
checkNotifications();
setInterval(checkNotifications, 15000);
