# cold-email-automater

Build a modern SaaS dashboard UI for an AI-powered job outreach assistant.

The application helps students and job seekers manage referral outreach campaigns.

The product flow:

Find people → Research them → Generate personalized messages → Review → Contact → Track responses.

The design should feel like a modern AI productivity tool.

Inspiration:

Linear

Notion

HubSpot CRM

Perplexity

modern SaaS dashboards

Main Navigation

Create a sidebar:

Dashboard

Campaigns

Candidates

Messages

Follow-ups

Analytics

Settings

Dashboard Screen

Create a clean overview.

Cards:

Active Campaigns

Total Candidates

Messages Sent

Response Rate

Referrals

Interviews

Example:

RBC SWE Internship

Candidates:
50

Contacted:
32

Replies:
8

Referral Conversations:
5

Campaign Creation Screen

Create a form:

Create New Outreach Campaign

Fields:

Company

Role

Location

Job URL

Number of people to find

Seniority level

Preferred background

Keywords

Button:

"Find Candidates"

Candidate Discovery Screen

Create a table.

Columns:

Name

Company

Role

Location

Match Score

Connection Reason

Status

Example row:

Sarah Chen

Software Engineer @ RBC

Toronto

94/100

Why:

✓ Ontario Tech

✓ SWE background

✓ Similar career path

Actions:

View

Research

Generate Message

Candidate Detail Page

Create a profile page.

Left side:

Candidate information

Name

Role

Company

Education

Skills

Experience

Match Score:

94/100

Connection reasons:

Same university

Same city

Similar career path

Right side:

AI Research Summary

Potential outreach angle:

"Ask about transitioning from university into RBC software engineering."

Message Review Page

Create an email/LinkedIn message editor.

Show:

Candidate:

Sarah Chen

Generated Message:

Hi Sarah...

Buttons:

Edit

Regenerate

Copy Message

Open LinkedIn

Mark Sent

Outreach CRM Page

Create a Kanban board.

Columns:

Discovered

Researching

Ready

Contacted

Replied

Referral

Interview

Cards should show:

Name

Company

Match Score

Last contacted

Next action

Analytics Page

Create charts/cards:

Response Rate

Referral Conversion

Messages Sent Over Time

Best Performing Campaigns

Best Connection Types

Design Requirements

Use:

TypeScript

React

Tailwind CSS

shadcn/ui components

Design should be:

clean

professional

minimal

recruiter/productivity focused

responsive

Avoid:

flashy gradients

excessive animations

clutter

The feeling should be:

"An AI career operating system."

Create reusable components.

Use realistic sample data.

Focus on excellent UX.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://career-muse-dash.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/26e42559-5ec9-4480-9a76-fbb10734d551).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
