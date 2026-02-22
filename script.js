async function register() {
    const username = document.getElementById("ruser").value;
    const password = document.getElementById("rpass").value;
    const msg = document.getElementById("rmsg");

    const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
        msg.style.color = "green";
        msg.textContent = data.message;
        setTimeout(() => {
            window.location.href = "/login.html";
        }, 1500);
    } else {
        msg.style.color = "red";
        msg.textContent = data.message;
    }
}

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
        document.getElementById("loginBox").innerHTML =
            "<h2>Login Success ✅</h2>";
    } else {
        msg.style.color = "red";
        msg.textContent = data.message;
    }
}
