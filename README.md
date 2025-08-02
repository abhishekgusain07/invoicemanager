<p align="center">
  <picture>
    <source srcset="public/invoicemanager-logo.png" media="(prefers-color-scheme: dark)">
    <img src="public/invoicemanager-logo.png" alt="Invoice Manager Logo" width="64" style="background-color: #000; padding: 10px;"/>
  </picture>
</p>

# Invoice Manager

An Open-Source Invoice Management App

![InvoiceManager Banner](https://invoicemanager.abhishekgusain.com/Banner.png)

## What is Invoice Manager?

Invoice Manager is an open-source AI-powered solution that gives users the power to **self-host** their own invoice management app while also integrating external services like Gmail and other email providers. Our goal is to modernize and improve invoice management through AI agents.

## Why Invoice Manager?

Most invoice management services today are either **closed-source**, **data-hungry**, or **too complex to self-host**.
Invoice Manager is different:

- ✅ **Open-Source** – No hidden agendas, fully transparent.
- **AI Driven** - Enhance your invoice management with Agents & LLMs.
- **Data Privacy First** – Your invoices, your data. Invoice Manager does not track, collect, or sell your data in any way. Please note: while we integrate with external services, the data passed through them is not under our control and falls under their respective privacy policies and terms of service.
- ⚙️ **Self-Hosting Freedom** – Run your own invoice management app with ease.
- **Unified Inbox** – Connect multiple email providers like Gmail, Outlook, and more to manage invoices.
- **Customizable UI & Features** – Tailor your invoice management experience the way you want it.
- **Developer-Friendly** – Built with extensibility and integrations in mind.

## Features

- **Client & Invoice Management**: Easily manage invoices for multiple clients with sleek, professional templates that are ready to send.
- **Automated Reminders**: Configure automated reminders for your clients. Set up a schedule for when to send reminders, such as 3 days before the due date, on the due date, and after the due date.
- **Customizable Email Templates**: Create and customize email templates to send to your clients.
- **Insightful Dashboard**: Get a comprehensive overview of your business with a beautiful dashboard that displays key metrics like total revenue, growth, and more.
- **Gmail Integration**: Connect your personal Gmail account to send invoices and reminders directly from your own email address. Depending on your pricing tier, you can connect multiple Gmail accounts:
  - **Freelancer**: 1 Gmail account
  - **Agency**: 3 Gmail accounts
  - **Enterprise**: 5 Gmail accounts

## Tech Stack

Invoice Manager is built with modern and reliable technologies:

- **Frontend**: Next.js, React, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Node.js, Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: Better Auth, Google OAuth
- **Testing**: Jest, React Testing Library

## Getting Started

### Prerequisites

**Required Versions:**

- [Node.js](https://nodejs.org/en/download) (v18 or higher)
- [pnpm](https://pnpm.io) (v10 or higher)
- [Docker](https://docs.docker.com/engine/install/) (v20 or higher)

Before running the application, you'''ll need to set up services and configure environment variables.

### Setup

1. **Clone and Install**

   ```bash
   # Clone the repository
   git clone <your-repo-url>
   cd invoicemanager

   # Install dependencies
   pnpm install

   # Start database locally
   pnpm docker:db:up
   ```

2. **Set Up Environment**
   - Create a `.env` file from `.env.example`
   - Start the database with the provided docker compose setup: `pnpm docker:db:up`
   - Initialize the database: `pnpm db:push`

3. **Start the App**

   ```bash
   pnpm dev
   ```

4. **Open in Browser**

   Visit [http://localhost:3000](http://localhost:3000)

### Environment Setup

1. **Better Auth Setup**
   - Open the `.env` file and change the BETTER_AUTH_SECRET to a random string. (Use `openssl rand -hex 32` to generate a 32 character string)

     ```env
     BETTER_AUTH_SECRET=your_secret_key
     ```

2. **Google OAuth Setup** (Required for Gmail integration)
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Add the following APIs in your Google Cloud Project: [People API](https://console.cloud.google.com/apis/library/people.googleapis.com), [Gmail API](https://console.cloud.google.com/apis/library/gmail.googleapis.com)
     - Use the links above and click '''Enable''' or
     - Go to '''APIs and Services''' > '''Enable APIs and Services''' > Search for '''Google People API''' and click '''Enable'''
     - Go to '''APIs and Services''' > '''Enable APIs and Services''' > Search for '''Gmail API''' and click '''Enable'''
   - Enable the Google OAuth2 API
   - Create OAuth 2.0 credentials (Web application type)
   - Add authorized redirect URIs:
     - Development:
       - `http://localhost:3000/api/auth/callback/google`
     - Production:
       - `https://your-production-url/api/auth/callback/google`
   - Add to `.env`:

     ```env
     GOOGLE_CLIENT_ID=your_client_id
     GOOGLE_CLIENT_SECRET=your_client_secret
     ```

   - Add yourself as a test user:
     - Go to [`Audience`](https://console.cloud.google.com/auth/audience)
     - Under '''Test users''' click '''Add Users'''
     - Add your email and click '''Save'''

> [!WARNING]
> The authorized redirect URIs in Google Cloud Console must match **exactly** what you configure in the `.env`, including the protocol (http/https), domain, and path - these are provided above.

### Database Setup

Invoice Manager uses PostgreSQL for storing data. Here'''s how to set it up:

1. **Start the Database**

   Run this command to start a local PostgreSQL instance:

   ```bash
   pnpm docker:db:up
   ```

   This creates a database with:
   - Name: `invoicemanager`
   - Username: `postgres`
   - Password: `postgres`
   - Port: `5432`

2. **Set Up Database Connection**

   Make sure your database connection string is in `.env` file.

   For local development use:

   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/invoicemanager"
   ```

3. **Database Commands**
   - **Set up database tables**:

     ```bash
     pnpm db:push
     ```

   - **Create migration files** (after schema changes):

     ```bash
     pnpm db:generate
     ```

   - **Apply migrations**:

     ```bash
     pnpm db:migrate
     ```

## Contribute

Please refer to the contributing guide.
