/* ====================
         BÁO CÁO
    =================== */

function renderModule() {

  document.getElementById("report-total-rooms").textContent = rooms.length;
  document.getElementById("report-total-schedules").textContent = schedules.length;
  document.getElementById("report-total-equipment").textContent = equipment.reduce((s, e) => s + Number(e.quantity || 0), 0);

  const roomStatuses = ["Sẵn sàng", "Đang sử dụng", "Bảo trì"];
  document.getElementById("room-statistics").innerHTML = roomStatuses.map(st => {
    const count = rooms.filter(r => r.status === st).length;
    const percent = rooms.length ? Math.round((count / rooms.length) * 100) : 0;
    return `
      <div class="stat-line">
        <span>${escapeHTML(st)}</span>
        <div class="progress">
          <div class="progress-bar" style="width: ${percent}%"></div>
        </div>
        <strong>${count}</strong>
      </div>
    `;
  }).join("");

  const equipmentStatuses = ["Hoạt động tốt", "Cần sửa chữa"];
  const totalEquipment = equipment.length;
  document.getElementById("equipment-statistics").innerHTML = equipmentStatuses.map(st => {
    const count = equipment.filter(e => e.status === st).length;
    const percent = totalEquipment ? Math.round((count / totalEquipment) * 100) : 0;
    return `
      <div class="stat-line">
        <span>${escapeHTML(st)}</span>
        <div class="progress">
          <div class="progress-bar" style="width: ${percent}%"></div>
        </div>
        <strong>${count}</strong>
      </div>
    `;
  }).join("");
}

function exportReport() {
  if (!requireAdmin()) return;

  const rows = [["Loại dữ liệu", "Tên/Mã", "Thông tin", "Trạng thái"]];

  rooms.forEach(r => {
    rows.push([
      "Phòng",
      r.code,
      `${r.name} - ${r.capacity} người - ${r.location}`,
      r.status
    ]);
  });

  schedules.forEach(s => {
    rows.push([
      "Lịch học",
      s.subject,
      `${s.date} - ${s.room} - ${s.lecturer} - ${s.time}`,
      s.className
    ]);
  });

  equipment.forEach(e => {
    rows.push([
      "Thiết bị",
      e.name,
      `${e.room} - Số lượng: ${e.quantity}`,
      e.status
    ]);
  });

  const csv = "\uFEFF" + rows.map(row => 
    row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
  ).join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bao-cao-utc-room.csv";
  a.click();
  
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast("Đã xuất báo cáo CSV.");
}

document.getElementById("export-report-btn").addEventListener("click", exportReport);

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