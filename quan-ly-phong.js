/* ========================
       QUAN-LY-PHONG
   ========================= */

function renderModule() {
  const searchQuery = (document.getElementById("room-search")?.value || "").trim().toLowerCase();
  const statusFilter = document.getElementById("room-filter")?.value || "";

  
  const filteredRooms = rooms.filter(r => {
    const matchesSearch = r.code.toLowerCase().includes(searchQuery) || r.name.toLowerCase().includes(searchQuery);
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tbody = document.getElementById("room-list");
  if (!tbody) return;

  if (filteredRooms.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-row">Không tìm thấy phòng học.</td></tr>';
    return;
  }

  tbody.innerHTML = filteredRooms.map(r => `
    <tr>
      <td><b>${escapeHTML(r.code)}</b></td>
      <td>${escapeHTML(r.name)}</td>
      <td>${r.capacity} người</td>
      <td>${escapeHTML(r.type)}</td>
      <td>${escapeHTML(r.location)}</td>
      <td>${statusBadge(r.status)}</td>
      <td>
        <button class="btn btn-small btn-edit" data-action="edit-room" data-id="${r.id}">Sửa</button>
        <button class="btn btn-small btn-delete" data-action="delete-room" data-id="${r.id}">Xóa</button>
      </td>
    </tr>
  `).join("");
}


function addRoom() {
  if (!requireAdmin()) return;

  const codeInput = prompt("Mã phòng, ví dụ A103:");
  if (codeInput === null) return;
  const code = codeInput.trim().toUpperCase();
  if (!code) return showToast("Mã phòng không được để trống.");
  if (rooms.some(r => r.code.toLowerCase() === code.toLowerCase())) {
    return showToast("Mã phòng đã tồn tại.");
  }

  const nameInput = prompt("Tên phòng:");
  if (nameInput === null) return;
  const name = nameInput.trim();
  if (!name) return showToast("Tên phòng không được để trống.");

  const capInput = prompt("Sức chứa:", "40");
  if (capInput === null) return;
  const capacity = Number(capInput);
  if (!Number.isInteger(capacity) || capacity <= 0) {
    return showToast("Sức chứa phải là số nguyên dương.");
  }

  const typeInput = prompt("Loại phòng:", "Phòng lý thuyết");
  if (typeInput === null) return;

  const locationInput = prompt("Vị trí:", "Nhà A");
  if (locationInput === null) return;

  rooms.push({
    id: nextId(rooms),
    code,
    name,
    capacity,
    type: typeInput.trim() || "Phòng học",
    location: locationInput.trim() || "Chưa cập nhật",
    status: "Sẵn sàng"
  });

  saveRooms();
  renderModule();
  showToast("Đã thêm phòng học.");
}

function editRoom(id) {
  if (!requireAdmin()) return;
  const room = rooms.find(x => x.id === id);
  if (!room) return;


  const nameInput = prompt("Tên phòng:", room.name);
  if (nameInput === null) return;
  const name = nameInput.trim();
  if (!name) return showToast("Tên phòng không được để trống.");

  const capInput = prompt("Sức chứa:", room.capacity);
  if (capInput === null) return;
  const capacity = Number(capInput);
  if (!Number.isInteger(capacity) || capacity <= 0) {
    return showToast("Sức chứa không hợp lệ.");
  }

  const typeInput = prompt("Loại phòng:", room.type);
  if (typeInput === null) return;

  const locationInput = prompt("Vị trí:", room.location);
  if (locationInput === null) return;

  const statusInput = prompt("Trạng thái: Sẵn sàng / Đang sử dụng / Bảo trì", room.status);
  if (statusInput === null) return;
  const status = statusInput.trim();
  if (!["Sẵn sàng", "Đang sử dụng", "Bảo trì"].includes(status)) {
    return showToast("Trạng thái không hợp lệ.");
  }


  Object.assign(room, {
    name,
    capacity,
    type: typeInput.trim(),
    location: locationInput.trim(),
    status
  });

  saveRooms();
  renderModule();
  showToast("Đã cập nhật phòng.");
}

function deleteRoom(id) {
  if (!requireAdmin()) return;
  const room = rooms.find(x => x.id === id);
  if (!room) return;


  const isUsedInSchedules = schedules.some(s => s.room === room.code);
  const isUsedInEquipment = equipment.some(e => e.room === room.code);
  if (isUsedInSchedules || isUsedInEquipment) {
    return showToast("Không thể xóa phòng đang được dùng trong lịch học hoặc thiết bị.");
  }

  if (!confirm(`Xóa phòng ${room.code}?`)) return;

  rooms = rooms.filter(x => x.id !== id);
  saveRooms();
  renderModule();
  showToast("Đã xóa phòng học.");
}


document.getElementById("add-room-btn")?.addEventListener("click", addRoom);
document.getElementById("room-search")?.addEventListener("input", renderModule);
document.getElementById("room-filter")?.addEventListener("change", renderModule);

document.addEventListener("click", e => {
  const actionButton = e.target.closest("[data-action]");
  if (!actionButton) return;

  const action = actionButton.dataset.action;
  const id = Number(actionButton.dataset.id);

  if (action === "edit-room") editRoom(id);
  if (action === "delete-room") deleteRoom(id);
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