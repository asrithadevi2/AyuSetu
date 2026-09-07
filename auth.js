/* ============================================================
   AYUSETU — authentication (login.html + signup.html)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, skip straight to the right dashboard.
  const existing = getCurrentUser();
  if (existing) {
    window.location.href = existing.role === 'doctor' ? 'doctor-dashboard.html' : 'patient-dashboard.html';
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const initialRole = params.get('role') === 'doctor' ? 'doctor' : 'patient';

  const roleToggle = document.getElementById('role-toggle');
  let currentRole = initialRole;

  function setRole(role) {
    currentRole = role;
    if (roleToggle) {
      roleToggle.querySelectorAll('button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.role === role);
      });
    }
    // signup.html only: toggle role-specific fields
    const patientFields = document.getElementById('patient-fields');
    const doctorFields = document.getElementById('doctor-fields');
    if (patientFields && doctorFields) {
      patientFields.classList.toggle('hidden', role !== 'patient');
      doctorFields.classList.toggle('hidden', role !== 'doctor');
    }
    // login.html only: point signup link to the matching role
    const signupLink = document.getElementById('signup-link');
    if (signupLink) signupLink.setAttribute('href', 'signup.html?role=' + role);
  }

  if (roleToggle) {
    roleToggle.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => setRole(btn.dataset.role));
    });
  }
  setRole(initialRole);

  function showError(msg) {
    const el = document.getElementById('form-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
  }
  function clearError() {
    const el = document.getElementById('form-error');
    if (!el) return;
    el.classList.remove('show');
    el.textContent = '';
  }

  /* ---------------- LOGIN ---------------- */
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearError();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const password = document.getElementById('password').value;

      if (!email || !password) { showError('Please enter your email and password.'); return; }

      const users = getUsers();
      const user = users.find(u => u.email.toLowerCase() === email && u.role === currentRole);

      if (!user) {
        showError(`No ${currentRole} account found with that email. Check your role selection or sign up.`);
        return;
      }
      if (user.password !== password) {
        showError('Incorrect password. Please try again.');
        return;
      }

      setCurrentUser(user);
      window.location.href = user.role === 'doctor' ? 'doctor-dashboard.html' : 'patient-dashboard.html';
    });

    const quickPatientBtn = document.getElementById('quick-patient-btn');
    const quickDoctorBtn = document.getElementById('quick-doctor-btn');
    if (quickPatientBtn) {
      quickPatientBtn.addEventListener('click', () => {
        setRole('patient');
        document.getElementById('email').value = 'patient@ayusetu.com';
        document.getElementById('password').value = 'password123';
        loginForm.dispatchEvent(new Event('submit'));
      });
    }
    if (quickDoctorBtn) {
      quickDoctorBtn.addEventListener('click', () => {
        setRole('doctor');
        document.getElementById('email').value = 'doctor@ayusetu.com';
        document.getElementById('password').value = 'password123';
        loginForm.dispatchEvent(new Event('submit'));
      });
    }
  }

  /* ---------------- SIGNUP ---------------- */
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearError();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const phone = document.getElementById('phone').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (!name || !email || !phone || !password || !confirmPassword) {
        showError('Please fill in all required fields.');
        return;
      }
      if (password.length < 6) {
        showError('Password should be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        showError('Passwords do not match.');
        return;
      }

      const users = getUsers();
      if (users.some(u => u.email.toLowerCase() === email && u.role === currentRole)) {
        showError(`An account with this email already exists as a ${currentRole}. Try logging in instead.`);
        return;
      }

      let newUser = {
        id: uid(currentRole),
        role: currentRole,
        name, email, phone,
        password,
        createdAt: Date.now(),
        photo: null
      };

      if (currentRole === 'patient') {
        const dob = document.getElementById('dob').value;
        newUser.dob = dob || '';
        newUser.location = '';
      } else {
        const specialization = document.getElementById('specialization').value.trim();
        const hospital = document.getElementById('hospital').value.trim();
        const regNumber = document.getElementById('regNumber').value.trim();
        if (!specialization || !hospital || !regNumber) {
          showError('Please complete your specialization, hospital and registration number.');
          return;
        }
        newUser.specialization = specialization;
        newUser.hospital = hospital;
        newUser.regNumber = regNumber;
        newUser.availability = 'Available';
        newUser.location = '';
      }

      users.push(newUser);
      saveUsers(users);
      setCurrentUser(newUser);

      addNotification(newUser.id, `Welcome to Ayusetu, ${name.split(' ')[0]}! Your account is ready.`, 'info', '#');

      window.location.href = newUser.role === 'doctor' ? 'doctor-dashboard.html' : 'patient-dashboard.html';
    });
  }
});
