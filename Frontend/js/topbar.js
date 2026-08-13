// topbar.js - dropdown user di kanan atas
// dipakai di semua halaman yang punya .topbar-user

function initUserMenu() {
  const btn = document.getElementById("userMenuBtn");
  const menu = document.getElementById("userMenu");
  const logoutBtn = document.getElementById("logoutBtn");
  if (!btn || !menu) return;

  function closeMenu() {
    menu.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  }

  function toggleMenu() {
    const isOpen = menu.classList.toggle("open");
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
}

// TODO backend: ganti isi fungsi ini kalo auth udah jadi.
// saran: panggil endpoint logout (misal POST /logout atau Api.logout()),
// hapus token/session yang kepake, baru redirect ke index.html.
function handleLogout() {
  // sementara (belum ada backend): cuma balikin ke halaman awal
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", initUserMenu);
