// GLOBAL ELEMENTS
const ruser = document.getElementById("ruser");
const rpass = document.getElementById("rpass");
const remail = document.getElementById("remail");
const rphone = document.getElementById("rphone");
const rmsg = document.getElementById("rmsg");

const luser = document.getElementById("luser");
const lpass = document.getElementById("lpass");
const lmsg = document.getElementById("lmsg");
const loginBox = document.getElementById("loginBox");

const adminkey = document.getElementById("adminkey");
const userTable = document.getElementById("userTable");


// REGISTER
async function register() {
    const username = ruser.value.trim();
    const password = rpass.value.trim();
    const email = remail.value.trim();
    const phone = rphone.value.trim();

    const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email, phone })
    });

    const data = await res.json();
    rmsg.style.color = res.ok ? "green" : "red";
    rmsg.textContent = data.message;

    if(res.ok) setTimeout(()=>window.location.href="/login.html",1500);
}

// LOGIN
async function login() {
    const username = luser.value.trim();
    const password = lpass.value.trim();

    const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if(res.ok) {
        localStorage.setItem("authUser", username);
        localStorage.setItem("authExpire", Date.now() + 86400000);
        showHome(username);
    } else {
        lmsg.style.color="red";
        lmsg.textContent=data.message;
    }
}

// HOME & LOGOUT
function showHome(user){
    loginBox.innerHTML=`
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

function logout(){
    localStorage.clear();
    location.reload();
}

// DELETE ACCOUNT
function showDelete(user){
    const deleteBox=document.getElementById("deleteBox");
    deleteBox.innerHTML=`
        <p>Type your username to confirm:</p>
        <input id="confirmUser" placeholder="Confirm Username">
        <button onclick="deleteSelf('${user}')">Confirm Delete</button>
    `;
}

async function deleteSelf(user){
    const confirm=document.getElementById("confirmUser").value;

    const res=await fetch("/api/deleteSelf",{
        method:"DELETE",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({username:user, confirm})
    });

    const data=await res.json();
    if(res.ok){
        alert("Account deleted");
        localStorage.clear();
        location.reload();
    } else {
        alert(data.message);
    }
}

// ADMIN PANEL
async function loadUsers(){
    const key=adminkey.value.trim();
    const res=await fetch("/api/admin",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({key})
    });
    const data=await res.json();

    if(!res.ok){ alert(data.message); return; }

    let html="<table border='1' style='width:100%;margin-top:10px'>";
    html+="<tr><th>Username</th><th>Email</th><th>Phone</th><th>Delete</th></tr>";
    data.users.forEach(u=>{
        html+=`<tr>
            <td>${u.username}</td>
            <td>${u.email}</td>
            <td>${u.phone}</td>
            <td><button onclick="adminDelete('${u.username}')">❌</button></td>
        </tr>`;
    });
    html+="</table>";
    userTable.innerHTML=html;
}

function adminDelete(username){
    userTable.innerHTML+=`
    <div style="margin-top:10px;">
        <p>Type username to confirm delete:</p>
        <input id="adminConfirm">
        <button onclick="confirmAdminDelete('${username}')">Confirm</button>
    </div>`;
}

async function confirmAdminDelete(username){
    const confirm=document.getElementById("adminConfirm").value;

    const res=await fetch("/api/admin",{
        method:"DELETE",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({username, confirm})
    });

    const data=await res.json();
    alert(data.message);
    loadUsers();
}

// SESSION CHECK
window.onload=function(){
    const user=localStorage.getItem("authUser");
    const expire=localStorage.getItem("authExpire");

    if(user && Date.now()<expire && typeof loginBox!=="undefined"){
        showHome(user);
    }
};
