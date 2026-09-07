/* ============================================================
   AYUSETU — follow-up (follow-up.html)
   ============================================================ */

let fuUser = null;
let fuOriginalCase = null;
let fuText = '';

document.addEventListener('DOMContentLoaded', () => {
  fuUser = requireAuth('patient');
  if (!fuUser) return;
  renderAppHeader({});

  const cases = casesForPatient(fuUser.id);
  const listEl = document.getElementById('previous-case-list');

  if (cases.length === 0) {
    emptyState(listEl,
      `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 12a8 8 0 118 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
      'No previous cases',
      'You need at least one existing case before you can start a follow-up.',
      '<a href="new-case.html" class="btn btn-accent">+ Start a new case</a>'
    );
    return;
  }

  listEl.innerHTML = cases.map(c => {
    const doctor = findUserById(c.doctorId);
    return `
      <div class="case-row" data-case="${c.id}" style="cursor:pointer;">
        <div class="case-row-main">
          <div class="case-row-top">
            <span class="case-id">${escapeHtml(c.id)}</span>
            <span class="badge badge-navy badge-status">${escapeHtml(c.status)}</span>
          </div>
          <div class="case-row-symptom">${escapeHtml(c.chiefConcern)}</div>
          <div class="case-row-meta">Dr. ${escapeHtml(doctor ? doctor.name : 'Unknown')} · ${escapeHtml(c.hospital || '')}</div>
        </div>
        <div class="case-row-time">${escapeHtml(formatDate(c.createdAt))}</div>
      </div>`;
  }).join('');

  listEl.querySelectorAll('[data-case]').forEach(row => {
    row.addEventListener('click', () => selectCase(row.dataset.case));
  });

  document.getElementById('followup-text').addEventListener('input', (e) => {
    document.getElementById('followup-continue').disabled = e.target.value.trim().length < 3;
  });

  document.getElementById('followup-back').addEventListener('click', () => showPanel('select'));
  document.getElementById('summary-back').addEventListener('click', () => showPanel('form'));

  document.getElementById('followup-continue').addEventListener('click', () => {
    fuText = document.getElementById('followup-text').value.trim();
    renderFollowupSummary();
    showPanel('summary');
  });

  document.getElementById('followup-submit').addEventListener('click', submitFollowup);
});

function selectCase(caseId) {
  fuOriginalCase = getCaseById(caseId);
  if (!fuOriginalCase) return;
  const doctor = findUserById(fuOriginalCase.doctorId);
  document.getElementById('followup-sub').textContent =
    `Following up with Dr. ${doctor ? doctor.name : 'your doctor'} at ${fuOriginalCase.hospital || 'the same hospital'} on "${fuOriginalCase.chiefConcern}".`;
  showPanel('form');
}

function renderFollowupSummary() {
  const doctor = findUserById(fuOriginalCase.doctorId);
  const container = document.getElementById('followup-summary');
  container.innerHTML = `
    <div class="summary-section"><h4>Original case</h4><p>${escapeHtml(fuOriginalCase.chiefConcern)} (${escapeHtml(fuOriginalCase.id)})</p></div>
    <div class="summary-section"><h4>Doctor & hospital</h4><p>Dr. ${escapeHtml(doctor ? doctor.name : 'Unknown')} · ${escapeHtml(fuOriginalCase.hospital || '')}</p></div>
    <div class="summary-section"><h4>What's changed</h4><p>${escapeHtml(fuText)}</p></div>
  `;
}

function submitFollowup() {
  const doctor = findUserById(fuOriginalCase.doctorId);
  if (!doctor) return;

  const severity = computeSeverity(fuText);
  const newCase = {
    id: uid('case'),
    patientId: fuUser.id,
    doctorId: fuOriginalCase.doctorId,
    hospital: fuOriginalCase.hospital,
    chiefConcern: `Follow-up: ${fuOriginalCase.chiefConcern}`,
    story: fuText,
    symptoms: [`Follow-up: ${fuOriginalCase.chiefConcern}`],
    category: fuOriginalCase.category,
    questions: ['What has changed since your last visit?'],
    answers: [fuText],
    severity,
    status: 'submitted',
    isFollowUp: true,
    originalCaseId: fuOriginalCase.id,
    doctorNotes: '',
    createdAt: Date.now()
  };

  const cases = getCases();
  cases.push(newCase);
  saveCases(cases);

  addNotification(doctor.id, `Follow-up from ${fuUser.name} on "${fuOriginalCase.chiefConcern}".`, 'case', `doctor-case.html?case=${newCase.id}`);
  addNotification(fuUser.id, `Your follow-up was sent to Dr. ${doctor.name}.`, 'case', `history.html?case=${newCase.id}`);

  showPanel('done');
}

function showPanel(name) {
  ['select', 'form', 'summary', 'done'].forEach(p => {
    const el = document.getElementById('panel-' + p);
    if (el) el.classList.toggle('hidden', p !== name);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
