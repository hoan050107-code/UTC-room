/* ============================
    QUAN-LY-LICH-HOC
   =========================== */

function renderModule() {
  const searchQuery = (document.getElementById("schedule-search").value || "").trim().toLowerCase();
  const dateFilter = document.getElementById("schedule-date-filter").value;
  
  const filteredList = schedules.filter(s => {
    const matchesQuery = [s.subject, s.room, s.lecturer, s.className].join(" ").toLowerCase().includes(searchQuery);
    const matchesDate = !dateFilter || s.date === dateFilter;
    return matchesQuery && matchesDate;
  });

  const tbody = document.getElementById("schedule-list");
  if (!tbody) return;

  if (filteredList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-row">Không có lịch học phù hợp.</td></tr>';
    return;
  }

  tbody.innerHTML = filteredList.map(s => `
    <tr>
      <td>${formatDate(s.date)}</td>
      <td>${escapeHTML(s.subject)}</td>
      <td>${escapeHTML(s.room)}</td>
      <td>${escapeHTML(s.lecturer)}</td>
      <td>${escapeHTML(s.time)}</td>
      <td>${escapeHTML(s.className)}</td>
      <td>
        <button class="btn btn-small btn-delete" data-action="delete-schedule" data-id="${s.id}">
          Xóa
        </button>
      </td>
    </tr>
  `).join("");
}

function addSchedule() {
  if (!requireAdmin()) return;
  if (!rooms.length) return showToast("Hãy thêm phòng trước khi tạo lịch.");

  const date = prompt("Ngày học (YYYY-MM-DD):", todayString());
  if (date === null) return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
    return showToast("Ngày học không hợp lệ.");
  }

  const subject = prompt("Tên môn học:");
  if (subject === null) return;
  if (!subject.trim()) return showToast("Tên môn học không được để trống.");

  const roomOptions = rooms.map(r => r.code).join(", ");
  const roomInput = prompt(`Mã phòng (${roomOptions}):`, rooms[0].code);
  if (roomInput === null) return;

  const room = rooms.find(x => x.code.toLowerCase() === roomInput.trim().toLowerCase());
  if (!room) return showToast("Mã phòng không tồn tại.");
  if (room.status === "Bảo trì") return showToast("Phòng đang bảo trì, không thể xếp lịch.");

  const lecturer = prompt("Tên giảng viên:");
  if (lecturer === null) return;

  const time = prompt("Thời gian:", "07:00 - 09:30");
  if (time === null) return;

  const className = prompt("Tên lớp:");
  if (className === null) return;

  schedules.push({
    id: nextId(schedules),
    date,
    subject: subject.trim(),
    room: room.code,
    lecturer: lecturer.trim(),
    time: time.trim(),
    className: className.trim()
  });

  saveSchedules();
  renderModule();
  showToast("Đã thêm lịch học.");
}

function deleteSchedule(id) {
  if (!requireAdmin()) return;
  if (!confirm("Bạn có chắc muốn xóa lịch học này?")) return;

  schedules = schedules.filter(s => s.id !== id);
  saveSchedules();
  renderModule();
  showToast("Đã xóa lịch học.");
}

document.getElementById("add-schedule-btn")?.addEventListener("click", addSchedule);
document.getElementById("schedule-search")?.addEventListener("input", renderModule);
document.getElementById("schedule-date-filter")?.addEventListener("change", renderModule);

document.addEventListener("click", e => {
  const deleteBtn = e.target.closest('[data-action="delete-schedule"]');
  if (deleteBtn) {
    deleteSchedule(Number(deleteBtn.dataset.id));
  }
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