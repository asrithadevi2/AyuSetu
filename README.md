# Ayusetu

> **Your story. Your care. Better understood.**

Ayusetu is an AI-assisted healthcare case-preparation platform that helps patients organize their symptoms, medical history, and concerns into a structured case before meeting their doctor.

---

##  Key Features

- **Guided Patient Case Intake**: 4-step progressive case preparation:
  1. Doctor Selection
  2. Story Formulation (Type or Natural Voice Dictation)
  3. AI Assist Adaptive Clarifying Questions
  4. Structured Case Summary & Submission
- **Voice-to-Text Input**: Dictate symptoms naturally using the Web Speech API with multilingual support (English, Telugu, Hindi).
- **Urgency & Triage Detection**: Automatically flags critical symptoms (chest pain, breathing difficulties, unconsciousness, severe bleeding) for high-priority triage.
- **Doctor Workspace**: Triage dashboard for reviewing incoming patient cases, writing clinical notes/prescriptions, and updating case status.
- **Follow-up Flows**: Link new concerns directly to previous consultations.
- **Direct Messaging**: Private, case-scoped communication between patient and doctor.
- **Family Profiles**: Manage separate health profiles for family members and prepare cases on their behalf.
- **Medical History**: Chronological records of all submitted cases with structured Q&A.
- **Emergency SOS**: Rapid access to emergency protocols and helpline links.

---

##  Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)

### Installation & Running Locally

1. Open your terminal in this directory:
   ```bash
   cd e:\Ayusetu
   ```

2. Start the local server:
   ```bash
   npm start
   ```
   *Or:*
   ```bash
   node server.js
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---
##  Demo Accounts

For quick local testing, you can use the 1-click **Quick Demo Accounts** buttons on the login page or enter:

| Role | Name | Email | Password | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Doctor** | Dr. Priya Sharma | `doctor@ayusetu.com` | `password123` | Cardiology & Internal Medicine, Apollo Hospitals |
| **Doctor** | Dr. Rajesh Kumar | `rajesh@ayusetu.com` | `password123` | General Medicine, Care Hospitals |
| **Patient** | Rahul Verma | `patient@ayusetu.com` | `password123` | Active case ready for triage & messaging |

*(You can also use `doctor@ayusetu.org` or `patient@ayusetu.org` with `password123`)*
