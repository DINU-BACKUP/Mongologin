// REGISTER
async function register() {

    const username = ruser.value;
    const password = rpass.value;
    const email = remail.value;
    const phone = rphone.value;
    const msg = rmsg;

    const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email, phone })
    });

    const data = await res.json();
    msg.style.color = res.ok ? "green" : "red";
    msg.textContent = data.message;

    if (res.ok)
        setTimeout(() => window.location.href = "/login.html", 1500);
}


// LOGIN
async function login() {

    const username = luser.value;
    const password = lpass.value;
    const msg = lmsg;

    const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {

        localStorage.setItem("authUser", username);
        localStorage.setItem("authExpire", Date.now() + 86400000);

        showHome(username);

    } else {
        msg.style.color = "red";
        msg.textContent = data.message;
    }
}


// SHOW HOME WITH NAVBAR
function showHome(user) {

    loginBox.innerHTML = `
    <div style="display:flex;justify-content:space-between;">
        <b>Home</b>
        <button onclick="logout()" style="background:red;">Logout</button>
    </div>

    <h3>Welcome ${user}</h3>

    <button onclick="showDelete('${user}')" style="background:black;color:white;margin-top:15px;">
        Delete Account
    </button>

    <div id="deleteBox"></div>
    `;
}


// SHOW SELF DELETE UI
function showDelete(user) {

    deleteBox.innerHTML = `
    <p>Type your username to confirm:</p>
    <input id="confirmUser" placeholder="Confirm Username">
    <button onclick="deleteSelf('${user}')">Confirm Delete</button>
    `;
}


// DELETE SELF
async function deleteSelf(user) {

    const confirm = document.getElementById("confirmUser").value;

    const res = await fetch("/api/deleteSelf", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, confirm })
    });

    const data = await res.json();

    if (res.ok) {
        alert("Account deleted");
        localStorage.clear();
        location.reload();
    } else {
        alert(data.message);
    }
}


// ADMIN LOAD USERS
async function loadUsers() {

    const key = adminkey.value;

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
        <td>
            <button onclick="adminDelete('${u.username}')">❌</button>
        </td>
        </tr>
        `;
    });

    html += "</table>";
    userTable.innerHTML = html;
}


// ADMIN DELETE
function adminDelete(username) {

    userTable.innerHTML += `
    <div style="margin-top:10px;">
        <p>Type username to confirm delete:</p>
        <input id="adminConfirm">
        <button onclick="confirmAdminDelete('${username}')">Confirm</button>
    </div>
    `;
}


async function confirmAdminDelete(username) {

    const confirm = document.getElementById("adminConfirm").value;

    const res = await fetch("/api/admin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, confirm })
    });

    const data = await res.json();

    alert(data.message);
    loadUsers();
}


// LOGOUT
function logout() {
    localStorage.clear();
    location.reload();
}


// SESSION CHECK
window.onload = function() {

    const user = localStorage.getItem("authUser");
    const expire = localStorage.getItem("authExpire");

    if (user && Date.now() < expire && typeof loginBox !== "undefined") {
        showHome(user);
    }
};
