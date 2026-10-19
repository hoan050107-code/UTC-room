/* =============================
   MODULE: QUAN-LY-THIET-BI
   ============================= */

function renderModule() {
  const searchQuery = (document.getElementById("equipment-search")?.value || "").trim().toLowerCase();
  const statusFilter = document.getElementById("equipment-filter")?.value || "";

  const filteredList = equipment.filter(x => {
    const matchesSearch = x.name.toLowerCase().includes(searchQuery) || x.room.toLowerCase().includes(searchQuery);
    const matchesStatus = !statusFilter || x.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tbody = document.getElementById("equipment-list");
  if (!tbody) return;

  if (filteredList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-row">Không tìm thấy thiết bị.</td></tr>';
    return;
  }

  tbody.innerHTML = filteredList.map(x => `
    <tr>
      <td>${escapeHTML(x.name)}</td>
      <td>${escapeHTML(x.room)}</td>
      <td>${x.quantity}</td>
      <td>${statusBadge(x.status)}</td>
      <td>
        <button class="btn btn-small btn-edit" data-action="toggle-equipment" data-id="${x.id}">Đổi tình trạng</button>
        <button class="btn btn-small btn-delete" data-action="delete-equipment" data-id="${x.id}">Xóa</button>
      </td>
    </tr>
  `).join("");
}

function addEquipment() {
  if (!requireAdmin()) return;

  const nameInput = prompt("Tên thiết bị:");
  if (nameInput === null) return;
  const name = nameInput.trim();
  if (!name) return showToast("Tên thiết bị không được để trống.");

  if (!rooms.length) return showToast("Cần có phòng học trước khi thêm thiết bị.");

  const roomOptions = rooms.map(r => r.code).join(", ");
  const roomInput = prompt(`Mã phòng (${roomOptions}):`, rooms[0].code);
  if (roomInput === null) return;

  const room = rooms.find(x => x.code.toLowerCase() === roomInput.trim().toLowerCase());
  if (!room) return showToast("Mã phòng không tồn tại.");

  const qtyInput = prompt("Số lượng:", "1");
  if (qtyInput === null) return;
  const quantity = Number(qtyInput);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return showToast("Số lượng phải là số nguyên dương.");
  }

  const statusInput = prompt("Tình trạng: Hoạt động tốt / Cần sửa chữa", "Hoạt động tốt");
  if (statusInput === null) return;
  const status = statusInput.trim();
  if (!["Hoạt động tốt", "Cần sửa chữa"].includes(status)) {
    return showToast("Tình trạng không hợp lệ.");
  }


  equipment.push({
    id: nextId(equipment),
    name,
    room: room.code,
    quantity,
    status
  });

  saveEquipment();
  renderModule();
  showToast("Đã thêm thiết bị.");
}

function toggleEquipment(id) {
  if (!requireAdmin()) return;
  const item = equipment.find(e => e.id === id);
  if (!item) return;


  item.status = item.status === "Hoạt động tốt" ? "Cần sửa chữa" : "Hoạt động tốt";
  
  saveEquipment();
  renderModule();
  showToast("Đã cập nhật tình trạng thiết bị.");
}

function deleteEquipment(id) {
  if (!requireAdmin()) return;
  const item = equipment.find(e => e.id === id);
  if (!item) return;

  if (!confirm(`Xóa thiết bị ${item.name}?`)) return;

  equipment = equipment.filter(e => e.id !== id);
  saveEquipment();
  renderModule();
  showToast("Đã xóa thiết bị.");
}


document.getElementById("add-equipment-btn")?.addEventListener("click", addEquipment);
document.getElementById("equipment-search")?.addEventListener("input", renderModule);
document.getElementById("equipment-filter")?.addEventListener("change", renderModule);

document.addEventListener("click", e => {
  const actionButton = e.target.closest("[data-action]");
  if (!actionButton) return;

  const id = Number(actionButton.dataset.id);
  const action = actionButton.dataset.action;

  if (action === "toggle-equipment") toggleEquipment(id);
  if (action === "delete-equipment") deleteEquipment(id);
});


document.addEventListener("DOMContentLoaded", () => {
  const todayElement = document.getElementById("today");
  if (todayElement) {
    todayElement.textContent = new Date().toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  setupAdminLogin();
  updateAuthButtons();
  renderModule();
});