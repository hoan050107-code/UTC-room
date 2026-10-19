/* ==========================================================
   UTC ROOM — JAVASCRIPT DÙNG CHUNG CHO CẢ 5 MODULE
   ========================================================== */

const ADMIN_ACCOUNT = "admin";
const ADMIN_PASSWORD = "UTC@2026";
const AUTH_SESSION_KEY = "utc_room_admin_session";
const STORAGE = { 
  rooms: "utc_rooms", 
  schedules: "utc_schedules", 
  equipment: "utc_equipment" 
};

const todayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const defaultRooms = [
  { id: 1, code: "A101", name: "Phòng học A101", capacity: 60, type: "Phòng lý thuyết", location: "Nhà A - Tầng 1", status: "Sẵn sàng" },
  { id: 2, code: "A202", name: "Phòng học A202", capacity: 45, type: "Phòng lý thuyết", location: "Nhà A - Tầng 2", status: "Đang sử dụng" },
  { id: 3, code: "B105", name: "Phòng máy B105", capacity: 40, type: "Phòng máy tính", location: "Nhà B - Tầng 1", status: "Sẵn sàng" },
  { id: 4, code: "C301", name: "Phòng thực hành C301", capacity: 35, type: "Phòng thực hành", location: "Nhà C - Tầng 3", status: "Bảo trì" }
];

const defaultSchedules = [
  { id: 1, date: todayString(), subject: "Cơ sở dữ liệu", room: "A101", lecturer: "Nguyễn Văn An", time: "07:00 - 09:30", className: "CNTT01" },
  { id: 2, date: todayString(), subject: "Lập trình Web", room: "B105", lecturer: "Trần Thị Mai", time: "09:45 - 12:00", className: "CNTT02" }
];

const defaultEquipment = [
  { id: 1, name: "Máy chiếu", room: "A101", quantity: 1, status: "Hoạt động tốt" },
  { id: 2, name: "Máy tính", room: "B105", quantity: 40, status: "Hoạt động tốt" },
  { id: 3, name: "Điều hòa", room: "A202", quantity: 2, status: "Cần sửa chữa" },
  { id: 4, name: "Bảng viết", room: "A101", quantity: 1, status: "Hoạt động tốt" }
];

function loadData(key, fallback) {
  try { 
    const value = localStorage.getItem(key); 
    return value ? JSON.parse(value) : structuredClone(fallback); 
  } catch (e) { 
    console.error("Không đọc được dữ liệu", e); 
    return structuredClone(fallback); 
  }
}

function saveData(key, value) { 
  localStorage.setItem(key, JSON.stringify(value)); 
}

let rooms = loadData(STORAGE.rooms, defaultRooms);
let schedules = loadData(STORAGE.schedules, defaultSchedules);
let equipment = loadData(STORAGE.equipment, defaultEquipment);

function saveRooms() { 
  saveData(STORAGE.rooms, rooms); 
}

function saveSchedules() { 
  saveData(STORAGE.schedules, schedules); 
}

function saveEquipment() { 
  saveData(STORAGE.equipment, equipment); 
}

function nextId(items) {
  return items.length ? Math.max(...items.map(x => Number(x.id) || 0)) + 1 : 1;
}


function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function formatDate(date) {
  if (!date) return "-";
  const p = date.split("-");
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : escapeHTML(date);
}

let toastTimer;
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function statusClass(status) {
  return ({
    "Sẵn sàng": "available",
    "Đang sử dụng": "using",
    "Bảo trì": "maintenance",
    "Hoạt động tốt": "good",
    "Cần sửa chữa": "repair"
  })[status] || "";
}

function statusBadge(status) {
  return `<span class="status ${statusClass(status)}">${escapeHTML(status)}</span>`;
}


function isAdminLoggedIn() {
  return sessionStorage.getItem(AUTH_SESSION_KEY) === "admin";
}

function showLoginPage() {
  const modal = document.getElementById("adminLoginPage");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.getElementById("adminUsername")?.focus();
}

function updateAuthButtons() {
  const logged = isAdminLoggedIn();
  document.getElementById("adminLoginButton")?.classList.toggle("hidden", logged);
  document.getElementById("adminLogoutButton")?.classList.toggle("hidden", !logged);
}

function requireAdmin() {
  if (isAdminLoggedIn()) return true;
  showLoginPage();
  showToast("Vui lòng đăng nhập bằng tài khoản quản trị viên.");
  return false;
}

function logoutAdmin() {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
  document.getElementById("adminLoginForm")?.reset();
  const msg = document.getElementById("loginMessage");
  if (msg) msg.textContent = "";
  updateAuthButtons();
  showToast("Bạn đã đăng xuất tài khoản quản trị.");
}

function setupAdminLogin() {
  const form = document.getElementById("adminLoginForm");
  
  form?.addEventListener("submit", event => {
    event.preventDefault();
    const user = document.getElementById("adminUsername").value.trim();
    const pass = document.getElementById("adminPassword").value;
    const msg = document.getElementById("loginMessage");
    
    if (user === ADMIN_ACCOUNT && pass === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_SESSION_KEY, "admin");
      if (msg) msg.textContent = "";
      
      document.getElementById("adminLoginPage")?.classList.add("hidden");
      document.getElementById("adminLoginPage")?.setAttribute("aria-hidden", "true");
      
      updateAuthButtons();
      showToast("Đăng nhập quản trị thành công.");
      
      if (typeof renderModule === "function") {
        renderModule();
      }
    } else {
      if (msg) msg.textContent = "Tên đăng nhập hoặc mật khẩu không đúng.";
      document.getElementById("adminPassword").value = "";
    }
  });

  document.getElementById("adminLoginButton")?.addEventListener("click", showLoginPage);
  document.getElementById("adminLogoutButton")?.addEventListener("click", logoutAdmin);
  
  document.getElementById("closeLoginButton")?.addEventListener("click", () => {
    document.getElementById("adminLoginPage")?.classList.add("hidden");
    document.getElementById("adminLoginPage")?.setAttribute("aria-hidden", "true");
  });

  document.getElementById("adminLoginPage")?.addEventListener("click", e => {
    if (e.target.id === "adminLoginPage") {
      e.currentTarget.classList.add("hidden");
      e.currentTarget.setAttribute("aria-hidden", "true");
    }
  });
}