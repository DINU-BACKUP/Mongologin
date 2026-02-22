// ====================
// FULL script.js
// ====================

// GLOBAL ELEMENTS
const ruser = document.getElementById("ruser");
const rpass = document.getElementById("rpass");
const remail = document.getElementById("remail");
const rphone = document.getElementById("rphone");
const rotp = document.getElementById("rotp");
const rmsg = document.getElementById("rmsg");
const otpSection = document.getElementById("otpSection");
const otpBtn = document.getElementById("otpBtn");
const resendBtn = document.getElementById("resendBtn");
const editBtn = document.getElementById("editBtn");

const luser = document.getElementById("luser");
const lpass = document.getElementById("lpass");
const lmsg = document.getElementById("lmsg");
const loginBox = document.getElementById("loginBox");
const deleteBox = document.getElementById("deleteBox");
const adminkey = document.getElementById("adminkey");
const userTable = document.getElementById("userTable");

let resendTimer = 60;
let interval = null;

// ====================
// REGISTER FUNCTIONS
// ====================
async function sendOtp() {
    const email = remail.value.trim();
    if (!email) {
        rmsg.style.color = "red";
        rmsg.textContent = "Enter Gmail";
        return;
    }

    const res = await fetch("/api/sendOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });

    const data = await res.json();
    rmsg.style.color = res.ok ? "green" : "red";
    rmsg.textContent = data.message;

    if (res.ok) {
        otpSection.style.display = "block";
        startResendTimer();
        remail.disabled = true;
        editBtn.disabled = false;
    }
}

async function resendOtp() {
    resendTimer = 60;
    await sendOtp();
}

function startResendTimer() {
    resendBtn.disabled = true;
    resendBtn.textContent = `Resend OTP (${resendTimer}s)`;

    interval = setInterval(() => {
        resendTimer--;
        resendBtn.textContent = `Resend OTP (${resendTimer}s)`;

        if (resendTimer <= 0) {
            clearInterval(interval);
            resendBtn.disabled = false;
            resendBtn.textContent = "Resend OTP";
        }
    }, 1000);
}

function enableEmailEdit() {
    remail.disabled = false;
    remail.value = "";
    otpSection.style.display = "none";
    clearInterval(interval);
    resendBtn.textContent = "Resend OTP (60s)";
}

async function register() {
    const username = ruser.value.trim();
    const password = rpass.value.trim();
    const email = remail.value.trim();
    const phone = rphone.value.trim();
    const otp = rotp.value.trim();

    const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email, phone, otp })
    });

    const data = await res.json();
    rmsg.style.color = res.ok ? "green" : "red";
    rmsg.textContent = data.message;

    if (res.ok) setTimeout(() => window.location.href = "/login.html", 1500);
}

// ====================
// LOGIN FUNCTIONS
// ====================
async function login() {
    const username = luser.value.trim();
    const password = lpass.value.trim();

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
        lmsg.style.color = "red";
        lmsg.textContent = data.message;
    }
}

function showHome(user) {
    loginBox.innerHTML = `
    <div style="display:flex;justify-content:space-between;">
        <b>Home</b>
        <button onclick="logout()" style="background:red;color:white;">Logout</button>
    </div>
    <h3>Welcome ${user}</h3>
    <button onclick="showDelete('${user}')" style="background:black;color:white;margin-top:15px;">
        Delete Account
    </button>
    <div id="deleteBox"></div>
    `;
}

function showDelete(user) {
    deleteBox.innerHTML = `
    <p>Type your username to confirm:</p>
    <input id="confirmUser" placeholder="Confirm Username">
    <button onclick="deleteSelf('${user}')">Confirm Delete</button>
    `;
}

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

// ====================
// ADMIN PANEL
// ====================
async function loadUsers() {
    const key = adminkey.value.trim();
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

// ====================
// LOGOUT
// ====================
function logout() {
    localStorage.clear();
    location.reload();
}

// ====================
// SESSION CHECK
// ====================
window.onload = function() {
    const user = localStorage.getItem("authUser");
    const expire = localStorage.getItem("authExpire");

    if (user && Date.now() < expire && typeof loginBox !== "undefined") {
        showHome(user);
    }
};
