# Invoice Tracker

A Next.js application for tracking invoices and managing tasks. This application helps in monitoring time spent on tasks, managing project costs, and tracking development progress.

## Features

- Task management with time tracking
- Invoice generation and tracking
- Developer efficiency analysis
- Google Sheets integration for data storage
- Modern UI with Tailwind CSS

## Setup

1. Clone the repository:
```bash
git clone https://github.com/destinpq/santulan_invoice.git
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with the following:
```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account-email
GOOGLE_PRIVATE_KEY=your-private-key
SPREADSHEET_ID=your-spreadsheet-id
```

4. Run the development server:
```bash
npm run dev
```

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Google Sheets API

## Prerequisites

- Node.js (v16.x or newer)
- npm or yarn
- A Google Cloud Platform account with Google Sheets API enabled
- A service account with access to Google Sheets API

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
