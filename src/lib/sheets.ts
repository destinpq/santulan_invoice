import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// Define types for our data
export interface Task {
  id: string;
  timestamp: string;
  emailAddress: string;
  dateReported: string;
  reportedBy: string;
  type: 'bug' | 'feature';
  severity: string;
  screenshot?: string;
  bucket: string;
  description: string;
  month: string;
  developer: string;
  hoursInvested: number;
  cost: number;
  status: 'pending' | 'completed';
  kanbanStatus: 'todo' | 'in-progress' | 'review' | 'done';
  lastModified?: string; // Timestamp of the last status update
}

// Get the spreadsheet ID from env
const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1_40r55K_kFme_UCSqdkKKU2ZwDUmWp6540qRe7imwZk';
// This will be populated after we get the sheet info
let SHEET_NAME = '';

// Mock data to use when Google Sheets API is not available or having issues
const MOCK_TASKS: Task[] = [
  {
    id: '1',
    timestamp: new Date(2023, 4, 1).toISOString(),
    emailAddress: 'john@example.com',
    dateReported: '2023-05-01',
    reportedBy: 'John Doe',
    type: 'bug',
    severity: 'High',
    bucket: 'Frontend',
    description: 'Login page not working on mobile devices',
    month: 'May',
    developer: 'destinpq',
    hoursInvested: 3.5,
    cost: 200,
    status: 'completed',
    kanbanStatus: 'done',
    lastModified: new Date(2023, 4, 5).toISOString()
  },
  {
    id: '2',
    timestamp: new Date(2023, 4, 15).toISOString(),
    emailAddress: 'sarah@example.com',
    dateReported: '2023-05-15',
    reportedBy: 'Sarah Smith',
    type: 'feature',
    severity: 'Medium',
    bucket: 'Backend',
    description: 'Add export to CSV functionality',
    month: 'May',
    developer: 'destinpq',
    hoursInvested: 5,
    cost: 300,
    status: 'completed',
    kanbanStatus: 'done',
    lastModified: new Date(2023, 4, 20).toISOString()
  },
  {
    id: '3',
    timestamp: new Date(2023, 5, 5).toISOString(),
    emailAddress: 'mike@example.com',
    dateReported: '2023-06-05',
    reportedBy: 'Mike Johnson',
    type: 'bug',
    severity: 'Critical',
    bucket: 'Database',
    description: 'Data not saving to database intermittently',
    month: 'June',
    developer: 'destinpq',
    hoursInvested: 8,
    cost: 200,
    status: 'pending',
    kanbanStatus: 'todo',
    lastModified: new Date(2023, 5, 5).toISOString()
  },
  {
    id: '4',
    timestamp: new Date(2023, 5, 15).toISOString(),
    emailAddress: 'lisa@example.com',
    dateReported: '2023-06-15',
    reportedBy: 'Lisa Wong',
    type: 'feature',
    severity: 'Low',
    bucket: 'UI/UX',
    description: 'Improve dashboard layout for mobile',
    month: 'June',
    developer: 'destinpq',
    hoursInvested: 6.5,
    cost: 300,
    status: 'completed',
    kanbanStatus: 'done',
    lastModified: new Date(2023, 5, 25).toISOString()
  },
  {
    id: '5',
    timestamp: new Date(2023, 6, 1).toISOString(),
    emailAddress: 'alex@example.com',
    dateReported: '2023-07-01',
    reportedBy: 'Alex Kim',
    type: 'bug',
    severity: 'Medium',
    bucket: 'Authentication',
    description: 'Password reset emails not sending correctly',
    month: 'July',
    developer: 'destinpq',
    hoursInvested: 2.5,
    cost: 200,
    status: 'pending',
    kanbanStatus: 'todo',
    lastModified: new Date(2023, 6, 1).toISOString()
  },
  {
    id: '6',
    timestamp: new Date(2023, 6, 20).toISOString(),
    emailAddress: 'jamie@example.com',
    dateReported: '2023-07-20',
    reportedBy: 'Jamie Taylor',
    type: 'feature',
    severity: 'High',
    bucket: 'Performance',
    description: 'Optimize database queries for faster loading',
    month: 'July',
    developer: 'destinpq',
    hoursInvested: 10,
    cost: 300,
    status: 'pending',
    kanbanStatus: 'in-progress',
    lastModified: new Date(2023, 6, 25).toISOString()
  },
  {
    id: '7',
    timestamp: new Date(2023, 7, 5).toISOString(),
    emailAddress: 'chris@example.com',
    dateReported: '2023-08-05',
    reportedBy: 'Chris Lee',
    type: 'bug',
    severity: 'Urgent',
    bucket: 'Security',
    description: 'Security vulnerability in login process',
    month: 'August',
    developer: 'destinpq',
    hoursInvested: 9,
    cost: 200,
    status: 'pending',
    kanbanStatus: 'todo',
    lastModified: new Date(2023, 7, 5).toISOString()
  },
  {
    id: '8',
    timestamp: new Date(2023, 8, 10).toISOString(),
    emailAddress: 'pat@example.com',
    dateReported: '2023-09-10',
    reportedBy: 'Pat Rivera',
    type: 'feature',
    severity: 'Medium',
    bucket: 'Frontend',
    description: 'Add dark mode support',
    month: 'September',
    developer: 'destinpq',
    hoursInvested: 7,
    cost: 300,
    status: 'completed',
    kanbanStatus: 'done',
    lastModified: new Date(2023, 8, 20).toISOString()
  },
  {
    id: '9',
    timestamp: new Date(2023, 9, 5).toISOString(),
    emailAddress: 'logo@example.com',
    dateReported: '2023-10-05',
    reportedBy: 'Logo Team',
    type: 'feature',
    severity: 'High',
    bucket: 'Design',
    description: 'Create new company logo for website header',
    month: 'October',
    developer: 'destinpq',
    hoursInvested: 5,
    cost: 300,
    status: 'pending',
    kanbanStatus: 'todo',
    lastModified: new Date(2023, 9, 5).toISOString()
  }
];

