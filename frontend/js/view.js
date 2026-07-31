// Get token from URL query string: view.html?token=xxxx
const params = new URLSearchParams(window.location.search);
const token  = params.get("token");

if (!token) {
  window.location.href = "index.html";
}

const lockedState   = document.getElementById("lockedState");
const unlockedState = document.getElementById("unlockedState");
const timedNotice   = document.getElementById("timedNotice");
const timedNoticeText = document.getElementById("timedNoticeText");
const lockedWarning = document.getElementById("lockedWarning");

// We don't know the note type yet until we fetch — show generic warning
lockedWarning.textContent = "Opening this note is irreversible — it will be deleted immediately after decryption.";

document.getElementById("decryptBtn").addEventListener("click", async () => {
  const passphrase = document.getElementById("unlockPassphrase").value;

  if (!passphrase) {
    document.getElementById("errorMsg").textContent = "Please enter the passphrase.";
    document.getElementById("errorMsg").style.display = "block";
    return;
  }

  const decryptBtn = document.getElementById("decryptBtn");
  decryptBtn.textContent = "Fetching...";
  decryptBtn.disabled = true;

  try {
    const response = await fetch(`${SecrNote.API_URL}/notes/${token}`);
    const data = await response.json();

    if (!response.ok) {
      // 404 = already read or never existed, 410 = expired
      document.getElementById("errorMsg").textContent = data.error;
      document.getElementById("errorMsg").style.display = "block";
      decryptBtn.textContent = "Decrypt & View Note";
      decryptBtn.disabled = false;
      return;
    }

    // Note is now deleted on the server — decrypt client-side
    const plainText = SecrNote.decrypt(data.encrypted_text, passphrase);

    if (!plainText) {
      document.getElementById("errorMsg").textContent = "Incorrect passphrase. The note has been destroyed.";
      document.getElementById("errorMsg").style.display = "block";
      decryptBtn.textContent = "Decrypt & View Note";
      decryptBtn.disabled = false;
      return;
    }

    unlockNote(plainText, data.note_type, data.read_seconds);

  } catch (err) {
    document.getElementById("errorMsg").textContent = "Could not reach the server.";
    document.getElementById("errorMsg").style.display = "block";
    decryptBtn.textContent = "Decrypt & View Note";
    decryptBtn.disabled = false;
  }
});

function unlockNote(plainText, noteType, readSeconds) {
  lockedState.style.display = "none";
  unlockedState.style.display = "block";

  document.getElementById("noteBox").textContent = plainText;

  const standardActions = document.getElementById("standardActions");
  const timerWrap       = document.getElementById("timerWrap");
  const unlockedSub     = document.getElementById("unlockedSub");

  if (noteType === "timed") {
    unlockedSub.textContent = "Read carefully. This note destroys itself when the timer runs out.";
    standardActions.style.display = "none";
    timerWrap.style.display = "flex";
    startCountdown(readSeconds);
  } else {
    document.getElementById("destroyBtn").addEventListener("click", goToDestroyed);
  }
}

function startCountdown(totalSeconds) {
  let remaining = totalSeconds;
  const timerNum      = document.getElementById("timerNum");
  const timerRing     = document.getElementById("timerRing");
  const timerWarnText = document.getElementById("timerWarnText");
  const noteBox       = document.getElementById("noteBox");

  function render() {
    const pct = remaining / totalSeconds;
    timerNum.textContent = remaining;

    let color = "#A78BFA";
    if (pct <= 0.3 && pct > 0.1) color = "#FBBF24";
    if (pct <= 0.1) color = "#F87171";

    timerNum.style.color = color;
    timerRing.style.background = `conic-gradient(${color} ${pct * 360}deg, #1E1E3A ${pct * 360}deg)`;

    if (remaining > 10) {
      timerWarnText.textContent = "Note will self-destruct when timer ends";
      noteBox.classList.remove("danger");
    } else if (remaining > 0) {
      timerWarnText.textContent = "⚠ Destroying soon — copy anything you need now";
      noteBox.classList.add("danger");
    } else {
      timerWarnText.textContent = "Destroying…";
    }
  }

  render();

  const interval = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      clearInterval(interval);
      render();
      setTimeout(goToDestroyed, 500);
      return;
    }
    render();
  }, 1000);
}

function goToDestroyed() {
  sessionStorage.setItem("secrnote_destroyed_at", SecrNote.formatTimestamp());
  window.location.href = "destroyed.html";
}