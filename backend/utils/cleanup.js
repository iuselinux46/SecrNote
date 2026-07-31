const cron = require("node-cron");
const pool = require("../db/connection");

function startCleanupJob() {
  cron.schedule("* * * * *", async () => {
    try {
      const result = await pool.query(
        "DELETE FROM notes WHERE expires_at < NOW() RETURNING token"
      );
      if (result.rowCount > 0) {
        console.log(`Cleanup: deleted ${result.rowCount} expired note(s)`);
      }
    } catch (err) {
      console.error("Cleanup job error:", err.message);
    }
  });

  console.log("Cleanup job started — checking for expired notes every minute");
}

module.exports = { startCleanupJob };