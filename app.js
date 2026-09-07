/* ============================================================
   AYUSETU — shared application utilities
   Included on every page before the page-specific script.
   ============================================================ */

const STORE = {
  users: 'ayusetuUsers',
  session: 'ayusetuCurrentUser',
  cases: 'ayusetuCases',
  notifications: 'ayusetuNotifications',
  messages: 'ayusetuMessages',
  families: 'ayusetuFamilies'
};

/* ---------- defensive localStorage helpers ---------- */
function readStore(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Ayusetu: could not read', key, e);
    return [];
  }
}
function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Ayusetu: could not write', key, e);
  }
}

function uid(prefix) {
  return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* ---------- users ---------- */
function getUsers() { return readStore(STORE.users); }
function saveUsers(users) { writeStore(STORE.users, users); }
function findUserById(id) { return getUsers().find(u => u.id === id) || null; }
function getDoctors() { return getUsers().filter(u => u.role === 'doctor'); }

/* ---------- session ---------- */
function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORE.session);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session || !session.id) return null;
    const full = findUserById(session.id);
    return full || null;
  } catch (e) {
    return null;
  }
}
function setCurrentUser(user) {
  writeStore(STORE.session, { id: user.id, role: user.role });
}
function logout() {
  localStorage.removeItem(STORE.session);
  window.location.href = 'index.html';
}

/* Redirects to login if nobody is signed in, or if signed-in role doesn't match. */
function requireAuth(role) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html' + (role ? ('?role=' + role) : '');
    return null;
  }
  if (role && user.role !== role) {
    window.location.href = user.role === 'doctor' ? 'doctor-dashboard.html' : 'patient-dashboard.html';
    return null;
  }
  return user;
}

/* ---------- cases ---------- */
function getCases() { return readStore(STORE.cases); }
function saveCases(cases) { writeStore(STORE.cases, cases); }
function getCaseById(id) { return getCases().find(c => c.id === id) || null; }
function casesForPatient(patientId) {
  return getCases().filter(c => c.patientId === patientId).sort((a, b) => b.createdAt - a.createdAt);
}
function casesForDoctor(doctorId) {
  return getCases().filter(c => c.doctorId === doctorId).sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === 'high' ? -1 : 1;
    return b.createdAt - a.createdAt;
  });
}

