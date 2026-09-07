/* Landing page behaviour */
document.addEventListener('DOMContentLoaded', () => {
  // If someone is already signed in, offer a quick path to their dashboard
  // rather than forcing them through role selection again.
  try {
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    if (user) {
      const loginLinks = document.querySelectorAll('a[href="login.html"]');
      loginLinks.forEach(a => {
        a.textContent = 'Go to dashboard';
        a.setAttribute('href', user.role === 'doctor' ? 'doctor-dashboard.html' : 'patient-dashboard.html');
      });
    }
  } catch (e) { /* app.js not loaded yet or storage unavailable — safe to ignore */ }
});
