const token = sessionStorage.getItem("secrnote_token");
const link  = sessionStorage.getItem("secrnote_link");

if (!token || !link) {
  document.querySelector(".card").style.display = "none";
  document.getElementById("emptyState").style.display = "block";
} else {
  document.getElementById("urlText").textContent = link;

  const expiryLabels = { "1h": "1h", "24h": "24h", "7d": "7 days" };
  const expiry      = sessionStorage.getItem("secrnote_expiry");
  const noteType    = sessionStorage.getItem("secrnote_type");
  const readSeconds = sessionStorage.getItem("secrnote_read_seconds");
  const receipt     = sessionStorage.getItem("secrnote_receipt") === "true";

  const chipsRow = document.getElementById("chipsRow");
  let chipsHTML = `
    <div class="chip">⏱ Expires in ${expiryLabels[expiry] || expiry}</div>
    <div class="chip">👁 Views: 0 / 1</div>
    <div class="chip">🔐 AES-256</div>
  `;
  if (noteType === "timed") {
    chipsHTML += `<div class="chip accent">⏱ Timed · ${readSeconds}s window</div>`;
  }
  if (receipt) {
    chipsHTML += `<div class="chip accent">🔔 Read receipt on</div>`;
  }
  chipsRow.innerHTML = chipsHTML;

  const copyBtn   = document.getElementById("copyBtn");
  const copyLabel = document.getElementById("copyLabel");

  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(link).then(() => {
      copyBtn.classList.add("copied");
      copyLabel.textContent = "Copied";
      setTimeout(() => {
        copyBtn.classList.remove("copied");
        copyLabel.textContent = "Copy";
      }, 2000);
    });
  });
}