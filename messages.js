/* ============================================================
   AYUSETU — messages (messages.html)
   Conversations are scoped to a case, private between the
   patient and the doctor assigned to that case.
   ============================================================ */

let msgUser = null;
let msgActiveCaseId = null;

document.addEventListener('DOMContentLoaded', () => {
  msgUser = requireAuth();
  if (!msgUser) return;
  renderAppHeader({});

  const params = new URLSearchParams(window.location.search);
  const focusCase = params.get('case');

  renderConversationList();

  const cases = msgUser.role === 'doctor' ? casesForDoctor(msgUser.id) : casesForPatient(msgUser.id);
  if (focusCase && cases.some(c => c.id === focusCase)) {
    openConversation(focusCase);
  } else if (cases.length > 0) {
    openConversation(cases[0].id);
  }
});

function conversationsForUser() {
  const cases = msgUser.role === 'doctor' ? casesForDoctor(msgUser.id) : casesForPatient(msgUser.id);
  return cases; // one conversation per case
}

function renderConversationList() {
  const listEl = document.getElementById('conv-list');
  const cases = conversationsForUser();

  if (cases.length === 0) {
    emptyState(listEl,
      `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
      'No conversations yet',
      msgUser.role === 'doctor' ? 'Conversations appear once patients submit a case to you.' : 'Start a case to begin messaging your doctor.'
    );
    return;
  }

  listEl.innerHTML = cases.map(c => {
    const otherId = msgUser.role === 'doctor' ? c.patientId : c.doctorId;
    const other = findUserById(otherId);
    const otherName = other ? (msgUser.role === 'doctor' ? other.name : 'Dr. ' + other.name) : 'Unknown';
    const thread = messagesForCase(c.id);
    const last = thread[thread.length - 1];
    return `
      <div class="conv-item" data-case="${c.id}">
        <span class="avatar-sm">${initials(other ? other.name : '?')}</span>
        <div class="conv-item-body">
          <div class="conv-item-name">${escapeHtml(otherName)}</div>
          <div class="conv-item-preview">${escapeHtml(last ? last.message : c.chiefConcern)}</div>
        </div>
      </div>`;
  }).join('');

  listEl.querySelectorAll('[data-case]').forEach(item => {
    item.addEventListener('click', () => openConversation(item.dataset.case));
  });
}

function openConversation(caseId) {
  msgActiveCaseId = caseId;
  document.querySelectorAll('.conv-item').forEach(i => i.classList.toggle('active', i.dataset.case === caseId));

  const theCase = getCaseById(caseId);
  if (!theCase) return;
  // privacy guard: only the assigned patient or doctor may view this thread
  if (theCase.patientId !== msgUser.id && theCase.doctorId !== msgUser.id) return;

  const otherId = msgUser.role === 'doctor' ? theCase.patientId : theCase.doctorId;
  const other = findUserById(otherId);
  const otherName = other ? (msgUser.role === 'doctor' ? other.name : 'Dr. ' + other.name) : 'Unknown';

  const threadEl = document.getElementById('conv-thread');
  threadEl.innerHTML = `
    <div class="conv-thread-head">
      <span class="avatar-sm">${initials(other ? other.name : '?')}</span>
      <div>
        <strong>${escapeHtml(otherName)}</strong>
        <div class="text-muted" style="font-size:0.78rem;">${escapeHtml(theCase.chiefConcern)} · ${escapeHtml(theCase.id)}</div>
      </div>
    </div>
    <div class="conv-thread-body" id="thread-body"></div>
    <div class="conv-thread-input">
      <button class="round-btn" id="msg-attach" title="Attachment" aria-label="Attachment">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 12.5l-8.5 8.5a4.5 4.5 0 01-6.4-6.4l9-9a3 3 0 014.3 4.3l-9 9a1.5 1.5 0 01-2.2-2.2l8-8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <input type="text" id="msg-input" placeholder="Type a message…">
      <button class="round-btn" id="msg-voice" title="Voice message" aria-label="Voice message">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2a4 4 0 014 4v3a4 4 0 01-8 0V6a4 4 0 014-4z" stroke="currentColor" stroke-width="1.8"/><path d="M5 11a7 7 0 0014 0M12 18v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      </button>
      <button class="round-btn send" id="msg-send" title="Send" aria-label="Send">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>
  `;

  renderThreadBody(caseId);

  document.getElementById('msg-send').addEventListener('click', () => sendMessage(caseId, otherId));
  document.getElementById('msg-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage(caseId, otherId);
  });
  document.getElementById('msg-attach').addEventListener('click', () => {
    showToast('Attachments aren\'t available in this prototype.');
  });
  document.getElementById('msg-voice').addEventListener('click', () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { showToast('Voice input is not supported in this browser.'); return; }
    const r = new SpeechRecognition(); r.lang='en-IN'; r.interimResults=true; r.continuous=false;
    const input=document.getElementById('msg-input'); const old=input.value;
    r.onstart=()=>showToast('Listening…');
    r.onresult=e=>{let text='';for(let i=e.resultIndex;i<e.results.length;i++) text+=e.results[i][0].transcript;input.value=(old+' '+text).trim();};
    r.onerror=e=>showToast(e.error==='not-allowed'?'Microphone permission denied.':'Voice recognition failed.');
    try{r.start();}catch(_){showToast('Voice recognition is already active.');}
  });
}

function renderThreadBody(caseId) {
  const body = document.getElementById('thread-body');
  const thread = messagesForCase(caseId);
  if (thread.length === 0) {
    body.innerHTML = `<p class="text-muted" style="text-align:center; margin:auto;">No messages yet — say hello.</p>`;
    return;
  }
  body.innerHTML = thread.map(m => {
    const mine = m.senderId === msgUser.id;
    return `
      <div class="bubble ${mine ? 'bubble-out' : 'bubble-in'}">
        ${escapeHtml(m.message)}
        <span class="bubble-time">${escapeHtml(formatRelativeTime(m.createdAt))}</span>
      </div>`;
  }).join('');
  body.scrollTop = body.scrollHeight;
}

function sendMessage(caseId, receiverId) {
  const input = document.getElementById('msg-input');
  const text = input.value.trim();
  if (!text) return;

  const messages = getMessages();
  messages.push({
    id: uid('msg'),
    caseId,
    senderId: msgUser.id,
    receiverId,
    message: text,
    createdAt: Date.now()
  });
  saveMessages(messages);
  input.value = '';
  renderThreadBody(caseId);
  renderConversationList();
  document.querySelectorAll('.conv-item').forEach(i => i.classList.toggle('active', i.dataset.case === caseId));

  const theCase = getCaseById(caseId);
  addNotification(receiverId, `New message from ${msgUser.name}${theCase ? ' about "' + theCase.chiefConcern + '"' : ''}.`, 'message', `messages.html?case=${caseId}`);
}

function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}
