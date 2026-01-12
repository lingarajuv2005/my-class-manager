// ================= FIREBASE CHECK =================
if (typeof db === "undefined") {
  alert("Firebase not initialized. Check your firebaseConfig in app.html");
}

// ================= LOGIN CHECK =================
if (localStorage.getItem("loggedIn") !== "yes") {
  window.location = "index.html";
}

let classes = [];

// ================= SAVE & LOAD =================
function save() {
  db.collection("users")
    .doc("Lingaraju")
    .set({ classes: classes });
}

function load() {
  db.collection("users")
    .doc("Lingaraju")
    .get()
    .then(doc => {
      if (doc.exists) {
        classes = doc.data().classes || [];
      }
      classes.forEach(schedule);
      render();
    });
}

// ================= ADD CLASS =================
function addClass() {
  const t = document.getElementById("title").value.trim();
  const startValue = document.getElementById("startTime").value;
  const endValue = document.getElementById("endTime").value;
  const link = document.getElementById("link").value.trim();
  const wa = document.getElementById("wa").value.trim();
  const r = parseInt(document.getElementById("remind").value || 10);

  if (!t || !startValue || !endValue) {
    alert("Please enter class name, start time and end time");
    return;
  }

  const startTime = new Date(startValue).getTime();
  const endTime = new Date(endValue).getTime();

  if (isNaN(startTime) || isNaN(endTime) || endTime <= startTime) {
    alert("Invalid start/end time");
    return;
  }

  const obj = {
    t,
    startTime,
    endTime,
    link,
    wa,
    r,
    status: "",
    notes: ""
  };

  classes.push(obj);
  save();
  schedule(obj);
  render();

  title.value = "";
  startTime.value = "";
  endTime.value = "";
  link.value = "";
  wa.value = "";
  remind.value = "10";
}

// ================= RENDER UI =================
function render() {
  const upcoming = document.getElementById("upcoming");
  const history = document.getElementById("history");
  const timetable = document.getElementById("timetable");

  if (upcoming) upcoming.innerHTML = "";
  if (history) history.innerHTML = "";
  if (timetable) timetable.innerHTML = "";

  const now = Date.now();
  classes.sort((a, b) => a.startTime - b.startTime);

  classes.forEach((c, i) => {
    const start = new Date(c.startTime);
    const end = new Date(c.endTime);

    // ===== TIMETABLE (ONLY UPCOMING / ONGOING) =====
    if (timetable && c.endTime > now) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${start.toLocaleDateString()}</td>
        <td>${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
        <td>${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
        <td>${c.t}</td>
        <td>${c.link ? `<a href="${c.link}" target="_blank">Join</a>` : "-"}</td>
        <td>${c.wa || "-"}</td>
      `;
      timetable.appendChild(tr);
    }

    // ===== UPCOMING =====
    if (c.startTime > now) {
      if (upcoming) {
        const li = document.createElement("li");
        li.innerHTML = `
          <b>${c.t}</b><br>
          ${start.toLocaleString()} - ${end.toLocaleTimeString()}<br>
          ${c.link ? `<a href="${c.link}" target="_blank">Join</a>` : ""}<br>
          <button onclick="delClass(${i})">Delete</button>
        `;
        upcoming.appendChild(li);
      }
    }

    // ===== HISTORY =====
    if (c.endTime <= now) {
      if (history) {
        const li = document.createElement("li");
        li.innerHTML = `
          <b>${c.t}</b><br>
          ${start.toLocaleString()} - ${end.toLocaleTimeString()}<br>

          <select onchange="setStatus(${i}, this.value)">
            <option value="">-- Attendance --</option>
            <option value="Attended" ${c.status === "Attended" ? "selected" : ""}>Attended</option>
            <option value="Missed" ${c.status === "Missed" ? "selected" : ""}>Missed</option>
          </select><br>

          <textarea placeholder="Add notes..."
            onblur="setNotes(${i}, this.value)">${c.notes || ""}</textarea><br>

          <div>Status: ${c.status || "Not set"}</div>
        `;
        history.appendChild(li);
      }
    }
  });
}

// ================= ATTENDANCE & NOTES =================
function setStatus(i, v) {
  classes[i].status = v;
  save();
  render();
}

function setNotes(i, v) {
  classes[i].notes = v;
  save();
}

// ================= DELETE =================
function delClass(i) {
  if (confirm("Delete this class?")) {
    classes.splice(i, 1);
    save();
    render();
  }
}

// ================= NOTIFICATION =================
function schedule(c) {
  if (!("Notification" in window)) return;

  Notification.requestPermission();

  const diff = c.startTime - (c.r * 60000) - Date.now();
  if (diff > 0) {
    setTimeout(() => {
      new Notification("Class Reminder", {
        body: c.t + " starts in " + c.r + " minutes"
      });
    }, diff);
  }
}

// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("loggedIn");
  window.location = "index.html";
}

// ================= CLEAR ALL =================
function clearAllClasses() {
  if (confirm("Delete ALL classes?")) {
    classes = [];
    save();
    render();
  }
}

// ================= INIT =================
load();
