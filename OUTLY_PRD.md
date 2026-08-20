# Outly — Product Requirements Document (PRD)

---

## 1. Product Overview

- **Product Name**: Outly
- **Product Type**: Email outreach, follow-up, and tracking platform
- **Primary Use Case**: Help users manage outreach campaigns from contact data extracted from uploaded PDF files.

### One-line product definition
> Outly turns contact data from a PDF into organized email campaigns with automated follow-ups and engagement tracking.

---

## 2. Problem Statement

People who regularly contact recruiters, hiring managers, clients, founders, mentors, or other professional contacts often manage outreach manually.

### Common problems:
- Contact information is trapped inside PDFs.
- Emails have to be copied manually.
- Personalized messages take time to create.
- Follow-ups are easy to forget.
- There is no single place to see sent emails, pending follow-ups, replies, and campaign performance.
- Manual tracking becomes difficult as the number of contacts increases.

Outly solves this by combining contact extraction, email sending, follow-up automation, and campaign tracking into one unified workflow.

---

## 3. Goals

### Primary Goals
- Allow users to upload a PDF containing contact information.
- Extract useful contact fields from the PDF.
- Allow users to review and edit extracted contacts before sending.
- Allow users to create reusable email templates.
- Personalize emails using contact variables.
- Send outreach emails through a connected email account.
- Schedule automated follow-ups.
- Stop follow-ups when a recipient replies.
- Track email activity and campaign status.
- Provide a simple dashboard for monitoring campaigns.

### Secondary Goals
- Support multiple campaigns.
- Allow contacts to be reused across campaigns.
- Provide basic campaign analytics.
- Keep the product simple enough for a solo user to operate.

---

## 4. Non-Goals for V1

The first version should **NOT** attempt to become a full ATS or CRM.

Do not prioritize:
- Resume generation
- Job scraping
- Automatic job applications
- LinkedIn automation
- WhatsApp automation
- Complex AI agents
- Large-scale sales CRM functionality
- Advanced lead scoring
- Complex marketing automation
- Multi-channel outreach

---

## 5. Target Users

### Primary Users
- Students contacting recruiters
- Job seekers
- Freelancers doing client outreach
- Founders doing cold outreach
- Professionals doing networking outreach
- Community managers and mentors

### Example User
A final-year student has a PDF containing 200 recruiter contacts. Instead of manually copying every email, the user uploads the PDF to Outly, reviews the extracted contacts, creates an email campaign, sends the first email, and lets Outly manage scheduled follow-ups.

---

## 6. Core User Journey

```text
Upload PDF
    ↓
Extract Contact Data
    ↓
Review / Edit Contacts
    ↓
Create Campaign
    ↓
Write Email Template
    ↓
Connect Email Account
    ↓
Send Campaign
    ↓
Track Activity
    ↓
Wait for Reply
    ↓
No Reply → Follow-up
    ↓
Reply → Stop Follow-ups
```

---

## 7. Functional Requirements

### 7.1 PDF Upload

**Requirement**: Users can upload a PDF containing contact information.

- **Supported input**:
  - PDF files (Text-based PDFs in V1)
- **Future support**:
  - Scanned PDFs through OCR
  - CSV / Excel / DOCX
- **Validation**:
  - Accept PDF only in V1.
  - Validate file size limits.
  - Reject unsupported files gracefully.
  - Show upload progress and extraction status.

### 7.2 Contact Extraction

Outly should extract fields such as:
- **Name**
- **Email**
- **Company**
- **Role / Job Title**
- **Phone number** (if available)
- Additional useful information when reliably identifiable

**Extraction behavior**:
- Extract raw text from PDF.
- Detect email addresses and identify surrounding contact details.
- Build structured contact records and remove obvious duplicates.
- Present extracted contacts for user review.

> [!IMPORTANT]
> PDF extraction is not guaranteed to be perfect. Therefore, Outly **MUST** provide a review/edit screen before emails can be sent.

---

## 8. Contact Management

Users should be able to:
- View and search contacts
- Edit contact fields
- Delete unwanted contacts
- Select multiple contacts
- Filter contacts by status
- Assign contacts to campaigns

### Contact Statuses
- `pending`
- `ready`
- `sent`
- `follow_up_pending`
- `replied`
- `bounced`
- `completed`
- `failed`

---

## 9. Campaign Management

Users can create and manage outreach campaigns.

### Campaign Fields
- Campaign name
- Description
- Email subject & body template
- Selected contacts
- Follow-up sequence settings
- Sending schedule
- Campaign status

### Campaign Statuses
- `draft`
- `scheduled`
- `running`
- `paused`
- `completed`
- `failed`

---

## 10. Email Templates

Outly should support reusable variables within subject lines and email bodies.

### Template Example
```text
Hi {{name}},

I am reaching out regarding the {{role}} opportunity at {{company}}.

Regards,
Vivek
```

