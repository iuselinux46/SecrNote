const btnStandard = document.getElementById("btnStandard");
const btnTimed = document.getElementById("btnTimed");
const timedPanel = document.getElementById("timedPanel");
const passphraseToggle = document.getElementById("passphraseToggle");
const passphrasePanel = document.getElementById("passphrasePanel");
let passphraseOn = false;
let noteType = "standard";

// Passphrase toggle
passphraseToggle.addEventListener("click", () => {
  passphraseOn = !passphraseOn;
  passphraseToggle.classList.toggle("on", passphraseOn);
  passphrasePanel.classList.toggle("visible", passphraseOn);
});

// Note type toggle
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
  const expiry = document.getElementById("expiry").value;
  const readSeconds = Number(document.getElementById("readSeconds").value);
  const receiptEmail = document.getElementById("receiptEmail").value;

  if (!noteText) {
    alert("Please enter a note.");
    return;
  }

  // Determine encryption key
  let encryptionKey;
  if (passphraseOn) {
    const passphrase = document.getElementById("passphrase").value;
    if (!passphrase) {
      alert("Please enter a passphrase or turn off passphrase protection.");
      return;
    }
    encryptionKey = passphrase;
  } else {
    // Generate a random 32-byte key — embedded in the link after #
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    encryptionKey = Array.from(array)
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  const encrypted_text = SecrNote.encrypt(noteText, encryptionKey);

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
        passphrase_protected: passphraseOn,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(`Error: ${data.error}`);
      submitBtn.textContent = "Encrypt & Generate Link";
      submitBtn.disabled = false;
      return;
    }

    // Build the correct link — key goes in fragment if no passphrase
    const link = passphraseOn
      ? `${SecrNote.BASE_URL}/view.html?token=${data.token}`
      : `${SecrNote.BASE_URL}/view.html?token=${data.token}#key=${encryptionKey}`;

    sessionStorage.setItem("secrnote_token", data.token);
    sessionStorage.setItem("secrnote_link", link);
    sessionStorage.setItem("secrnote_type", noteType);
    sessionStorage.setItem("secrnote_read_seconds", readSeconds);
    sessionStorage.setItem("secrnote_expiry", expiry);
    sessionStorage.setItem("secrnote_receipt", receiptOn);
    sessionStorage.setItem("secrnote_receipt_email", receiptEmail);
    sessionStorage.setItem("secrnote_passphrase_protected", passphraseOn);

    window.location.href = "link.html";
  } catch (err) {
    alert("Could not reach the server. Is the backend running?");
    submitBtn.textContent = "Encrypt & Generate Link";
    submitBtn.disabled = false;
  }
});