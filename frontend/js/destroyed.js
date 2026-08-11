const ts      = sessionStorage.getItem("secrnote_destroyed_at");
const receipt = sessionStorage.getItem("secrnote_receipt") === "true";
const email   = sessionStorage.getItem("secrnote_receipt_email");

if (!ts) {
  document.querySelector(".card").style.display = "none";
  document.getElementById("emptyState").style.display = "block";
} else {
  document.getElementById("destroyedTimestamp").textContent = `Destroyed at: ${ts}`;

  if (receipt && email) {
    document.getElementById("receiptBadgeWrap").innerHTML = `
      <div class="receipt-badge">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
        Read receipt sent to <strong>${email}</strong>
      </div>
    `;
  }

  document.getElementById("newNoteBtn").addEventListener("click", () => {
    sessionStorage.clear();
  });
}