### Supported Variables in V1
- `{{name}}`
- `{{email}}`
- `{{company}}`
- `{{role}}`

The system automatically replaces variables prior to dispatching each message.

---

## 11. Email Sending

Users connect an email account to dispatch campaigns.

### Integration Details
- **Gmail API / OAuth 2.0** is preferred for production.
- **SMTP** can be used during early development/testing.

### Requirements
- Connect email account securely.
- **Never** store the user's email password.
- Send emails through the authorized provider.
- Record send status and handle failures gracefully.
- Avoid duplicate sends.
- Respect provider sending limits.

### Send Modes
1. **Send immediately**
2. **Schedule campaign**

---

## 12. Follow-up Automation

Follow-up automation is one of Outly's core value propositions.

### Example Sequence
- **Day 0**: Initial Email
- **Day 3**: Follow-up #1
- **Day 7**: Follow-up #2
- **Day 12**: Final Follow-up

### Follow-up Rules
Before sending every follow-up step, Outly must:
1. Check whether the recipient has replied.
2. Check whether the campaign is currently active.
3. Check whether the contact is eligible for another follow-up.
4. **If a reply is detected**, cancel all remaining follow-ups for that contact.
5. Otherwise, dispatch the scheduled follow-up.

```text
Initial email
      ↓
No reply
      ↓
Follow-up #1
      ↓
Recipient replies
      ↓
STOP ALL REMAINING FOLLOW-UPS
```

---

## 13. Reply Detection

Outly periodically checks the connected mailbox for incoming replies.

### Detection Logic
```text
Incoming email
      ↓
Identify sender
      ↓
Match sender to contact
      ↓
Match campaign/thread where possible
      ↓
Mark contact status as "replied"
      ↓
Cancel pending follow-ups
```

The user should be able to see exactly when a reply was detected in the dashboard and timeline.

---

## 14. Email Tracking

Outly provides a detailed activity timeline for each email sent.

### Tracked Events
- `sent`
- `delivered`
- `opened`
- `clicked`
- `replied`
- `bounced`
- `failed`

> [!WARNING]
> Open tracking is not 100% guaranteed. Email clients may block, cache, or prefetch tracking pixels. Outly treats opens as **observed/estimated engagement** rather than absolute proof of human reading.

---

## 15. Contact Timeline

### Example Contact Record
**Rahul Sharma** | ABC Technologies

```text
Aug 20 — Email sent
Aug 20 — Open detected
Aug 20 — Link clicked
Aug 23 — Follow-up scheduled
Aug 24 — Reply received
Aug 24 — Follow-ups cancelled

Status: Replied
```

---

## 16. Dashboard

The dashboard provides top-level metrics and detailed campaign insights.

### Top-Level Metrics
- Total contacts
- Emails sent
- Emails pending
- Follow-ups pending
- Replies received
- Bounces & Failures

### Campaign Analytics
- Total recipients
- Sent / Opened / Clicked / Replied counts
- Follow-ups sent vs. pending

---

## 17. Suggested Screens

1. **Dashboard**: Overview of campaigns, activity, and key metrics.
2. **Upload PDF**: PDF upload drag-and-drop zone and extraction progress.
3. **Contacts**: Data grid to review, edit, search, filter, and select contacts.
4. **Create Campaign**: Form to set campaign name, description, and target recipients.
5. **Email Composer**: Editor for email subject/body with live variable replacement preview.
6. **Follow-up Sequence**: Interface to configure delay days and follow-up templates.
7. **Campaign Details**: Status tracking and per-recipient breakdown.
8. **Contact Details**: Individual contact activity timeline.
9. **Settings**: Email OAuth connections and account configuration.

---

## 18. Technical Architecture

```text
                    Outly Frontend
                         |
                         v
                    REST API
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
     PDF Service    Campaign API    Email Service
          |              |              |
          v              v              v
     PDF Parser       MongoDB       Gmail API
                                         |
                                         v
                                  Email Provider
                                         |
                         +---------------+---------------+
                         |                               |
                         v                               v
                  Reply Detection                 Tracking
                         |                               |
                         +---------------+---------------+
                                         |
                                         v
                                      MongoDB
                                         |
                                         v
                                      Dashboard
```

---

## 19. Recommended Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **PDF Processing** | `pdf-parse` (or equivalent text extractor), OCR planned later |
| **Email Integration** | Gmail API, OAuth 2.0 (Nodemailer for early testing) |
| **Queue / Scheduling** | BullMQ, Redis |
| **Deployment** | Vercel (Frontend), Render/Railway (Backend), MongoDB Atlas, Managed Redis |

---

## 20. Initial Data Models