// Function to initialize Google Sheets client
async function getGoogleSheetsClient() {
  // Check if we're in a development environment and should use mock data
  if (process.env.USE_MOCK_DATA === 'true') {
    console.log('Using mock data instead of connecting to Google Sheets API');
    // Don't throw an error, just return null to indicate we're using mock data
    return null;
  }
  
  try {
    let authClient;
    
    // First, try using GOOGLE_APPLICATION_CREDENTIALS JSON string
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
        authClient = new JWT({
          email: credentials.client_email,
          key: credentials.private_key,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
      } catch (jsonError) {
        console.error('Error parsing GOOGLE_APPLICATION_CREDENTIALS:', jsonError);
        // Fall back to individual credential fields
      }
    }
    
    // If authClient wasn't created, fall back to individual fields
    if (!authClient) {
      const privateKey = process.env.GOOGLE_PRIVATE_KEY;
      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      
      if (!privateKey || !serviceAccountEmail) {
        throw new Error('Missing Google API credentials');
      }
      
      // Properly format the private key
      const formattedKey = privateKey.replace(/\\n/g, '\n');
      
      authClient = new JWT({
        email: serviceAccountEmail,
        key: formattedKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    }

    await authClient.authorize();
    return google.sheets({ version: 'v4', auth: authClient });
  } catch (error) {
    console.error('Error authenticating with Google Sheets API:', error);
    throw error;
  }
}

// Function to get spreadsheet info and determine the sheet name
async function getSheetInfo() {
  if (SHEET_NAME) {
    return SHEET_NAME; // Return cached sheet name if already determined
  }
  
  try {
    const sheets = await getGoogleSheetsClient();
    
    // When using mock data, sheets will be null
    if (!sheets) {
      SHEET_NAME = 'MockSheet';
      return SHEET_NAME;
    }
    
    // Get spreadsheet information
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    
    if (spreadsheet.data.sheets && spreadsheet.data.sheets.length > 0) {
      // Use the first sheet as default
      const firstSheet = spreadsheet.data.sheets[0];
      if (firstSheet.properties && firstSheet.properties.title) {
        SHEET_NAME = firstSheet.properties.title;
        console.log(`Found sheet: ${SHEET_NAME}`);
        return SHEET_NAME;
      }
    }
    
    throw new Error('No sheets found in the spreadsheet');
  } catch (error) {
    console.error('Error getting sheet info:', error);
    // Default to a common sheet name if we can't get the actual one
    SHEET_NAME = 'Sheet1';
    return SHEET_NAME;
  }
}

// Function to ensure the sheet has the proper headers
async function ensureSheetHeaders() {
  try {
    const sheets = await getGoogleSheetsClient();
    const sheetName = await getSheetInfo();
    
    // When using mock data, sheets will be null
    if (!sheets) {
      return true; // Skip header verification with mock data
    }
    
    // Just read the headers to understand the column structure
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1:Z1`,
    });
    
    const rows = response.data.values || [];
    
    if (rows.length > 0) {
      console.log('Found existing headers:', rows[0]);
    } else {
      console.log('No headers found in the sheet. Using mock data structure.');
    }
    
    // Never try to update headers, just adapt to what's already there
    return true;
  } catch (error) {
    console.error('Error reading sheet headers:', error);
    // Don't fail the whole operation because of header issues
    return true;
  }
}

// Get all tasks from the spreadsheet
export async function getAllTasks(): Promise<Task[]> {
  // If using mock data, return it directly
  if (process.env.USE_MOCK_DATA === 'true') {
    console.log('Using mock data');
    return MOCK_TASKS;
  }
  
  try {
    const sheets = await getGoogleSheetsClient();
    
    // If sheets is null (mock data), return mock data
    if (!sheets) {
      return MOCK_TASKS;
    }
    
    // Make sure we have the correct sheet name
    const sheetName = await getSheetInfo();
    
    // Just read the headers, don't try to modify them
    try {
      await ensureSheetHeaders();
    } catch (headerError) {
      console.warn('Header verification failed but continuing:', headerError);
    }
    
    // Try to get values from the sheet
    try {
      // Read all data
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}`,
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) {
        console.log('No data found in sheet (or only headers)');
        return [];
      }
      
      console.log(`Found ${rows.length-1} rows of data`);
      
      // Skip the header row and map the data to our Task interface
      // Adapt column indices to match the actual structure
      return rows.slice(1).map((row, index) => {
        // Generate an ID if not present
        const id = row[0] || `generated-${index}`;
        
        // Map the data to our Task interface as best we can
        return {
          id,
          timestamp: row[0] || new Date().toISOString(), // Timestamp (usually first column in form responses)
          emailAddress: row[1] || '',                    // Email Address
          dateReported: row[2] || '',                    // Date reported
          reportedBy: row[1] || '',                      // Reported by (use email if not present)
          type: determineBugOrFeature(row[4] || ''),     // Based on "Is it a new feature or bug?" column
          severity: row[5] || 'Medium',                  // Urgency / Severity
          screenshot: row[6] || '',                      // Screenshot URL
          bucket: row[7] || 'Other',                     // Bucket
          description: row[8] || '',                     // Description
          month: determineMonth(row[2] || ''),           // Extract month from date reported
          developer: row[10] || 'unassigned',            // Developer
          hoursInvested: parseFloat(row[11] || '0') || 0, // Hours invested
          cost: parseFloat(row[12] || '0') || determineCost(row[4] || ''), // Cost
          status: row[13] === 'completed' ? 'completed' : 'pending', // Status
          kanbanStatus: row[14] || 'todo',               // Kanban status
          lastModified: row[15] || ''                    // Last modified timestamp
        };
      });
    } catch (error) {
      console.error('Error reading sheet data:', error);
      return MOCK_TASKS; // Fall back to mock data on error
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
    
    // If in development, return mock data instead of failing
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data (fallback)');
      return MOCK_TASKS;
    }
    
    return [];
  }
}

