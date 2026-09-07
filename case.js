/* ============================================================
   AYUSETU — new case guided flow (new-case.html)
   ============================================================ */

const QUESTION_SETS = {
  chest: { label: 'Chest pain', questions: ['When did the pain start?','What does the pain feel like?','Where exactly is the pain?','Does it spread anywhere?','Are you experiencing shortness of breath?','Any sweating, dizziness or nausea?','Do you have any existing medical conditions?','Do you have any allergies?'] },
  headache: { label: 'Headache', questions: ['When did it start?','Where is the pain?','How severe is it, on a scale of 1–10?','Any nausea?','Any sensitivity to light?','Any vision changes?','Do you have any existing medical conditions?','Do you have any allergies?'] },
  abdominal: { label: 'Stomach / abdominal pain', questions: ['When did it start?','Where exactly is the pain?','Is it constant or intermittent?','Any vomiting?','Any diarrhea?','Any fever?','Any change in appetite?','Do you have any existing medical conditions?','Do you have any allergies?'] },
  fever: { label: 'Fever', questions: ['When did it start?','What was the highest temperature?','Any cough?','Any body pain?','Any chills?','Have you taken any medication?','Do you have any existing medical conditions?','Do you have any allergies?'] },
  other: { label: 'General concern', questions: ['When did it start?','Is it getting better or worse?','How severe is it, on a scale of 1–10?','What other symptoms are present?','Do you have any existing medical conditions?','Do you have any allergies?'] }
};

const QUESTION_TRANSLATIONS = {
  te: {
    'When did the pain start?':'నొప్పి ఎప్పుడు ప్రారంభమైంది?','What does the pain feel like?':'నొప్పి ఎలా అనిపిస్తోంది?','Where exactly is the pain?':'నొప్పి ఖచ్చితంగా ఎక్కడ ఉంది?','Does it spread anywhere?':'నొప్పి మరెక్కడికైనా వ్యాపిస్తుందా?','Are you experiencing shortness of breath?':'మీకు శ్వాస తీసుకోవడంలో ఇబ్బంది ఉందా?','Any sweating, dizziness or nausea?':'చెమటలు, తల తిరగడం లేదా వికారం ఉందా?','Do you have any existing medical conditions?':'మీకు ఇప్పటికే ఏవైనా ఆరోగ్య సమస్యలు ఉన్నాయా?','Do you have any allergies?':'మీకు ఏవైనా అలర్జీలు ఉన్నాయా?','When did it start?':'ఇది ఎప్పుడు ప్రారంభమైంది?','Where is the pain?':'నొప్పి ఎక్కడ ఉంది?','How severe is it, on a scale of 1–10?':'1–10లో నొప్పి ఎంత తీవ్రంగా ఉంది?','Any nausea?':'వికారం ఉందా?','Any sensitivity to light?':'వెలుతురుకు సున్నితత్వం ఉందా?','Any vision changes?':'చూపులో మార్పులు ఉన్నాయా?','Is it constant or intermittent?':'ఇది నిరంతరంగా ఉందా లేదా మధ్య మధ్యలో వస్తుందా?','Any vomiting?':'వాంతులు ఉన్నాయా?','Any diarrhea?':'విరేచనాలు ఉన్నాయా?','Any fever?':'జ్వరం ఉందా?','Any change in appetite?':'ఆకలిలో మార్పు ఉందా?','What was the highest temperature?':'అత్యధిక ఉష్ణోగ్రత ఎంత?','Any cough?':'దగ్గు ఉందా?','Any body pain?':'శరీర నొప్పి ఉందా?','Any chills?':'వణుకు ఉందా?','Have you taken any medication?':'ఏదైనా మందు తీసుకున్నారా?','Is it getting better or worse?':'ఇది మెరుగవుతోందా లేదా మరింత తీవ్రమవుతోందా?','What other symptoms are present?':'ఇంకా ఏ ఇతర లక్షణాలు ఉన్నాయి?'
  },
  hi: {
    'When did the pain start?':'दर्द कब शुरू हुआ?','What does the pain feel like?':'दर्द कैसा महसूस होता है?','Where exactly is the pain?':'दर्द ठीक कहाँ है?','Does it spread anywhere?':'क्या दर्द कहीं और फैलता है?','Are you experiencing shortness of breath?':'क्या आपको सांस लेने में तकलीफ हो रही है?','Any sweating, dizziness or nausea?':'पसीना, चक्कर या मतली है?','Do you have any existing medical conditions?':'क्या आपको पहले से कोई बीमारी है?','Do you have any allergies?':'क्या आपको कोई एलर्जी है?','When did it start?':'यह कब शुरू हुआ?','Where is the pain?':'दर्द कहाँ है?','How severe is it, on a scale of 1–10?':'1–10 के पैमाने पर दर्द कितना तेज है?','Any nausea?':'क्या मतली है?','Any sensitivity to light?':'क्या रोशनी से परेशानी होती है?','Any vision changes?':'क्या दृष्टि में कोई बदलाव है?','Is it constant or intermittent?':'क्या यह लगातार है या बीच-बीच में होता है?','Any vomiting?':'क्या उल्टी है?','Any diarrhea?':'क्या दस्त हैं?','Any fever?':'क्या बुखार है?','Any change in appetite?':'क्या भूख में बदलाव है?','What was the highest temperature?':'सबसे अधिक तापमान कितना था?','Any cough?':'क्या खांसी है?','Any body pain?':'क्या शरीर में दर्द है?','Any chills?':'क्या ठंड लगकर कंपकंपी होती है?','Have you taken any medication?':'क्या आपने कोई दवा ली है?','Is it getting better or worse?':'क्या यह बेहतर हो रहा है या बदतर?','What other symptoms are present?':'और कौन से लक्षण हैं?'
  }
};
function qText(text, lang) { return (QUESTION_TRANSLATIONS[lang] && QUESTION_TRANSLATIONS[lang][text]) || text; }

