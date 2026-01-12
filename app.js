if (typeof db === "undefined") {
  alert("Firebase not initialized. Check your firebaseConfig in app.html");
}


// Redirect if not logged in
if (localStorage.getItem("loggedIn") !== "yes") {
  window.location = "index.html";
}

let classes = [];

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


// Add new class
function addClass() {
  const t = document.getElementById("title").value.trim();
  const timeValue = document.getElementById("time").value;
  const link = document.getElementById("link").value.trim();
  const wa = document.getElementById("wa").value.trim();
  const r = parseInt(document.getElementById("remind").value || 10);

  if (!t || !timeValue) {
    alert("Please enter class name and time");
    return;
  }

  const time = new Date(timeValue).getTime();
  if (isNaN(time)) {
    alert("Invalid date/time");
    return;
  }

  const obj = {
    t,
    time,
    link,
    wa,       // optional
    r,
    status: "",
    notes: ""
  };

  classes.push(obj);
  save();
  schedule(obj);
  render();

  title.value = "";
  time.value = "";
  link.value = "";
  wa.value = "";
  remind.value = "10";
}


// Render UI
  function render() {
  const upcoming = document.getElementById("upcoming");
  const history = document.getElementById("history");
  const timetable = document.getElementById("timetable");

  if (upcoming) upcoming.innerHTML = "";
  if (history) history.innerHTML = "";
  if (timetable) timetable.innerHTML = "";

  const now = Date.now();
  classes.sort((a, b) => a.time - b.time);

  classes.forEach((c, i) => {
    const d = new Date(c.time);

    // ---- TIME TABLE (ALL CLASSES) ----
    if (timetable) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.toLocaleDateString()}</td>
        <td>${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
        <td>${c.t}</td>
        <td>${c.link ? `<a href="${c.link}" target="_blank">Join</a>` : "-"}</td>
        <td>${c.wa || "-"}</td>
      `;
      timetable.appendChild(tr);
    }

    // ---- UPCOMING / HISTORY ----
    if (c.time > now) {
      if (upcoming) {
        const li = document.createElement("li");
        li.innerHTML = `
          <b>${c.t}</b><br>
          ${d.toLocaleString()}<br>
          <a href="${c.link}" target="_blank">Join</a><br>
          <button onclick="delClass(${i})">Delete</button>
        `;
        upcoming.appendChild(li);
      }
    } else {
      if (history) {
        const li = document.createElement("li");
        li.innerHTML = `
          <b>${c.t}</b><br>
          ${d.toLocaleString()}<br>

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



// Set attendance
function setStatus(i, v) {
  classes[i].status = v;
  save();
  render();
}

// Save notes
function setNotes(i, v) {
  classes[i].notes = v;
  save();
}

// Delete class
function delClass(i) {
  if (confirm("Delete this class?")) {
    classes.splice(i, 1);
    save();
    render();
  }
}

// Schedule notification
function schedule(c) {
  if (!("Notification" in window)) return;

  Notification.requestPermission();

  const diff = c.time - (c.r * 60000) - Date.now();

  if (diff > 0) {
    setTimeout(() => {
      new Notification("Class Reminder", {
        body: c.t + " starts in " + c.r + " minutes"
      });
    }, diff);
  }
}

// Logout
function logout() {
  localStorage.removeItem("loggedIn");
  window.location = "index.html";
}


load();

function clearAllClasses() {
  if (confirm("Are you sure you want to delete ALL classes?")) {
    classes = [];
    save();
    render();
  }
}









