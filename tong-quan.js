/* =======================
          TONG-QUAN 
   ==================== */

function renderModule() {

  const totalRoomsEl = document.getElementById("total-rooms");
  const todaySchedulesEl = document.getElementById("today-schedules");
  const totalEquipmentEl = document.getElementById("total-equipment");

  if (totalRoomsEl) totalRoomsEl.textContent = rooms.length;
  if (todaySchedulesEl) {
    todaySchedulesEl.textContent = schedules.filter(x => x.date === todayString()).length;
  }
  if (totalEquipmentEl) {
    totalEquipmentEl.textContent = equipment.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }


  const roomListBody = document.getElementById("dashboard-room-list");
  if (roomListBody) {
    roomListBody.innerHTML = rooms.slice(0, 5).map(r => `
      <tr>
        <td><b>${escapeHTML(r.code)}</b></td>
        <td>${escapeHTML(r.name)}</td>
        <td>${r.capacity} người</td>
        <td>${escapeHTML(r.type)}</td>
        <td>${statusBadge(r.status)}</td>
      </tr>
    `).join("") || '<tr><td colspan="5" class="empty-row">Chưa có phòng học.</td></tr>';
  }


  const scheduleListBody = document.getElementById("dashboard-schedule-list");
  if (scheduleListBody) {
    const sortedSchedules = [...schedules].sort((a, b) => a.date.localeCompare(b.date));
    scheduleListBody.innerHTML = sortedSchedules.slice(0, 5).map(s => `
      <tr>
        <td>${formatDate(s.date)}</td>
        <td>${escapeHTML(s.subject)}</td>
        <td>${escapeHTML(s.room)}</td>
        <td>${escapeHTML(s.lecturer)}</td>
        <td>${escapeHTML(s.time)}</td>
        <td>${escapeHTML(s.className)}</td>
      </tr>
    `).join("") || '<tr><td colspan="6" class="empty-row">Chưa có lịch học.</td></tr>';
  }
}

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