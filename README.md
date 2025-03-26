# Invoice Tracker

A Next.js application for tracking development tasks, hours invested, and costs. This application uses Google Sheets as a backend database.

## Features

- View tasks organized by month or category/bucket
- Different costs for bug fixes (Rs200) and new features (Rs300)
- Track tasks with detailed information including reporter, severity, screenshots, and more
- Developer portal for updating hours on assigned tasks
- Dashboard with key metrics (total tasks, pending money, hours invested)
- Modern UI with responsive design

## Prerequisites

- Node.js (v16.x or newer)
- npm or yarn
- A Google Cloud Platform account with Google Sheets API enabled
- A service account with access to Google Sheets API

## Setup

1. Clone the repository
```bash
git clone <repository-url>
cd invoice-tracker
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up Google Sheets

You'll need to:
- Create a new Google Sheet with a sheet named "Tasks" and the following headers in row 1:
  - ID, Timestamp, EmailAddress, DateReported, ReportedBy, Type, Severity, Screenshot, Bucket, Description, Month, Developer, HoursInvested, Cost, Status
- Create a service account in Google Cloud Console and download the JSON credentials
- Share your Google Sheet with the email address of your service account (with Editor permissions)

4. Set up environment variables

Create a `.env.local` file in the root directory with the following variables:
```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account-email@your-project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=yoursecretkey123
```

5. Run the development server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

### Public Dashboard

The home page displays:
- Statistics about tasks, costs, and hours
- Tasks organized by month or category (switchable view)
- A form to add new tasks with detailed information

### Developer Portal

Developers can access their tasks by:
1. Clicking on "Developer Login" on the home page
2. Entering their unique developer key
3. Viewing their assigned tasks
4. Updating the hours invested in their tasks

## Task Fields

Each task includes the following information:
- **Email Address**: The email of the person who reported the issue
- **Date Reported**: When the issue was reported
- **Reported By**: Name of the person who reported the issue
- **Type**: Bug or Feature (affects cost calculation)
- **Severity**: Urgency level (Low, Medium, High, Critical, Urgent)
- **Screenshot**: Optional URL to a screenshot
- **Bucket/Category**: What area the task belongs to
- **Description**: Detailed description of the task
- **Month**: Which month the task is assigned to
- **Developer**: The developer responsible for the task
- **Hours Invested**: Time spent on the task
- **Status**: Pending or Completed

## Project Structure

- `/src/app`: Next.js app router pages
- `/src/components`: React components
- `/src/lib`: Utility functions and API integrations

## License

MIT
