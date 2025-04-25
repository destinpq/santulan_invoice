# Vercel Environment Setup Instructions

To complete the setup of your Invoice Tracker on Vercel with real Google Sheets integration, please follow these steps:

## Required Environment Variables

You need to add the following environment variables to your Vercel project:

1. **SPREADSHEET_ID** - The ID of your Google Spreadsheet (already added)
2. **GOOGLE_SERVICE_ACCOUNT_EMAIL** - Your Google service account email (already added)
3. **GOOGLE_PRIVATE_KEY** - The private key for your Google service account
4. **GOOGLE_APPLICATION_CREDENTIALS** - The full JSON credentials for your service account

## How to Add the Remaining Variables

### GOOGLE_PRIVATE_KEY

1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
2. Add a new Environment Variable:
   - Name: `GOOGLE_PRIVATE_KEY`
   - Value: Copy the value from your local `.env.local` file
   - Environment: Production
   - Click "Add"

### GOOGLE_APPLICATION_CREDENTIALS

1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
2. Add a new Environment Variable:
   - Name: `GOOGLE_APPLICATION_CREDENTIALS`
   - Value: Copy the value from your local `.env.local` file
   - Environment: Production
   - Click "Add"

## Redeploy Your Application

After adding all the environment variables, redeploy your application:

```bash
vercel --prod
```

## Verify Real Google Sheets Integration

After deployment, test that your application is correctly using the real Google Sheets by:

1. Adding a new task
2. Checking if it appears in your Google Spreadsheet
3. Making changes to task status on the Kanban board and confirming those changes are reflected in the Google Spreadsheet

If your application is successfully deployed but doesn't connect to Google Sheets, double-check that:

1. The service account has edit access to your Google Spreadsheet
2. The environment variables are correctly set in Vercel
3. The private key format is preserved with newlines (`\n`) intact when adding to Vercel 