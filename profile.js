/* ============================================================
   AYUSETU — profile (profile.html)
   ============================================================ */

let profUser = null;

document.addEventListener('DOMContentLoaded', () => {
  profUser = requireAuth();
  if (!profUser) return;
  renderAppHeader({});

  renderProfile();

  document.getElementById('photo-input').addEventListener('change', handlePhotoUpload);
  document.getElementById('edit-toggle-btn').addEventListener('click', toggleEditForm);
});

function renderProfile() {
  document.getElementById('profile-name').textContent = profUser.name;
  document.getElementById('profile-role').textContent = profUser.role === 'doctor'
    ? `Doctor · ${profUser.specialization || 'General practice'}`
    : 'Patient';

  const initialsSpan = document.getElementById('avatar-initials');
  const photoImg = document.getElementById('avatar-photo');
  if (profUser.photo) {
    photoImg.src = profUser.photo;
    photoImg.classList.remove('hidden');
    initialsSpan.classList.add('hidden');
  } else {
    initialsSpan.textContent = initials(profUser.name);
    initialsSpan.classList.remove('hidden');
    photoImg.classList.add('hidden');
  }

  const infoGrid = document.getElementById('info-grid');
  if (profUser.role === 'patient') {
    infoGrid.innerHTML = `
      ${infoItem('Full name', profUser.name)}
      ${infoItem('Email', profUser.email)}
      ${infoItem('Phone', profUser.phone)}
      ${infoItem('Date of birth', profUser.dob || 'Not set')}
      ${infoItem('Location', profUser.location || 'Not set')}
    `;
  } else {
    infoGrid.innerHTML = `
      ${infoItem('Full name', 'Dr. ' + profUser.name)}
      ${infoItem('Email', profUser.email)}
      ${infoItem('Phone', profUser.phone)}
      ${infoItem('Specialization', profUser.specialization)}
      ${infoItem('Hospital', profUser.hospital)}
      ${infoItem('Registration number', profUser.regNumber)}
      ${infoItem('Location', profUser.location || 'Not set')}
      ${infoItem('Availability', profUser.availability || 'Available')}
    `;
  }
}

function infoItem(label, value) {
  return `<div class="info-item"><label>${escapeHtml(label)}</label><div>${escapeHtml(value || '—')}</div></div>`;
}

function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    updateUser({ photo: reader.result });
    renderProfile();
  };
  reader.readAsDataURL(file);
}

function updateUser(patch) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === profUser.id);
  if (idx === -1) return;
  users[idx] = { ...users[idx], ...patch };
  saveUsers(users);
  profUser = users[idx];
}

function toggleEditForm() {
  const wrap = document.getElementById('edit-form');
  const willShow = wrap.classList.contains('hidden');
  wrap.classList.toggle('hidden');
  if (!willShow) return;

  if (profUser.role === 'patient') {
    wrap.innerHTML = `
      <div class="field-row">
        <div class="field"><label>Full name</label><input id="f-name" value="${escapeHtml(profUser.name)}"></div>
        <div class="field"><label>Phone</label><input id="f-phone" value="${escapeHtml(profUser.phone)}"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Date of birth</label><input type="date" id="f-dob" value="${escapeHtml(profUser.dob || '')}"></div>
        <div class="field"><label>Location</label><input id="f-location" value="${escapeHtml(profUser.location || '')}" placeholder="City, state"></div>
      </div>
      <button class="btn btn-primary" id="save-profile-btn">Save changes</button>
    `;
  } else {
    wrap.innerHTML = `
      <div class="field-row">
        <div class="field"><label>Full name</label><input id="f-name" value="${escapeHtml(profUser.name)}"></div>
        <div class="field"><label>Phone</label><input id="f-phone" value="${escapeHtml(profUser.phone)}"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Specialization</label><input id="f-specialization" value="${escapeHtml(profUser.specialization || '')}"></div>
        <div class="field"><label>Hospital</label><input id="f-hospital" value="${escapeHtml(profUser.hospital || '')}"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Location</label><input id="f-location" value="${escapeHtml(profUser.location || '')}" placeholder="City, state"></div>
        <div class="field">
          <label>Availability</label>
          <select id="f-availability">
            <option value="Available" ${profUser.availability !== 'Busy' ? 'selected' : ''}>Available</option>
            <option value="Busy" ${profUser.availability === 'Busy' ? 'selected' : ''}>Busy</option>
          </select>
        </div>
      </div>
      <button class="btn btn-primary" id="save-profile-btn">Save changes</button>
    `;
  }

  document.getElementById('save-profile-btn').addEventListener('click', () => {
    const patch = {
      name: document.getElementById('f-name').value.trim() || profUser.name,
      phone: document.getElementById('f-phone').value.trim() || profUser.phone,
      location: document.getElementById('f-location').value.trim()
    };
    if (profUser.role === 'patient') {
      patch.dob = document.getElementById('f-dob').value;
    } else {
      patch.specialization = document.getElementById('f-specialization').value.trim();
      patch.hospital = document.getElementById('f-hospital').value.trim();
      patch.availability = document.getElementById('f-availability').value;
    }
    updateUser(patch);
    renderProfile();
    wrap.classList.add('hidden');
    renderAppHeader({});
  });
}
