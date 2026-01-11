function login() {
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;

  if (u === "Lingaraju" && p === "123") {
    localStorage.setItem("loggedIn", "yes");
    window.location = "app.html";
  } else {
    document.getElementById("msg").innerText = "Wrong login!";
  }
}

if (localStorage.getItem("loggedIn") === "yes") {
  if (location.pathname.endsWith("index.html")) {
    window.location = "app.html";
  }
}
