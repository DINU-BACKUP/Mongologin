let resendTimer = 60;
let interval;

async function sendOtp() {

    const email = remail.value;
    const msg = rmsg;

    const res = await fetch("/api/sendOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });

    const data = await res.json();
    msg.style.color = res.ok ? "green" : "red";
    msg.textContent = data.message;

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

    const username = ruser.value;
    const password = rpass.value;
    const email = remail.value;
    const phone = rphone.value;
    const otp = rotp.value;
    const msg = rmsg;

    const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email, phone, otp })
    });

    const data = await res.json();
    msg.style.color = res.ok ? "green" : "red";
    msg.textContent = data.message;

    if (res.ok)
        setTimeout(() => window.location.href = "/login.html", 1500);
}
