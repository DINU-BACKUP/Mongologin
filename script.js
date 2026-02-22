// THEME TOGGLE
function toggleTheme() {
    const body = document.body;

    if (body.classList.contains("dark")) {
        body.classList.remove("dark");
        body.classList.add("light");
        localStorage.setItem("theme", "light");
    } else {
        body.classList.remove("light");
        body.classList.add("dark");
        localStorage.setItem("theme", "dark");
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.body.classList.add(savedTheme);
});
// REGISTER
async function register() {

    const username = document.getElementById("ruser").value;
    const password = document.getElementById("rpass").value;
    const email = document.getElementById("remail").value;
    const phone = document.getElementById("rphone").value;
    const msg = document.getElementById("rmsg");

    const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email, phone })
    });

    const data = await res.json();
    msg.style.color = res.ok ? "green" : "red";
    msg.textContent = data.message;

    if (res.ok) {
        setTimeout(() => window.location.href = "/login.html", 1500);
    }
}


// LOGIN
async function login() {

    const username = document.getElementById("luser").value;
    const password = document.getElementById("lpass").value;
    const msg = document.getElementById("lmsg");

    const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {

        localStorage.setItem("authUser", username);
        localStorage.setItem("authExpire", Date.now() + 86400000);

        showLoggedIn(username);

    } else {
        msg.style.color = "red";
        msg.textContent = data.message;
    }
}


// SESSION CHECK
window.onload = function() {

    const user = localStorage.getItem("authUser");
    const expire = localStorage.getItem("authExpire");

    if (user && Date.now() < expire && document.getElementById("loginBox")) {
        showLoggedIn(user);
    }
};


// SHOW LOGGED IN UI
function showLoggedIn(user) {

    document.getElementById("loginBox").innerHTML = `
    <div style="display:flex;justify-content:space-between;">
        <h3>Welcome ${user}</h3>
        <button onclick="logout()" style="background:red;">Logout</button>
    </div>
    `;
}


// LOGOUT
function logout() {
    localStorage.clear();
    location.reload();
}


// ADMIN LOAD USERS
async function loadUsers() {

    const key = document.getElementById("adminkey").value;

    const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key })
    });

    const data = await res.json();

    if (!res.ok) {
        alert(data.message);
        return;
    }

    let html = "<table border='1' style='width:100%;margin-top:10px'>";
    html += "<tr><th>Username</th><th>Email</th><th>Phone</th><th>Delete</th></tr>";

    data.users.forEach(u => {
        html += `
        <tr>
        <td>${u.username}</td>
        <td>${u.email}</td>
        <td>${u.phone}</td>
        <td><button onclick="deleteUser('${u.username}')">❌</button></td>
        </tr>
        `;
    });

    html += "</table>";

    document.getElementById("userTable").innerHTML = html;
}


// DELETE USER
async function deleteUser(username) {

    if (!confirm("Type username to confirm delete") ) return;

    await fetch("/api/admin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
    });

    loadUsers();
}