### User Schema
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Contact Schema
```typescript
interface Contact {
  id: string;
  name: string;
  email: string;
  company?: string;
  role?: string;
  status: 'pending' | 'ready' | 'sent' | 'follow_up_pending' | 'replied' | 'bounced' | 'completed' | 'failed';
  sourceFile?: string;
  lastEmailSentAt?: Date;
  nextFollowUpAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Campaign Schema
```typescript
interface Campaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'failed';
  contacts: string[]; // Reference to Contact IDs
  followUps: {
    delayDays: number;
    subject: string;
    body: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Email Schema
```typescript
interface Email {
  id: string;
  campaignId: string;
  contactId: string;
  messageId?: string;
  type: 'initial' | 'follow_up';
  subject: string;
  body: string;
  status: 'queued' | 'sent' | 'failed';
  scheduledAt: Date;
  sentAt?: Date;
  createdAt: Date;
}
```

### EmailEvent Schema
```typescript
interface EmailEvent {
  id: string;
  emailId: string;
  contactId: string;
  eventType: 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'failed';
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

---

## 21. API Requirements

### Contacts API
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/contacts/upload` | Upload PDF and extract contacts |
| `GET` | `/api/contacts` | List contacts with filtering/search |
| `GET` | `/api/contacts/:id` | Get contact details & timeline |
| `PUT` | `/api/contacts/:id` | Update contact information |
| `DELETE` | `/api/contacts/:id` | Delete a contact |

### Campaigns API
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/campaigns` | Create a new campaign |
| `GET` | `/api/campaigns` | List all campaigns |
| `GET` | `/api/campaigns/:id` | Get campaign details & analytics |
| `PUT` | `/api/campaigns/:id` | Update campaign settings |
| `DELETE` | `/api/campaigns/:id` | Delete a campaign |
| `POST` | `/api/campaigns/:id/start` | Launch campaign sending |
| `POST` | `/api/campaigns/:id/pause` | Pause active campaign |

### Email & Tracking API
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/emails/test` | Send a test email |
| `POST` | `/api/emails/send` | Trigger manual email dispatch |
| `GET` | `/api/emails/:id` | Get email status |
| `GET` | `/api/tracking/open/:id` | Tracking pixel endpoint |
| `GET` | `/api/tracking/click/:id` | Link click tracking redirect |

### Auth & Gmail API
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/auth/google` | Initiate Google OAuth flow |
| `GET` | `/api/auth/google/callback` | Google OAuth callback handler |
| `POST` | `/api/auth/disconnect` | Revoke email authorization |

---

## 22. MVP Acceptance Criteria

The MVP is considered complete when a user can:
- [x] 1. Upload a PDF document.
- [x] 2. Extract email/contact information automatically.
- [x] 3. Review and edit extracted contacts.
- [x] 4. Create an outreach campaign.
- [x] 5. Compose a personalized email template using contact variables.
- [x] 6. Securely connect a Gmail account via OAuth.
- [x] 7. Send outreach emails and monitor send status.
- [x] 8. Configure multi-step follow-up schedules.
- [x] 9. Automatically send follow-ups when no response is received.
- [x] 10. Automatically detect recipient replies and halt remaining follow-ups.
- [x] 11. View campaign performance metrics on a dashboard.
- [x] 12. View individual contact timeline records.

---

## 23. Development Plan

- **Phase 1 --- Foundation**: Project setup, backend/frontend initialization, MongoDB connection, environment configuration.
- **Phase 2 --- PDF & Contacts**: PDF upload, text extraction, contact parsing logic, review UI, Contact CRUD endpoints.
- **Phase 3 --- Campaigns**: Campaign CRUD endpoints, email templates, variable replacement engine, campaign UI pages.
- **Phase 4 --- Email Sending**: Gmail OAuth integration, email sending service, BullMQ queue, send status tracking, error handling.
- **Phase 5 --- Follow-ups**: Follow-up sequence configuration, BullMQ scheduler, reply detection mechanism, automated cancellation.
- **Phase 6 --- Tracking**: Email tracking events, contact activity timeline, campaign analytics dashboard.
- **Phase 7 --- Deployment**: Frontend & backend deployment, managed Redis & MongoDB setup, production OAuth verification, security audit.

---

## 24. Security Requirements

- **Never** store raw email passwords.
- Use OAuth 2.0 for Gmail authorization.
- Encrypt sensitive OAuth tokens at rest in the database.
- Validate all uploaded files and strictly limit max file size.
- Sanitize extracted contact data before persistence.
- Protect all API endpoints with authentication middleware.
- Enforce HTTPS across frontend and backend in production.
- Do not expose provider secret tokens to the client frontend.
- Implement rate limiting on public and sensitive routes.
- Secure all secrets in environment variables (`.env`).

---

## 25. Product Principle

> **Outly should be:**
> *Simple enough to use in one minute, powerful enough to run an entire outreach campaign automatically.*