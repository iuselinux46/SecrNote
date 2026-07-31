const btnStandard = document.getElementById("btnStandard");
const btnTimed = document.getElementById("btnTimed");
const timedPanel = document.getElementById("timedPanel");

let noteType = "standard";

btnStandard.addEventListener("click", () => {
  noteType = "standard";
  btnStandard.classList.add("active");
  btnTimed.classList.remove("active");
  timedPanel.classList.remove("visible");
});

btnTimed.addEventListener("click", () => {
  noteType = "timed";
  btnTimed.classList.add("active");
  btnStandard.classList.remove("active");
  timedPanel.classList.add("visible");
});

// Read receipt toggle
const receiptToggle = document.getElementById("receiptToggle");
const receiptPanel = document.getElementById("receiptPanel");
let receiptOn = true;

receiptToggle.addEventListener("click", () => {
  receiptOn = !receiptOn;
  receiptToggle.classList.toggle("on", receiptOn);
  receiptPanel.classList.toggle("visible", receiptOn);
});

// Submit
document.getElementById("createForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const noteText = document.getElementById("noteText").value.trim();
  const passphrase = document.getElementById("passphrase").value;
  const expiry = document.getElementById("expiry").value;
  const readSeconds = Number(document.getElementById("readSeconds").value);
  const receiptEmail = document.getElementById("receiptEmail").value;

  if (!noteText || !passphrase) {
    alert("Please enter both a note and a passphrase.");
    return;
  }

  // Encrypt client-side before sending — server never sees plaintext
  const encrypted_text = SecrNote.encrypt(noteText, passphrase);

  const submitBtn = document.querySelector(".btn-primary");
  submitBtn.textContent = "Encrypting...";
  submitBtn.disabled = true;

  try {
    const response = await fetch(`${SecrNote.API_URL}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        encrypted_text,
        note_type: noteType,
        read_seconds: noteType === "timed" ? readSeconds : null,
        expiry,
        receipt: receiptOn,
        receipt_email: receiptOn ? receiptEmail : null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(`Error: ${data.error}`);
      submitBtn.textContent = "Encrypt & Generate Link";
      submitBtn.disabled = false;
      return;
    }

    // Store only what the next pages need — no sensitive data
    sessionStorage.setItem("secrnote_token", data.token);
    sessionStorage.setItem("secrnote_link", data.link);
    sessionStorage.setItem("secrnote_type", noteType);
    sessionStorage.setItem("secrnote_read_seconds", readSeconds);
    sessionStorage.setItem("secrnote_expiry", expiry);
    sessionStorage.setItem("secrnote_receipt", receiptOn);
    sessionStorage.setItem("secrnote_receipt_email", receiptEmail);

    window.location.href = "link.html";
  } catch (err) {
    alert("Could not reach the server. Is the backend running?");
    submitBtn.textContent = "Encrypt & Generate Link";
    submitBtn.disabled = false;
  }
});