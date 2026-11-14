# MediLink - Healthcare Software Solution
 
An online consultation platform that connects patients with doctors. Patients book a slot on a doctor's published schedule, pay upfront, join a video call, and receive a digital prescription by email. Admins approve doctors and manage accounts.
 
> **Status:** In development. See [REQUIREMENTS.md](./REQUIREMENTS.md) for the full specification.
 
## Features
 
**Patient**
- Register with email and OTP, or sign in with Google
- Browse doctors and today's available schedules
- Book a slot, pay online, and get a serial number
- Cancel an appointment (refund if more than 1 hour before start)
- Join the video call and receive the prescription by email
**Doctor**
- Apply to join, then log in after admin approval
- Create and publish daily schedules in 20-minute slots
- Manage appointments: booked, ongoing, completed
- Write prescriptions with medicines and doses
**Admin and Super Admin**
- Approve or reject doctor applications
- Block or unblock doctors and patients
- Create admins (Super Admin also creates Super Admins and manages admins)
## Tech stack
 
| Layer | Technology |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma |
| Cache and queue | Redis, BullMQ |
| Tooling | pnpm workspaces, Zod, Docker, CI/CD |
| Testing | Vitest or Jest, Supertest, Playwright |