function detectCategory(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('chest')) return 'chest';
  if (t.includes('head') && (t.includes('ache') || t.includes('pain') || t.includes('migraine'))) return 'headache';
  if (t.includes('stomach') || t.includes('abdomen') || t.includes('abdominal') || t.includes('belly')) return 'abdominal';
  if (t.includes('fever') || t.includes('temperature')) return 'fever';
  return 'other';
}

function extractChiefConcern(text) {
  const t = (text || '').trim();
  if (!t) return 'General concern';
  const firstSentence = t.split(/[.!\n]/)[0];
  return firstSentence.length > 90 ? firstSentence.slice(0, 90) + '…' : firstSentence;
}

const state = {
  step: 1,
  doctorId: null,
  storyText: '',
  category: 'other',
  questions: [],
  answers: [],
  qIndex: 0,
  language: 'en',
  beneficiaryId: null
};

let currentUser = null;
let recognition = null;
let recognizing = false;

document.addEventListener('DOMContentLoaded', () => {
  currentUser = requireAuth('patient');
  if (!currentUser) return;
  renderAppHeader({ active: 'new-case' });

  const beneficiary = new URLSearchParams(window.location.search).get('beneficiary');
  if (beneficiary) state.beneficiaryId = beneficiary;
  setupStep1();
  setupStep2();
  setupStep3();
  wireNav();
});

