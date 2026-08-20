# Outly

> **Reach out. Follow up. Never lose a lead.**

Outly is an email outreach and follow-up platform that turns contact data from uploaded PDFs into organized email campaigns.

Instead of manually copying contacts, sending repetitive emails, remembering follow-ups, and tracking replies in spreadsheets, Outly brings the workflow into one place.

---

## ✨ What Outly Does

```text
PDF
 ↓
Extract Contacts
 ↓
Review / Edit
 ↓
Create Campaign
 ↓
Personalized Email
 ↓
Send
 ↓
Track
 ↓
No Reply → Follow-up
 ↓
Reply → Stop Follow-ups
```

---

## 🚀 Core Features

### 📄 PDF Contact Extraction
Upload a PDF containing contact information and extract:
- **Name**
- **Email**
- **Company**
- **Role**
- Other useful contact details when available

### 👥 Contact Management
- Review extracted contacts
- Edit contact information
- Delete contacts
- Search and filter
- Track contact status

### 📧 Personalized Email Campaigns
Create templates using variables:

```text
Hi {{name}},

I am reaching out regarding the {{role}} opportunity at {{company}}.

Regards,
Vivek
```

Outly replaces the variables automatically for each contact.

### ⏰ Automated Follow-ups
Configure sequences such as:
- **Day 0** → Initial email
- **Day 3** → Follow-up #1
- **Day 7** → Follow-up #2
- **Day 12** → Final follow-up

> [!NOTE]
> If the recipient replies, future follow-ups are automatically stopped.

### 📊 Tracking
Track available email events such as:
- Sent
- Delivered
- Opened
- Clicked
- Replied
- Bounced
- Failed

### 📈 Campaign Dashboard
See:
- Total contacts
- Emails sent
- Pending emails
- Follow-ups pending
- Replies
- Campaign performance
- Individual contact timelines

---

## 🧑‍💻 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Email**: Gmail API, OAuth 2.0 (Nodemailer for dev/testing)
- **Automation**: BullMQ, Redis
- **PDF Processing**: PDF text extraction (OCR planned for post-MVP)

---

## 📁 Project Structure

```text
Outly/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── uploads/
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
└── README.md
```

---

## ⚙️ Local Development Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd Outly
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
```

Start backend server:
```bash
npm run dev
```
The backend will run on: `http://localhost:5000`

### 3. Frontend setup
Open another terminal window:
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on: `http://localhost:5173`

---

## 🗄️ Database

Outly uses **MongoDB**. Main collections include:
- `users`
- `contacts`
- `campaigns`
- `emails`
- `email_events`

---

## 📧 Gmail Integration

For production, Outly uses Google OAuth rather than asking users for their Gmail password.

```text
User
 ↓
Connect Gmail
 ↓
Google OAuth
 ↓
Grant permission
 ↓
Outly receives authorized credentials
 ↓
Outly sends email through Gmail API
```

> [!IMPORTANT]
> Provider credentials must remain server-side and must never be exposed to the frontend.

---

## 🔄 Follow-up Logic

```text
Initial Email
     |
     v
Wait 3 Days
     |
     v
Check Reply
     |
  +--+--+
  |     |
 Yes    No
  |     |
 STOP   Follow-up #1
        |
        v
     Wait 4 Days
        |
        v
     Check Reply
        |
     +--+--+
     |     |
    Yes    No
     |     |
    STOP  Follow-up #2
```

---

## 📊 Example Campaign

### Campaign Name
`August Internship Outreach`

### Contacts
- **Rahul Sharma** (`rahul@example.com`) | ABC Technologies — *Software Engineer Intern*
- **Priya Singh** (`priya@example.com`) | XYZ Labs — *SDE Intern*

### Initial Email Template
**Subject:** `Application for {{role}} at {{company}}`

**Body:**
```text
Hi {{name}},

I hope you're doing well.

I am reaching out regarding the {{role}} opportunity at {{company}}.

I would be grateful if you could consider my profile.

Regards,
Vivek Rai
```

---

## 🛑 Reply Handling

When a reply is detected:

```text
Contact status → replied

Pending follow-ups
        ↓
    CANCELLED
```

This prevents Outly from continuing to send automated follow-ups after a recipient has responded.

---

## 📌 Development Roadmap

- [ ] **Phase 1 --- Foundation**: Create project, configure backend & frontend, connect MongoDB, setup `.env`.
- [ ] **Phase 2 --- PDF & Contacts**: PDF upload, text & email extraction, contact parser, review page, Contact CRUD.
- [ ] **Phase 3 --- Campaigns**: Campaign creation & editing, email template editor, template variables, personalized preview.
- [ ] **Phase 4 --- Email Sending**: Gmail OAuth, email service, test email, campaign sending, send status, error handling.
- [ ] **Phase 5 --- Follow-ups**: Follow-up configuration, scheduling, background jobs, reply detection, automatic cancellation.
- [ ] **Phase 6 --- Tracking**: Email events, contact timeline, campaign analytics, dashboard.
- [ ] **Phase 7 --- Production**: Authentication, rate limiting, secure token storage, production OAuth, deployment, monitoring, error logging.

---

## 🧪 MVP Definition

Outly's MVP is successful when a user can:
1. Upload a PDF.
2. Extract contacts.
3. Review/edit the extracted contacts.
4. Create an email campaign.
5. Personalize emails.
6. Connect Gmail.
7. Send emails.
8. Schedule follow-ups.
9. Detect replies.
10. Stop follow-ups after a reply.
11. View campaign statistics.
12. View each contact's email timeline.

---

## ⚠️ Tracking Note

> [!WARNING]
> Email tracking is not always perfectly reliable. Open tracking can be affected by email client privacy features, image blocking, tracking protection, link scanners, and automated email prefetching.
> Therefore, Outly describes opens as **observed/estimated engagement**, not guaranteed proof that a person read an email.

---

## 🔐 Security

Outly strictly enforces security best practices:
- Never store email passwords.
- Use OAuth for Gmail authentication.
- Keep access tokens exclusively on the backend.
- Validate uploaded files and restrict upload sizes.
- Sanitize extracted content before processing.
- Use HTTPS and API rate limiting in production.
- Keep secrets secured in environment variables.

---

## 💡 Future Ideas

Possible post-MVP features:
- AI-generated personalized emails & follow-ups
- CSV/Excel import
- OCR for scanned PDFs
- Multiple email provider support
- Email thread view
- Templates library & contact tags
- Advanced analytics & team workspaces
- Custom domains, webhooks, and CRM integrations

---

## 🤝 Contribution

Suggested workflow:

```text
Feature → Create branch → Implement → Test → Pull Request → Review → Merge
```

---

**Outly** — *Reach out. Follow up. Never lose a lead.*
