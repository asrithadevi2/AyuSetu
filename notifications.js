/* ============================================================
   AYUSETU — notifications (notifications.html)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const user = requireAuth();
  if (!user) return;
  renderAppHeader({});

  render();

  document.getElementById('mark-all-read').addEventListener('click', () => {
    const all = getNotifications();
    all.forEach(n => { if (n.userId === user.id) n.read = true; });
    saveNotifications(all);
    render();
    renderAppHeader({});
  });

  function render() {
    const list = notificationsForUser(user.id);
    const container = document.getElementById('notif-list');

    if (list.length === 0) {
      emptyState(container,
        `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        'You\'re all caught up',
        'Notifications about your cases and messages will appear here.'
      );
      return;
    }

    container.innerHTML = list.map(n => `
      <a class="notif-item ${n.read ? '' : 'unread'}" href="${n.link || '#'}" data-id="${n.id}">
        <div class="notif-icon">${iconForType(n.type)}</div>
        <div class="notif-body">
          <p>${escapeHtml(n.message)}</p>
          <span>${escapeHtml(formatRelativeTime(n.createdAt))}</span>
        </div>
      </a>
    `).join('');

    container.querySelectorAll('.notif-item').forEach(item => {
      item.addEventListener('click', () => {
        const all = getNotifications();
        const target = all.find(n => n.id === item.dataset.id);
        if (target) { target.read = true; saveNotifications(all); }
      });
    });
  }
});

function iconForType(type) {
  const icons = {
    case: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" stroke-width="1.6"/></svg>',
    message: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M12 8v.01M12 11v5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
  };
  return icons[type] || icons.info;
}