/* ---------------- progress bar ---------------- */
function goToStep(step) {
  state.step = step;
  document.querySelectorAll('[data-step-panel]').forEach(panel => {
    panel.classList.toggle('hidden', panel.dataset.stepPanel !== String(step));
  });
  const effectiveStep = step === 'done' ? 5 : step;
  document.querySelectorAll('.flow-step').forEach(el => {
    const n = Number(el.dataset.step);
    el.classList.toggle('active', n === effectiveStep);
    el.classList.toggle('done', n < effectiveStep);
  });
  document.querySelectorAll('.flow-line').forEach((line, idx) => {
    line.classList.toggle('done', (idx + 1) < effectiveStep);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function wireNav() {
  document.getElementById('step2-back').addEventListener('click', () => goToStep(1));
  document.getElementById('step3-back').addEventListener('click', () => goToStep(2));
  document.getElementById('step4-back').addEventListener('click', () => {
    // Step back into questions at the last one, so the patient can revise.
    state.qIndex = Math.max(0, state.questions.length - 1);
    renderQuestion();
    goToStep(3);
  });
}

/* ---------------- STEP 1: doctor ---------------- */
function setupStep1() {
  const doctors = getDoctors();
  const list = document.getElementById('doctor-list');
  const nextBtn = document.getElementById('step1-next');
  const summary = document.getElementById('doctor-selected-summary');

  if (doctors.length === 0) {
    emptyState(
      list,
      `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 3v4a2 2 0 002 2h2a2 2 0 002-2V3" stroke="currentColor" stroke-width="1.6"/><rect x="5" y="6" width="14" height="15" rx="2" stroke="currentColor" stroke-width="1.6"/></svg>`,
      'No doctors registered yet',
      'Ask a doctor to create an Ayusetu account first, then come back to start your case.'
    );
    return;
  }

  list.innerHTML = doctors.map(d => `
    <label class="doctor-option" data-id="${d.id}">
      <input type="radio" name="doctor" value="${d.id}">
      <div class="doctor-option-info">
        <strong>Dr. ${escapeHtml(d.name)}</strong>
        <span>${escapeHtml(d.specialization || 'General practice')} · ${escapeHtml(d.hospital || 'Hospital not set')}</span>
      </div>
    </label>
  `).join('');

  list.querySelectorAll('.doctor-option').forEach(opt => {
    opt.addEventListener('click', () => {
      list.querySelectorAll('.doctor-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      opt.querySelector('input').checked = true;
      state.doctorId = opt.dataset.id;
      const d = findUserById(state.doctorId);
      summary.innerHTML = `
        <div class="doctor-selected-card">
          <span class="avatar-sm">${initials(d.name)}</span>
          <div>
            <strong style="display:block;">Dr. ${escapeHtml(d.name)}</strong>
            <span class="text-muted" style="font-size:0.82rem;">${escapeHtml(d.specialization || 'General')} · ${escapeHtml(d.hospital || '')} · ${escapeHtml(d.phone || '')}</span>
          </div>
        </div>`;
      nextBtn.disabled = false;
    });
  });

  nextBtn.addEventListener('click', () => goToStep(2));
}

/* ---------------- STEP 2: story ---------------- */
function setupStep2() {
  const modeBtns = document.querySelectorAll('.mode-btn');
  const textWrap = document.getElementById('text-input-wrap');
  const voiceWrap = document.getElementById('voice-input-wrap');
  const storyText = document.getElementById('story-text');
  const storyTextVoice = document.getElementById('story-text-voice');
  const nextBtn = document.getElementById('step2-next');
  const recordBtn = document.getElementById('voice-record-btn');
  const voiceStatus = document.getElementById('voice-status');
  const voiceStatusText = document.getElementById('voice-status-text');
  const langSelect = document.getElementById('case-language');
  let mode = 'text', finalTranscript = '', shouldListen = false;

  function checkStep2Ready() { nextBtn.disabled = (mode === 'text' ? storyText.value : storyTextVoice.value).trim().length < 3; }
  modeBtns.forEach(btn => btn.addEventListener('click', () => { mode=btn.dataset.mode; modeBtns.forEach(b=>b.classList.toggle('active',b===btn)); textWrap.classList.toggle('hidden',mode!=='text'); voiceWrap.classList.toggle('hidden',mode!=='voice'); checkStep2Ready(); }));
  storyText.addEventListener('input',checkStep2Ready); storyTextVoice.addEventListener('input',checkStep2Ready);
  langSelect.addEventListener('change', () => { state.language=langSelect.value; if(recognition) recognition.lang={en:'en-IN',te:'te-IN',hi:'hi-IN'}[state.language]; });

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition(); recognition.continuous=true; recognition.interimResults=true; recognition.lang='en-IN';
    recognition.onstart=()=>{ recognizing=true; voiceStatus.classList.add('listening'); voiceStatusText.textContent='Listening… speak naturally.'; recordBtn.textContent='⏹ Stop'; };
    recognition.onresult=(event)=>{ let interim=''; for(let i=event.resultIndex;i<event.results.length;i++){ const t=event.results[i][0].transcript; if(event.results[i].isFinal) finalTranscript += t+' '; else interim += t; } storyTextVoice.value=(finalTranscript+interim).trim(); checkStep2Ready(); };
    recognition.onerror=(e)=>{ console.error('Speech recognition:',e.error); recognizing=false; shouldListen=false; voiceStatus.classList.remove('listening'); recordBtn.textContent='🎙 Start speaking'; const msgs={ 'not-allowed':'Microphone permission denied. Allow microphone access in Chrome site settings.','service-not-allowed':'Speech service is blocked. Check browser permissions.','network':'Speech service unavailable. Check your internet connection.','no-speech':'No speech detected. Please try speaking again.','audio-capture':'No microphone was found. Connect or enable a microphone.' }; voiceStatusText.textContent=msgs[e.error]||'Voice recognition failed. Please try again.'; };
    recognition.onend=()=>{ recognizing=false; voiceStatus.classList.remove('listening'); if(shouldListen){ setTimeout(()=>{try{recognition.start();}catch(_){}},250); } else { recordBtn.textContent='🎙 Start speaking'; if(voiceStatusText.textContent==='Listening… speak naturally.') voiceStatusText.textContent='Tap to start — Ayusetu will transcribe as you speak.'; } };
    recordBtn.addEventListener('click', async()=>{ if(recognizing){ shouldListen=false; recognition.stop(); return; } if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ voiceStatusText.textContent='Microphone access is not available in this browser.'; return; } try{ await navigator.mediaDevices.getUserMedia({audio:true}); finalTranscript=storyTextVoice.value.trim() ? storyTextVoice.value.trim()+' ' : ''; shouldListen=true; recognition.lang={en:'en-IN',te:'te-IN',hi:'hi-IN'}[state.language]; recognition.start(); }catch(err){ shouldListen=false; voiceStatusText.textContent=err.name==='NotAllowedError'?'Microphone permission denied. Allow microphone access and try again.':'Could not access the microphone. Please check your device settings.'; } });
  } else { recordBtn.disabled=true; recordBtn.textContent='Voice unavailable'; voiceStatusText.textContent='Voice recognition is not supported in this browser. Use Chrome or type your story.'; }

  nextBtn.addEventListener('click',()=>{ state.storyText=(mode==='text'?storyText.value:storyTextVoice.value).trim(); state.category=detectCategory(state.storyText); state.questions=QUESTION_SETS[state.category].questions.slice(); state.answers=new Array(state.questions.length).fill(''); state.qIndex=0; renderQuestion(); goToStep(3); });
}

/* ---------------- STEP 3: guided questions ---------------- */
function setupStep3() {
  const nextBtn = document.getElementById('step3-next');
  const backBtn = document.getElementById('step3-back');
  const answerBox = document.getElementById('qa-answer');

  nextBtn.addEventListener('click', () => {
    state.answers[state.qIndex] = answerBox.value.trim();
    if (state.qIndex < state.questions.length - 1) {
      state.qIndex++;
      renderQuestion();
    } else {
      renderSummary();
      goToStep(4);
    }
  });

  backBtn.addEventListener('click', () => {
    state.answers[state.qIndex] = answerBox.value.trim();
    if (state.qIndex > 0) {
      state.qIndex--;
      renderQuestion();
    } else {
      goToStep(2);
    }
  });
}

function renderQuestion() {
  const total = state.questions.length;
  document.getElementById('qa-progress').textContent = `Question ${state.qIndex + 1} of ${total}`;
  document.getElementById('qa-question').textContent = qText(state.questions[state.qIndex], state.language);
  document.getElementById('qa-answer').value = state.answers[state.qIndex] || '';
  const nextBtn = document.getElementById('step3-next');
  nextBtn.textContent = state.qIndex === total - 1 ? 'Review case →' : 'Next →';
}

/* ---------------- STEP 4: summary ---------------- */
function renderSummary() {
  const container = document.getElementById('case-summary');
  const doctor = findUserById(state.doctorId);
  const severity = computeSeverity(state.storyText + ' ' + state.answers.join(' '));
  const chiefConcern = extractChiefConcern(state.storyText);
  const allergiesIdx = state.questions.findIndex(q => q.toLowerCase().includes('allerg'));
  const historyIdx = state.questions.findIndex(q => q.toLowerCase().includes('existing medical'));
  const timelineIdx = state.questions.findIndex(q => q.toLowerCase().startsWith('when'));

  container.innerHTML = `
    <div class="summary-section">
      <h4>Chief concern</h4>
      <p>${escapeHtml(chiefConcern)}</p>
    </div>
    <div class="summary-section">
      <h4>Patient story</h4>
      <p>${escapeHtml(state.storyText)}</p>
    </div>
    <div class="summary-section">
      <h4>Category</h4>
      <p>${escapeHtml(QUESTION_SETS[state.category].label)}</p>
    </div>
    <div class="summary-section">
      <h4>Timeline</h4>
      <p>${escapeHtml(timelineIdx >= 0 ? (state.answers[timelineIdx] || 'Not specified') : 'Not specified')}</p>
    </div>
    <div class="summary-section">
      <h4>Severity</h4>
      <p>${severity === 'high' ? '<span class="badge badge-high">High priority</span>' : '<span class="badge badge-navy">Normal</span>'}</p>
    </div>
    <div class="summary-section">
      <h4>Medical history</h4>
      <p>${escapeHtml(historyIdx >= 0 ? (state.answers[historyIdx] || 'None reported') : 'None reported')}</p>
    </div>
    <div class="summary-section">
      <h4>Allergies</h4>
      <p>${escapeHtml(allergiesIdx >= 0 ? (state.answers[allergiesIdx] || 'None reported') : 'None reported')}</p>
    </div>
    <div class="summary-section">
      <h4>Assigned doctor</h4>
      <p>Dr. ${escapeHtml(doctor ? doctor.name : 'Unknown')} · ${escapeHtml(doctor ? doctor.hospital : '')}</p>
    </div>
    <div class="summary-section">
      <h4>Patient responses</h4>
      <div class="summary-qa">
        ${state.questions.map((q, i) => `
          <div class="summary-qa-item">
            <div class="q">${escapeHtml(q)}</div>
            <div class="a">${escapeHtml(state.answers[i] || 'Not answered')}</div>
          </div>`).join('')}
      </div>
    </div>
  `;

  state.severity = severity;
  state.chiefConcern = chiefConcern;

  const submitBtn = document.getElementById('submit-case-btn');
  submitBtn.onclick = submitCase;
}

function submitCase() {
  const doctor = findUserById(state.doctorId);
  if (!doctor) return;

  const newCase = {
    id: uid('case'),
    patientId: currentUser.id,
    beneficiaryId: state.beneficiaryId || currentUser.id,
    beneficiaryName: state.beneficiaryId && state.beneficiaryId !== currentUser.id ? ((familyForUser(currentUser.id).members.find(m=>m.id===state.beneficiaryId)||{}).name || currentUser.name) : currentUser.name,
    doctorId: state.doctorId,
    hospital: doctor.hospital || '',
    chiefConcern: state.chiefConcern,
    story: state.storyText,
    symptoms: [state.chiefConcern],
    category: state.category,
    questions: state.questions,
    answers: state.answers,
    severity: state.severity,
    status: 'submitted',
    isFollowUp: false,
    doctorNotes: '',
    createdAt: Date.now()
  };

  const cases = getCases();
  cases.push(newCase);
  saveCases(cases);

  addNotification(doctor.id, `New case submitted by ${currentUser.name}: ${state.chiefConcern}`, 'case', `doctor-case.html?case=${newCase.id}`);
  addNotification(currentUser.id, `Your case "${state.chiefConcern}" was sent to Dr. ${doctor.name}.`, 'case', `history.html?case=${newCase.id}`);

  goToStep('done');
}
