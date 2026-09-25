import { test } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

test("TabLockGuard component file exists and configures hostbygroup3 passcode protection", () => {
  const guardPath = path.resolve(process.cwd(), "src", "components", "TabLockGuard.jsx");
  assert.ok(fs.existsSync(guardPath), "TabLockGuard.jsx must exist");

  const content = fs.readFileSync(guardPath, "utf-8");

  // Verify password hostbygroup3 is defined
  assert.ok(content.includes("hostbygroup3"), "Configures default password hostbygroup3");
  assert.ok(
    content.includes("toLowerCase()") && content.includes("trim()"),
    "Handles case-insensitive and trimmed password checking"
  );

  // Verify session storage usage
  assert.ok(content.includes("sessionStorage"), "Uses sessionStorage for lock state persistence");
  assert.ok(content.includes("tab_lock_"), "Uses tab_lock_ prefix for storage keys");

  // Verify re-lock capability
  assert.ok(
    content.includes("handleLockAgain") || content.includes("sessionStorage.removeItem"),
    "Provides re-lock mechanism to lock tab again"
  );
  assert.ok(content.includes("Khóa tab"), "Displays re-lock button label");

  // Verify custom event notification
  assert.ok(content.includes("tab-lock-changed"), "Dispatches tab-lock-changed event");
});

test("App.jsx wraps both chiecnon and truytimmanhghep tabs with TabLockGuard", () => {
  const appPath = path.resolve(process.cwd(), "src", "App.jsx");
  const content = fs.readFileSync(appPath, "utf-8");

  assert.ok(content.includes("TabLockGuard"), "App.jsx imports TabLockGuard");
  assert.ok(content.includes('tabId="chiecnon"'), "App.jsx protects chiecnon tab with TabLockGuard");
  assert.ok(content.includes('tabId="truytimmanhghep"'), "App.jsx protects truytimmanhghep tab with TabLockGuard");
  assert.ok(content.includes('password="hostbygroup3"'), "Passes hostbygroup3 to TabLockGuard");
});

test("Navbar.jsx contains clean links for chiecnon and truytimmanhghep without lock icon clutter", () => {
  const navbarPath = path.resolve(process.cwd(), "src", "game", "sections", "Navbar.jsx");
  const content = fs.readFileSync(navbarPath, "utf-8");

  assert.ok(content.includes("#chiecnon"), "Navbar includes #chiecnon link");
  assert.ok(content.includes("#truytimmanhghep"), "Navbar includes #truytimmanhghep link");
  assert.ok(!content.includes("🔒"), "Navbar does not display lock icon in links");
});