/* ---------- notifications ---------- */
function getNotifications() { return readStore(STORE.notifications); }
function saveNotifications(list) { writeStore(STORE.notifications, list); }
function notificationsForUser(userId) {
  return getNotifications().filter(n => n.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
}
function addNotification(userId, message, type, link) {
  const list = getNotifications();
  list.push({
    id: uid('notif'),
    userId,
    message,
    type: type || 'info',
    link: link || '#',
    read: false,
    createdAt: Date.now()
  });
  saveNotifications(list);
}
function unreadCount(userId) {
  return notificationsForUser(userId).filter(n => !n.read).length;
}

/* ---------- messages ---------- */
function getMessages() { return readStore(STORE.messages); }
function saveMessages(list) { writeStore(STORE.messages, list); }
function messagesForCase(caseId) {
  return getMessages().filter(m => m.caseId === caseId).sort((a, b) => a.createdAt - b.createdAt);
}

/* ---------- family profiles ---------- */
function getFamilies() { return readStore(STORE.families); }
function saveFamilies(list) { writeStore(STORE.families, list); }
function familyForUser(userId) { return getFamilies().find(f => f.userId === userId) || { userId, members: [] }; }
function saveFamily(family) {
  const list = getFamilies();
  const idx = list.findIndex(f => f.userId === family.userId);
  if (idx >= 0) list[idx] = family; else list.push(family);
  saveFamilies(list);
}

/* ---------- formatting ---------- */
function formatRelativeTime(ts) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return min + 'm ago';
  const hr = Math.floor(min / 60);
  if (hr < 24) return hr + 'h ago';
  const day = Math.floor(hr / 24);
  if (day < 7) return day + 'd ago';
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

/* ---------- shared header wiring ----------
   Any page can include:
   <div id="ayusetu-header"></div>
   and call renderAppHeader({ active: 'home' }) to populate it. */
function renderAppHeader(opts) {
  opts = opts || {};
  const user = getCurrentUser();
  const mount = document.getElementById('ayusetu-header');
  if (!mount || !user) return;

  const dashboardHref = user.role === 'doctor' ? 'doctor-dashboard.html' : 'patient-dashboard.html';
  const unread = unreadCount(user.id);

  mount.innerHTML = `
    <div class="app-header">
      <a class="brand" href="${dashboardHref}">
        <span class="brand-mark">A</span>
        <span class="brand-name">Ayusetu</span>
      </a>
      <div class="app-header-right">
        <a class="icon-btn" href="notifications.html" title="Notifications" aria-label="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.7 21a2 2 0 01-3.4 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          ${unread > 0 ? `<span class="icon-dot">${unread > 9 ? '9+' : unread}</span>` : ''}
        </a>
        <a class="header-user" href="profile.html">
          <span class="avatar-sm">${initials(user.name)}</span>
          <span class="header-user-name">${escapeHtml(user.name)}</span>
        </a>
        <button class="btn btn-ghost btn-sm" id="ayusetu-logout-btn">Log out</button>
      </div>
    </div>
  `;
  const logoutBtn = document.getElementById('ayusetu-logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ---------- severity ---------- */
const HIGH_PRIORITY_TERMS = ['chest pain', 'difficulty breathing', 'unconscious', 'severe bleeding', 'can\'t breathe', 'cannot breathe'];
function computeSeverity(text) {
  const t = (text || '').toLowerCase();
  return HIGH_PRIORITY_TERMS.some(term => t.includes(term)) ? 'high' : 'normal';
}

/* ---------- empty state helper ---------- */
function emptyState(container, iconSvg, title, body, ctaHtml) {
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">${iconSvg}</div>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(body)}</p>
      ${ctaHtml || ''}
    </div>`;
}

/* ---------- initial seed data for demo / evaluation ---------- */
function ensureSeedData() {
  const users = getUsers();
  if (!users || users.length === 0) {
    const demoDoctor1 = {
      id: 'doc_priya',
      role: 'doctor',
      name: 'Priya Sharma',
      email: 'doctor@ayusetu.com',
      phone: '+91 98765 43210',
      password: 'password123',
      specialization: 'Cardiology & Internal Medicine',
      hospital: 'Apollo Hospitals, Hyderabad',
      regNumber: 'TS-MCI-48291',
      availability: 'Available',
      location: 'Hyderabad, Telangana',
      photo: null,
      createdAt: Date.now() - 86400000 * 30
    };

    const demoDoctor2 = {
      id: 'doc_rajesh',
      role: 'doctor',
      name: 'Rajesh Kumar',
      email: 'rajesh@ayusetu.com',
      phone: '+91 98765 12345',
      password: 'password123',
      specialization: 'General Medicine',
      hospital: 'Care Hospitals, Banjara Hills',
      regNumber: 'TS-MCI-31902',
      availability: 'Available',
      location: 'Hyderabad, Telangana',
      photo: null,
      createdAt: Date.now() - 86400000 * 20
    };

    const demoPatient = {
      id: 'pat_rahul',
      role: 'patient',
      name: 'Rahul Verma',
      email: 'patient@ayusetu.com',
      phone: '+91 98123 45678',
      password: 'password123',
      dob: '1992-05-14',
      location: 'Hyderabad, Telangana',
      photo: null,
      createdAt: Date.now() - 86400000 * 15
    };

    saveUsers([demoDoctor1, demoDoctor2, demoPatient]);

    const demoCase1 = {
      id: 'case_demo_01',
      patientId: demoPatient.id,
      beneficiaryId: demoPatient.id,
      beneficiaryName: demoPatient.name,
      doctorId: demoDoctor1.id,
      hospital: demoDoctor1.hospital,
      chiefConcern: 'Chest discomfort and shortness of breath',
      story: 'I have been experiencing a tight, pressing discomfort in the center of my chest along with mild breathlessness, particularly when climbing stairs or walking briskly for the past 3 days. It eases when resting for 5 minutes.',
      symptoms: ['Chest discomfort', 'Shortness of breath'],
      category: 'chest',
      questions: [
        'When did you first notice this discomfort?',
        'What does the discomfort feel like?',
        'Does it radiate or spread anywhere?',
        'Do you have any known medical conditions or history of elevated blood pressure?'
      ],
      answers: [
        'Started 3 days ago during morning physical activity',
        'Tight pressing sensation, like a heavy weight',
        'Mild ache radiating towards the left shoulder',
        'Mild hypertension diagnosed last year; taking Telmisartan 40mg'
      ],
      severity: 'high',
      status: 'submitted',
      isFollowUp: false,
      doctorNotes: '',
      createdAt: Date.now() - 3600000 * 2
    };

    const demoCase2 = {
      id: 'case_demo_02',
      patientId: demoPatient.id,
      beneficiaryId: demoPatient.id,
      beneficiaryName: demoPatient.name,
      doctorId: demoDoctor2.id,
      hospital: demoDoctor2.hospital,
      chiefConcern: 'Persistent dry cough and mild fever',
      story: 'Had a low grade fever around 100°F with persistent dry hacking cough and throat irritation for 4 days.',
      symptoms: ['Dry cough', 'Mild fever'],
      category: 'cough',
      questions: [
        'How long have you had the cough?',
        'Are you experiencing body ache or fatigue?'
      ],
      answers: [
        'About 4 days now',
        'Mild throat irritation and evening fatigue'
      ],
      severity: 'normal',
      status: 'reviewed',
      isFollowUp: false,
      doctorNotes: 'Viral upper respiratory tract infection. Advised warm saline gargles, Paracetamol 650mg SOS, and steam inhalation twice daily.',
      createdAt: Date.now() - 86400000 * 5
    };

    saveCases([demoCase1, demoCase2]);

    addNotification(demoPatient.id, 'Welcome to Ayusetu, Rahul! Your account is ready.', 'info', '#');
    addNotification(demoPatient.id, `Dr. ${demoDoctor2.name} reviewed your case "${demoCase2.chiefConcern}".`, 'case', `history.html?case=${demoCase2.id}`);
    addNotification(demoDoctor1.id, `New high priority case submitted by ${demoPatient.name}: ${demoCase1.chiefConcern}`, 'case', `doctor-case.html?case=${demoCase1.id}`);

    saveMessages([
      {
        id: uid('msg'),
        caseId: demoCase1.id,
        senderId: demoPatient.id,
        receiverId: demoDoctor1.id,
        message: 'Hello Dr. Priya, I submitted my case with details about the chest tightness. Looking forward to your advice.',
        createdAt: Date.now() - 3600000 * 1.5
      }
    ]);

    saveFamilies([
      {
        userId: demoPatient.id,
        members: [
          { id: uid('fam'), name: 'Sunita Verma', relation: 'Mother', dob: '1962-08-20', notes: 'Type 2 Diabetes, on Metformin' },
          { id: uid('fam'), name: 'Aarav Verma', relation: 'Son', dob: '2018-11-05', notes: 'Seasonal allergic rhinitis' }
        ]
      }
    ]);
  }
}

// Automatically seed on initial load
ensureSeedData();

