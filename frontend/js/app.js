const SecrNote = {
  API_URL: "https://secrnote-backend.onrender.com/api",
  BASE_URL: "https://secr-note.vercel.app",

  // AES-256 encrypt using crypto-js
  encrypt(plainText, passphrase) {
    return CryptoJS.AES.encrypt(plainText, passphrase).toString();
  },

  // AES-256 decrypt — returns null if passphrase is wrong
  decrypt(cipherText, passphrase) {
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, passphrase);
      const result = bytes.toString(CryptoJS.enc.Utf8);
      return result ? result : null;
    } catch (e) {
      return null;
    }
  },

  formatTimestamp(date = new Date()) {
    return date.toISOString().slice(0, 19).replace("T", " ") + " UTC";
  },
};

// Theme Toggle
const themeToggle = document.getElementById("themeToggle");

function setTheme(theme) {
  const root = document.documentElement;

  root.setAttribute("data-theme", theme);

  // Save user's choice
  localStorage.setItem("secrnote-theme", theme);

  updateThemeIcon(theme);
}

function updateThemeIcon(theme) {
  if (!themeToggle) return;

  const moonIcon = themeToggle.querySelector(".moon-icon");
  const sunIcon = themeToggle.querySelector(".sun-icon");

  if (theme === "light") {
    // Currently light -> show sun
    moonIcon.style.display = "none";
    sunIcon.style.display = "block";

    themeToggle.setAttribute(
      "aria-label",
      "Switch to dark mode"
    );
  } else {
    // Currently dark -> show moon
    moonIcon.style.display = "block";
    sunIcon.style.display = "none";

    themeToggle.setAttribute(
      "aria-label",
      "Switch to light mode"
    );
  }
}

// Load saved theme
const savedTheme = localStorage.getItem("secrnote-theme");

if (savedTheme) {
  setTheme(savedTheme);
} else {
  // Default theme
  setTheme("dark");
}

// Toggle theme
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme =
      document.documentElement.getAttribute("data-theme");

    const newTheme =
      currentTheme === "light"
        ? "dark"
        : "light";

    setTheme(newTheme);
  });
}