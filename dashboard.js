/* ============================================================
   AYUSETU — dashboards (patient-dashboard.html / doctor-dashboard.html)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const isPatientPage = !!document.getElementById('recent-cases');
  const isDoctorPage = !!document.getElementById('doctor-cases');

  const user = requireAuth(isDoctorPage ? 'doctor' : 'patient');
  if (!user) return;

  renderAppHeader({ active: 'home' });

  const firstName = (user.name || '').trim().split(/\s+/)[0] || 'there';
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetingEl = document.getElementById('greeting');
  if (greetingEl) greetingEl.textContent = `${timeGreeting}, ${firstName}.`;

  if (isPatientPage) renderPatientDashboard(user);
  if (isDoctorPage) renderDoctorDashboard(user);
});

function caseRowHtml(c, opts) {
  opts = opts || {};
  const otherPartyName = opts.otherPartyName || 'Unknown';
  const symptomLabel = c.symptoms && c.symptoms.length ? c.symptoms[0] : 'General concern';
  const href = opts.href || '#';
  const highClass = c.severity === 'high' ? 'high' : '';
  return `
    <a class="case-row ${highClass}" href="${href}">
      <div class="case-row-main">
        <div class="case-row-top">
          <span class="case-id">${escapeHtml(c.id)}</span>
          ${c.severity === 'high' ? '<span class="badge badge-high">High priority</span>' : ''}
          <span class="badge badge-navy badge-status">${escapeHtml(c.status)}</span>
        </div>
        <div class="case-row-symptom">${escapeHtml(symptomLabel)}</div>
        <div class="case-row-meta">${escapeHtml(opts.metaLabel || '')} ${escapeHtml(otherPartyName)} · ${escapeHtml(c.hospital || 'Hospital not set')}</div>
      </div>
      <div class="case-row-time">${formatRelativeTime(c.createdAt)}</div>
    </a>`;
}

function renderPatientDashboard(user) {
  const cases = casesForPatient(user.id);

  const doctorTile = document.getElementById('my-doctor-text');
  const hospitalTile = document.getElementById('my-hospital-text');
  const visitsTile = document.getElementById('visits-count-text');

  if (cases.length > 0) {
    const latest = cases[0];
    const doctor = findUserById(latest.doctorId);
    if (doctorTile) doctorTile.textContent = doctor ? `Dr. ${doctor.name} — ${doctor.specialization || 'General'}` : 'Doctor information unavailable.';
    if (hospitalTile) hospitalTile.textContent = latest.hospital || 'Hospital not set';
    if (visitsTile) visitsTile.textContent = `${cases.length} case${cases.length === 1 ? '' : 's'} on record.`;
  }

  const recentContainer = document.getElementById('recent-cases');
  if (!recentContainer) return;

  if (cases.length === 0) {
    emptyState(
      recentContainer,
      `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
      'No cases yet',
      'Start your first case and Ayusetu will guide you through it step by step.',
      '<a href="new-case.html" class="btn btn-accent">+ Start a new case</a>'
    );
    return;
  }

  recentContainer.innerHTML = cases.slice(0, 6).map(c => {
    const doctor = findUserById(c.doctorId);
    return caseRowHtml(c, {
      otherPartyName: doctor ? ('Dr. ' + doctor.name) : 'Doctor',
      metaLabel: 'with',
      href: `history.html?case=${encodeURIComponent(c.id)}`
    });
  }).join('');
}

function renderDoctorDashboard(user) {
  const cases = casesForDoctor(user.id);

  const newCount = cases.filter(c => c.status === 'submitted').length;
  const uniquePatients = new Set(cases.map(c => c.patientId)).size;
  const followUpCount = cases.filter(c => c.isFollowUp).length;
  const reviewedCount = cases.filter(c => c.status === 'reviewed').length;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('stat-new', newCount);
  set('stat-patients', uniquePatients);
  set('stat-followups', followUpCount);
  set('stat-reviewed', reviewedCount);

  const availBadge = document.getElementById('availability-badge');
  if (availBadge) availBadge.textContent = user.availability || 'Available';

  const container = document.getElementById('doctor-cases');
  const attention = cases.filter(c => c.status === 'submitted' || c.status === 'seen' || c.status === 'clarification');

  if (attention.length === 0) {
    emptyState(
      container,
      `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4M21 12a9 9 0 11-9-9 9 9 0 019 9z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
      'All caught up',
      'No cases are currently waiting on you. New submissions will appear here.'
    );
  } else {
    container.innerHTML = attention.map(c => {
      const patient = findUserById(c.patientId);
      const symptomLabel = c.symptoms && c.symptoms.length ? c.symptoms[0] : 'General concern';
      const highClass = c.severity === 'high' ? 'high' : '';
      return `
        <div class="case-row ${highClass}">
          <div class="case-row-main">
            <div class="case-row-top">
              <span class="case-id">${escapeHtml(c.id)}</span>
              ${c.severity === 'high' ? '<span class="badge badge-high">High priority</span>' : ''}
              <span class="badge badge-navy badge-status">${escapeHtml(c.status)}</span>
            </div>
            <div class="case-row-symptom">${escapeHtml(patient ? patient.name : 'Unknown patient')} — ${escapeHtml(symptomLabel)}</div>
            <div class="case-row-meta">${escapeHtml(c.hospital || '')}</div>
          </div>
          <div class="flex" style="flex-direction:column; align-items:flex-end; gap:8px;">
            <div class="case-row-time">${formatRelativeTime(c.createdAt)}</div>
            <a href="doctor-case.html?case=${encodeURIComponent(c.id)}" class="btn btn-outline btn-sm">Review case →</a>
          </div>
        </div>`;
    }).join('');
  }

  const scheduleList = document.getElementById('schedule-list');
  if (scheduleList) {
    const today = new Date().toDateString();
    const todays = cases.filter(c => new Date(c.createdAt).toDateString() === today);
    if (todays.length === 0) {
      scheduleList.innerHTML = `<p class="text-muted">No cases submitted today.</p>`;
    } else {
      scheduleList.innerHTML = todays.map(c => {
        const patient = findUserById(c.patientId);
        return `<div class="case-row"><div class="case-row-main">
          <div class="case-row-symptom">${escapeHtml(patient ? patient.name : 'Unknown patient')}</div>
          <div class="case-row-meta">${escapeHtml(c.symptoms && c.symptoms[0] ? c.symptoms[0] : '')}</div>
        </div><div class="case-row-time">${formatRelativeTime(c.createdAt)}</div></div>`;
      }).join('');
    }
  }
}
