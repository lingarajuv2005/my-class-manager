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
  db.collection("users").doc("Lingaraju").set({ classes });
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
  const date = document.getElementById("classDate").value;
  const startT = document.getElementById("startTime").value;
  const endT = document.getElementById("endTime").value;
  const link = document.getElementById("link").value.trim();
  const wa = document.getElementById("wa").value.trim();
  const r = parseInt(document.getElementById("remind").value || 10);

  if (!t || !date || !startT || !endT) {
    alert("Please fill all required fields");
    return;
  }

  const startTime = new Date(`${date}T${startT}`).getTime();
  const endTime = new Date(`${date}T${endT}`).getTime();

  if (isNaN(startTime) || isNaN(endTime) || endTime <= startTime) {
    alert("Invalid time range");
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

  // clear inputs
  ["title", "classDate", "startTime", "endTime", "link", "wa"].forEach(id => {
    document.getElementById(id).value = "";
  });
  document.getElementById("remind").value = "10";
}

// ================= EDIT CLASS =================
function editClass(i) {
  const c = classes[i];
  document.getElementById("title").value = c.t;
  document.getElementById("classDate").value = new Date(c.startTime).toISOString().slice(0, 10);
  document.getElementById("startTime").value = new Date(c.startTime).toTimeString().slice(0,5);
  document.getElementById("endTime").value = new Date(c.endTime).toTimeString().slice(0,5);
  document.getElementById("link").value = c.link || "";
  document.getElementById("wa").value = c.wa || "";
  document.getElementById("remind").value = c.r || 10;

  // Change the "Add Class" button to "Update Class"
  const btn = document.querySelector('section.card button');
  btn.textContent = "✏️ Update Class";
  btn.onclick = function() { updateClass(i); };
}

// ================= UPDATE CLASS =================
function updateClass(i) {
  const t = document.getElementById("title").value.trim();
  const date = document.getElementById("classDate").value;
  const startT = document.getElementById("startTime").value;
  const endT = document.getElementById("endTime").value;
  const link = document.getElementById("link").value.trim();
  const wa = document.getElementById("wa").value.trim();
  const r = parseInt(document.getElementById("remind").value || 10);

  if (!t || !date || !startT || !endT) {
    alert("Please fill all required fields");
    return;
  }

  const startTime = new Date(`${date}T${startT}`).getTime();
  const endTime = new Date(`${date}T${endT}`).getTime();

  if (isNaN(startTime) || isNaN(endTime) || endTime <= startTime) {
    alert("Invalid time range");
    return;
  }

  classes[i] = {
    ...classes[i],
    t,
    startTime,
    endTime,
    link,
    wa,
    r
  };

  save();
  render();

  // Reset form & button
  ["title", "classDate", "startTime", "endTime", "link", "wa"].forEach(id => {
    document.getElementById(id).value = "";
  });
  document.getElementById("remind").value = "10";

  const btn = document.querySelector('section.card button');
  btn.textContent = "➕ Add Class";
  btn.onclick = addClass;
}

// ================= RENDER UI =================
function render() {
  const upcoming = document.getElementById("upcoming");
  const history = document.getElementById("history");
  const timetable = document.getElementById("timetable");

  upcoming.innerHTML = "";
  history.innerHTML = "";
  timetable.innerHTML = "";

  const now = Date.now();
  classes.sort((a, b) => a.startTime - b.startTime);

  classes.forEach((c, i) => {
    const start = new Date(c.startTime);
    const end = new Date(c.endTime);

    // ===== TIMETABLE =====
    if (c.endTime > now) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${start.toLocaleDateString()}</td>
        <td>${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
        <td>${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
        <td>${c.t}</td>
        <td>${c.link ? `<a href="${c.link}" target="_blank">Join</a>` : "-"}</td>
        <td>${c.wa || "-"}</td>
      `;
      timetable.appendChild(tr);
    }

    // ===== UPCOMING =====
    if (c.endTime > now) {
      const li = document.createElement("li");
      li.innerHTML = `
        <b>${c.t}</b><br>
        ${start.toLocaleString()} - ${end.toLocaleTimeString()}<br>
        ${c.link ? `<a href="${c.link}" target="_blank">Join</a><br>` : ""}
        <button onclick="editClass(${i})">✏️ Edit</button>
        <button onclick="delClass(${i})">🗑 Delete</button>
      `;
      upcoming.appendChild(li);
    }

    // ===== HISTORY =====
    if (c.endTime <= now) {
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

        <button onclick="editClass(${i})">✏️ Edit</button>

        <div>Status: ${c.status || "Not set"}</div>
      `;
      history.appendChild(li);
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

  const notifyAt = c.startTime - c.r * 60000;
  const delay = notifyAt - Date.now();

  if (delay > 0) {
    setTimeout(() => {
      new Notification("Class Reminder", {
        body: `${c.t} starts in ${c.r} minutes`
      });
    }, delay);
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