// Helper function to determine if a task is a bug or feature
function determineBugOrFeature(typeField: string): 'bug' | 'feature' {
  const lowered = typeField.toLowerCase();
  if (lowered.includes('bug')) {
    return 'bug';
  } else if (lowered.includes('feature')) {
    return 'feature';
  } else {
    // Default to feature if unknown
    return 'feature';
  }
}

// Helper function to determine cost based on type
function determineCost(typeField: string): number {
  return determineBugOrFeature(typeField) === 'bug' ? 200 : 300;
}

// Helper function to extract month from date
function determineMonth(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // If date parsing fails, return current month
      return new Date().toLocaleString('default', { month: 'long' });
    }
    return date.toLocaleString('default', { month: 'long' });
  } catch {
    // Default to current month if parsing fails
    return new Date().toLocaleString('default', { month: 'long' });
  }
}

// Add a new task to the spreadsheet
export async function addTask(task: Omit<Task, 'id' | 'cost'>): Promise<boolean> {
  try {
    // If using mock data, just log the task that would be added
    if (process.env.USE_MOCK_DATA === 'true') {
      console.log('Mock data mode: Would add task:', {
        ...task,
        id: Date.now().toString(),
        cost: task.type === 'bug' ? 200 : 300,
        timestamp: new Date().toISOString(),
      });
      return true;
    }
    
    const sheets = await getGoogleSheetsClient();
    
    // If sheets is null (mock data), return as if successful
    if (!sheets) {
      return true;
    }
    
    const sheetName = await getSheetInfo();
    
    // Generate a unique ID
    const id = Date.now().toString();
    
    // Calculate cost based on type
    const cost = task.type === 'bug' ? 200 : 300;
    
    // Current timestamp
    const timestamp = new Date().toISOString();
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1`, // Start from the top of the sheet
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [
            id,
            timestamp,
            task.emailAddress,
            task.dateReported,
            task.reportedBy,
            task.type,
            task.severity,
            task.screenshot || '',
            task.bucket,
            task.description,
            task.month,
            task.developer,
            task.hoursInvested,
            cost,
            task.status,
            task.kanbanStatus
          ],
        ],
      },
    });
    
    return true;
  } catch (error) {
    console.error('Error adding task:', error);
    
    // If error but in development with mock data enabled, pretend it worked
    if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_DATA === 'true') {
      return true;
    }
    
    return false;
  }
}

// Update task hours
export async function updateTaskHours(taskId: string, hours: number): Promise<boolean> {
  try {
    // If using mock data, just log the update that would happen
    if (process.env.USE_MOCK_DATA === 'true') {
      console.log(`Mock data mode: Would update task ${taskId} hours to ${hours}`);
      return true;
    }
    
    const sheets = await getGoogleSheetsClient();
    
    // If sheets is null (mock data), return as if successful
    if (!sheets) {
      return true;
    }
    
    const sheetName = await getSheetInfo();
    
    // First get all tasks to find the row index
    const allTasks = await getAllTasks();
    const taskIndex = allTasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      return false;
    }
    
    // Row index in the sheet (add 2 because data starts at row 2, and array is 0-indexed)
    const rowIndex = taskIndex + 2;
    
    // Update hours in column M (index 12)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!M${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[hours]],
      },
    });
    
    return true;
  } catch (error) {
    console.error('Error updating task hours:', error);
    
    // If error but in development with mock data enabled, pretend it worked
    if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_DATA === 'true') {
      return true;
    }
    
    return false;
  }
}

// Get tasks for a specific developer
export async function getTasksByDeveloper(developerKey: string): Promise<Task[]> {
  // If using mock data, return it directly
  if (process.env.USE_MOCK_DATA === 'true') {
    console.log('Using mock data for developer tasks');
    return MOCK_TASKS.filter(task => task.developer === developerKey);
  }
  
  try {
    const allTasks = await getAllTasks();
    return allTasks.filter(task => task.developer === developerKey);
  } catch (error) {
    console.error('Error getting tasks by developer:', error);
    
    // Return mock data filtered by developer in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data for developer tasks (fallback)');
      return MOCK_TASKS.filter(task => task.developer === developerKey);
    }
    
    return [];
  }
}

// Get tasks grouped by month
export async function getTasksByMonth(): Promise<Record<string, Task[]>> {
  // If using mock data, return it directly
  if (process.env.USE_MOCK_DATA === 'true') {
    console.log('Using mock data for tasks by month');
    return MOCK_TASKS.reduce((acc, task) => {
      if (!acc[task.month]) {
        acc[task.month] = [];
      }
      acc[task.month].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }
  
  try {
    const allTasks = await getAllTasks();
    return allTasks.reduce((acc, task) => {
      if (!acc[task.month]) {
        acc[task.month] = [];
      }
      acc[task.month].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  } catch (error) {
    console.error('Error getting tasks by month:', error);
    
    // Return mock data grouped by month in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data for tasks by month (fallback)');
      return MOCK_TASKS.reduce((acc, task) => {
        if (!acc[task.month]) {
          acc[task.month] = [];
        }
        acc[task.month].push(task);
        return acc;
      }, {} as Record<string, Task[]>);
    }
    
    return {};
  }
}

// Get tasks grouped by bucket
export async function getTasksByBucket(): Promise<Record<string, Task[]>> {
  // If using mock data, return it directly
  if (process.env.USE_MOCK_DATA === 'true') {
    console.log('Using mock data for tasks by bucket');
    return MOCK_TASKS.reduce((acc, task) => {
      if (!acc[task.bucket]) {
        acc[task.bucket] = [];
      }
      acc[task.bucket].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }
  
  try {
    const allTasks = await getAllTasks();
    return allTasks.reduce((acc, task) => {
      if (!acc[task.bucket]) {
        acc[task.bucket] = [];
      }
      acc[task.bucket].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  } catch (error) {
    console.error('Error getting tasks by bucket:', error);
    
    // Return mock data grouped by bucket in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data for tasks by bucket (fallback)');
      return MOCK_TASKS.reduce((acc, task) => {
        if (!acc[task.bucket]) {
          acc[task.bucket] = [];
        }
        acc[task.bucket].push(task);
        return acc;
      }, {} as Record<string, Task[]>);
    }
    
    return {};
  }
}

// Calculate pending money
export async function calculatePendingMoney(): Promise<number> {
  // If using mock data, return it directly
  if (process.env.USE_MOCK_DATA === 'true') {
    console.log('Using mock data for pending money calculation');
    return MOCK_TASKS
      .filter(task => task.status === 'pending')
      .reduce((total, task) => total + task.cost, 0);
  }
  
  try {
    const allTasks = await getAllTasks();
    return allTasks
      .filter(task => task.status === 'pending')
      .reduce((total, task) => total + task.cost, 0);
  } catch (error) {
    console.error('Error calculating pending money:', error);
    
    // Return mock calculation in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data for pending money (fallback)');
      return MOCK_TASKS
        .filter(task => task.status === 'pending')
        .reduce((total, task) => total + task.cost, 0);
    }
    
    return 0;
  }
}

// Calculate total time invested
export async function calculateTotalHours(): Promise<number> {
  // If using mock data, return it directly
  if (process.env.USE_MOCK_DATA === 'true') {
    console.log('Using mock data for total hours calculation');
    return MOCK_TASKS.reduce((total, task) => total + task.hoursInvested, 0);
  }
  
  try {
    const allTasks = await getAllTasks();
    return allTasks.reduce((total, task) => total + task.hoursInvested, 0);
  } catch (error) {
    console.error('Error calculating total hours:', error);
    
    // Return mock calculation in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data for total hours (fallback)');
      return MOCK_TASKS.reduce((total, task) => total + task.hoursInvested, 0);
    }
    
    return 0;
  }
}

// Update task kanban status
export async function updateTaskStatus(taskId: string, kanbanStatus: 'todo' | 'in-progress' | 'review' | 'done'): Promise<boolean> {
  try {
    // If using mock data, just log the update that would happen
    if (process.env.USE_MOCK_DATA === 'true') {
      console.log(`Mock data mode: Would update task ${taskId} status to ${kanbanStatus}`);
      return true;
    }
    
    const sheets = await getGoogleSheetsClient();
    
    // If sheets is null (mock data), return as if successful
    if (!sheets) {
      return true;
    }
    
    const sheetName = await getSheetInfo();
    
    // First get all tasks to find the row index
    const allTasks = await getAllTasks();
    const taskIndex = allTasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      return false;
    }
    
    // Row index in the sheet (add 2 because data starts at row 2, and array is 0-indexed)
    const rowIndex = taskIndex + 2;
    
    // Current date timestamp for lastModified
    const lastModified = new Date().toISOString();
    
    try {
      // Update kanban status in column P (index 15)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!P${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[kanbanStatus]],
        },
      });
      
      // Update lastModified timestamp in column Q (index 16)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!Q${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[lastModified]],
        },
      });
      
      // If status is set to "done", update the task status to "completed" in column O (index 14)
      if (kanbanStatus === 'done') {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${sheetName}!O${rowIndex}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [['completed']],
          },
        });
        
        // Get the current task to calculate the proper price based on type
        const task = allTasks[taskIndex];
        if (task) {
          const cost = task.type === 'bug' ? 200 : 300;
          
          // Update the cost in column N (index 13)
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!N${rowIndex}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [[cost]],
            },
          });
          
          console.log(`Updated task ${taskId} to status ${kanbanStatus} and set cost to ${cost}`);
        }
      } else {
        console.log(`Updated task ${taskId} to status ${kanbanStatus}`);
      }
    } catch (updateError) {
      console.error('Error updating specific task fields:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating task status:', error);
    
    // If error but in development with mock data enabled, pretend it worked
    if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_DATA === 'true') {
      return true;
    }
    
    return false;
  }
} 