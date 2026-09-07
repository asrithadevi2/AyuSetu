/* ============================================================
   AYUSETU — medical history (history.html)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const user = requireAuth('patient');
  if (!user) return;
  renderAppHeader({});

  const params = new URLSearchParams(window.location.search);
  const focusCaseId = params.get('case');

  const cases = casesForPatient(user.id);
  const listEl = document.getElementById('history-list');
  const detailEl = document.getElementById('history-detail');

  if (cases.length === 0) {
    emptyState(listEl,
      `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" stroke-width="1.6"/></svg>`,
      'No history yet',
      'Once you submit a case, it will appear here for you and your doctor to reference.',
      '<a href="new-case.html" class="btn btn-accent">+ Start a new case</a>'
    );
    return;
  }

  function renderList() {
    listEl.innerHTML = cases.map(c => {
      const doctor = findUserById(c.doctorId);
      return `
        <div class="case-row ${c.severity === 'high' ? 'high' : ''}" data-case="${c.id}" style="cursor:pointer;">
          <div class="case-row-main">
            <div class="case-row-top">
              <span class="case-id">${escapeHtml(c.id)}</span>
              ${c.severity === 'high' ? '<span class="badge badge-high">High priority</span>' : ''}
              <span class="badge badge-navy badge-status">${escapeHtml(c.status)}</span>
              ${c.isFollowUp ? '<span class="badge badge-mint">Follow-up</span>' : ''}
            </div>
            <div class="case-row-symptom">${escapeHtml(c.chiefConcern)}</div>
            <div class="case-row-meta">Dr. ${escapeHtml(doctor ? doctor.name : 'Unknown')} · ${escapeHtml(c.hospital || '')}</div>
          </div>
          <div class="case-row-time">${escapeHtml(formatDate(c.createdAt))}</div>
        </div>`;
    }).join('');

    listEl.querySelectorAll('[data-case]').forEach(row => {
      row.addEventListener('click', () => showDetail(row.dataset.case));
    });
  }

  function showDetail(caseId) {
    const c = cases.find(x => x.id === caseId);
    if (!c) return;
    const doctor = findUserById(c.doctorId);

    detailEl.classList.remove('hidden');
    listEl.classList.add('hidden');

    detailEl.innerHTML = `
      <button class="btn btn-ghost btn-sm mt-8" id="back-to-list" style="margin-bottom:18px;">← Back to history</button>
      <div class="card card-pad">
        <div class="page-head" style="margin-bottom:20px;">
          <div class="eyebrow">${escapeHtml(c.id)}</div>
          <h1 style="font-size:1.5rem;">${escapeHtml(c.chiefConcern)}</h1>
          <p>${c.severity === 'high' ? '<span class="badge badge-high">High priority</span>' : '<span class="badge badge-navy">Normal</span>'} <span class="badge badge-navy badge-status">${escapeHtml(c.status)}</span></p>
        </div>
        <div class="summary-section"><h4>Doctor</h4><p>Dr. ${escapeHtml(doctor ? doctor.name : 'Unknown')} · ${escapeHtml(doctor ? doctor.specialization : '')}</p></div>
        <div class="summary-section"><h4>Hospital</h4><p>${escapeHtml(c.hospital || 'Not set')}</p></div>
        <div class="summary-section"><h4>Submitted</h4><p>${escapeHtml(formatDate(c.createdAt))}</p></div>
        <div class="summary-section"><h4>Your story</h4><p>${escapeHtml(c.story)}</p></div>
        <div class="summary-section">
          <h4>Guided responses</h4>
          <div class="summary-qa">
            ${c.questions.map((q, i) => `
              <div class="summary-qa-item">
                <div class="q">${escapeHtml(q)}</div>
                <div class="a">${escapeHtml(c.answers[i] || 'Not answered')}</div>
              </div>`).join('')}
          </div>
        </div>
        ${c.doctorNotes ? `<div class="summary-section"><h4>Doctor notes</h4><p>${escapeHtml(c.doctorNotes)}</p></div>` : ''}
        <div class="flex gap-12 mt-24">
          <a href="messages.html?case=${encodeURIComponent(c.id)}" class="btn btn-outline btn-sm">Message doctor</a>
        </div>
      </div>
    `;

    document.getElementById('back-to-list').addEventListener('click', () => {
      detailEl.classList.add('hidden');
      listEl.classList.remove('hidden');
      history.pushState({}, '', 'history.html');
    });
  }

  renderList();
  if (focusCaseId && cases.some(c => c.id === focusCaseId)) {
    showDetail(focusCaseId);
  }
});
