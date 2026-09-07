/* ============================================================
   AYUSETU — doctor case review (doctor-case.html)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const user = requireAuth('doctor');
  if (!user) return;
  renderAppHeader({});

  const params = new URLSearchParams(window.location.search);
  const caseId = params.get('case');
  const container = document.getElementById('case-content');

  const theCase = caseId ? getCaseById(caseId) : null;

  if (!theCase || theCase.doctorId !== user.id) {
    emptyState(
      container,
      `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/></svg>`,
      'Case not found',
      'This case doesn\'t exist or isn\'t assigned to you.',
      '<a href="doctor-dashboard.html" class="btn btn-primary">Back to dashboard</a>'
    );
    return;
  }

  // Opening a submitted case marks it seen and notifies the patient once.
  if (theCase.status === 'submitted') {
    updateCaseStatus(theCase, 'seen');
    addNotification(theCase.patientId, `Dr. ${user.name} saw your case "${theCase.chiefConcern}".`, 'case', `history.html?case=${theCase.id}`);
  }

  render(theCase, user);
});

function updateCaseStatus(theCase, status) {
  const cases = getCases();
  const idx = cases.findIndex(c => c.id === theCase.id);
  if (idx === -1) return;
  cases[idx].status = status;
  saveCases(cases);
  theCase.status = status;
}

function saveDoctorNotes(theCase, notes) {
  const cases = getCases();
  const idx = cases.findIndex(c => c.id === theCase.id);
  if (idx === -1) return;
  cases[idx].doctorNotes = notes;
  saveCases(cases);
  theCase.doctorNotes = notes;
}

function render(theCase, doctor) {
  const container = document.getElementById('case-content');
  const patient = findUserById(theCase.patientId);
  const history = casesForPatient(theCase.patientId).filter(c => c.id !== theCase.id);

  container.innerHTML = `
    <div class="page-head">
      <div class="eyebrow">${escapeHtml(theCase.id)}</div>
      <h1>${escapeHtml(patient ? patient.name : 'Unknown patient')}</h1>
      <p>${escapeHtml(theCase.chiefConcern)} · ${theCase.severity === 'high' ? '<span class="badge badge-high">High priority</span>' : '<span class="badge badge-navy">Normal</span>'} · <span class="badge badge-navy badge-status">${escapeHtml(theCase.status)}</span></p>
    </div>

    <div class="card card-pad mb-0" style="margin-bottom:20px;">
      <div class="summary-section">
        <h4>Patient story</h4>
        <p>${escapeHtml(theCase.story)}</p>
      </div>
      <div class="summary-section">
        <h4>Hospital</h4>
        <p>${escapeHtml(theCase.hospital || 'Not set')}</p>
      </div>
      <div class="summary-section">
        <h4>Submitted</h4>
        <p>${escapeHtml(formatDate(theCase.createdAt))} (${escapeHtml(formatRelativeTime(theCase.createdAt))})</p>
      </div>
      <div class="summary-section">
        <h4>Guided responses</h4>
        <div class="summary-qa">
          ${theCase.questions.map((q, i) => `
            <div class="summary-qa-item">
              <div class="q">${escapeHtml(q)}</div>
              <div class="a">${escapeHtml(theCase.answers[i] || 'Not answered')}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>

    <div class="card card-pad" style="margin-bottom:20px;">
      <h4 style="font-size:0.78rem; font-weight:700; letter-spacing:0.02em; color:var(--teal); text-transform:uppercase; margin-bottom:12px;">Doctor notes / prescription note</h4>
      <div class="field mb-0">
        <textarea id="doctor-notes" rows="5" placeholder="Add consultation notes, diagnosis, or prescription details…">${escapeHtml(theCase.doctorNotes || '')}</textarea>
      </div>
      <div class="flex gap-12 mt-16" style="flex-wrap:wrap;">
        <button class="btn btn-outline btn-sm" id="save-notes-btn">Save notes</button>
        <button class="btn btn-outline btn-sm" id="clarify-btn">Request clarification</button>
        <button class="btn btn-accent btn-sm" id="reviewed-btn">Mark reviewed</button>
      </div>
      <div class="form-msg success" id="save-msg">Saved.</div>
    </div>

    <div class="section-title">Previous history — ${escapeHtml(patient ? patient.name : '')}</div>
    <div id="history-list"></div>
  `;

  const historyList = document.getElementById('history-list');
  if (history.length === 0) {
    emptyState(historyList,
      `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" stroke-width="1.6"/></svg>`,
      'No previous history',
      'This is the first case Ayusetu has on record for this patient.'
    );
  } else {
    historyList.innerHTML = history.map(c => `
      <div class="case-row ${c.severity === 'high' ? 'high' : ''}">
        <div class="case-row-main">
          <div class="case-row-top">
            <span class="case-id">${escapeHtml(c.id)}</span>
            <span class="badge badge-navy badge-status">${escapeHtml(c.status)}</span>
          </div>
          <div class="case-row-symptom">${escapeHtml(c.chiefConcern)}</div>
          <div class="case-row-meta">${escapeHtml(c.hospital || '')}</div>
        </div>
        <div class="case-row-time">${escapeHtml(formatDate(c.createdAt))}</div>
      </div>
    `).join('');
  }

  document.getElementById('save-notes-btn').addEventListener('click', () => {
    saveDoctorNotes(theCase, document.getElementById('doctor-notes').value.trim());
    flashSaved('Notes saved.');
  });

  document.getElementById('clarify-btn').addEventListener('click', () => {
    saveDoctorNotes(theCase, document.getElementById('doctor-notes').value.trim());
    updateCaseStatus(theCase, 'clarification');
    addNotification(theCase.patientId, `Dr. ${doctor.name} requested clarification on "${theCase.chiefConcern}".`, 'case', `history.html?case=${theCase.id}`);
    flashSaved('Clarification requested — the patient has been notified.');
    render(theCase, doctor);
  });

  document.getElementById('reviewed-btn').addEventListener('click', () => {
    saveDoctorNotes(theCase, document.getElementById('doctor-notes').value.trim());
    updateCaseStatus(theCase, 'reviewed');
    addNotification(theCase.patientId, `Dr. ${doctor.name} reviewed your case "${theCase.chiefConcern}". Consultation complete.`, 'case', `history.html?case=${theCase.id}`);
    flashSaved('Case marked reviewed.');
    render(theCase, doctor);
  });
}

function flashSaved(msg) {
  const el = document.getElementById('save-msg');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2600);
}
