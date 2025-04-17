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
  timeSpent?: {
    startTime?: string;
    endTime?: string;
    totalHours: number;
    lastUpdated: string;
  };
  resolvedOn?: string;
  kanbanStatus: 'todo' | 'in-progress' | 'review' | 'done';
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
    timeSpent: {
      totalHours: 3.5,
      lastUpdated: new Date(2023, 4, 5).toISOString()
    },
    resolvedOn: new Date(2023, 4, 5).toISOString(),
    kanbanStatus: 'done'
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
    timeSpent: {
      totalHours: 5,
      lastUpdated: new Date(2023, 4, 20).toISOString()
    },
    resolvedOn: new Date(2023, 4, 20).toISOString(),
    kanbanStatus: 'done'
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
    timeSpent: {
      totalHours: 8,
      lastUpdated: new Date(2023, 5, 5).toISOString()
    },
    resolvedOn: '',
    kanbanStatus: 'todo'
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
    timeSpent: {
      totalHours: 6.5,
      lastUpdated: new Date(2023, 5, 25).toISOString()
    },
    resolvedOn: new Date(2023, 5, 25).toISOString(),
    kanbanStatus: 'done'
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
    timeSpent: {
      totalHours: 2.5,
      lastUpdated: new Date(2023, 6, 1).toISOString()
    },
    resolvedOn: '',
    kanbanStatus: 'todo'
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
    timeSpent: {
      totalHours: 10,
      lastUpdated: new Date(2023, 6, 25).toISOString()
    },
    resolvedOn: '',
    kanbanStatus: 'todo'
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
    timeSpent: {
      totalHours: 9,
      lastUpdated: new Date(2023, 7, 5).toISOString()
    },
    resolvedOn: '',
    kanbanStatus: 'todo'
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
    timeSpent: {
      totalHours: 7,
      lastUpdated: new Date(2023, 8, 20).toISOString()
    },
    resolvedOn: new Date(2023, 8, 20).toISOString(),
    kanbanStatus: 'done'
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
    timeSpent: {
      totalHours: 5,
      lastUpdated: new Date(2023, 9, 5).toISOString()
    },
    resolvedOn: '',
    kanbanStatus: 'todo'
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
    
    if (!sheets) {
      throw new Error('Could not initialize Google Sheets client');
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
        return SHEET_NAME;
      }
    }
    
    throw new Error('No sheets found in the spreadsheet');
  } catch (error) {
    console.error('Error getting sheet info:', error);
    throw error;
  }
}

// Get all tasks from the spreadsheet
export async function getAllTasks(): Promise<Task[]> {
  try {
    const sheets = await getGoogleSheetsClient();
    if (!sheets) {
      throw new Error('Could not initialize Google Sheets client');
    }
    
    // Make sure we have the correct sheet name
    const sheetName = await getSheetInfo();
    
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
    
    // Skip the header row and map the data to our Task interface
    return rows.slice(1).map((row, index) => {
      const id = row[0] || `generated-${index}`;
      const hoursInvested = parseFloat(row[9] || '0');
      const resolvedOn = row[10] || '';
      const type = determineBugOrFeature(row[4] || '');
      
      // Determine kanban status based on resolvedOn field
      let kanbanStatus: 'todo' | 'in-progress' | 'review' | 'done' = 'todo';
      if (resolvedOn) {
        kanbanStatus = 'done';
      } else if (row[15]) { // Check if there's an explicit kanban status in column P
        const status = (row[15] || '').toLowerCase();
        if (status === 'in-progress' || status === 'review') {
          kanbanStatus = status;
        }
      }

      return {
        id,
        timestamp: row[0] || new Date().toISOString(),
        emailAddress: row[1] || '',
        dateReported: row[2] || '',
        reportedBy: row[3] || '',
        type,
        severity: row[5] || 'Medium',
        screenshot: row[6] || '',
        bucket: row[7] || 'Other',
        description: row[8] || '',
        hoursInvested,
        resolvedOn,
        month: determineMonth(row[2] || ''),
        developer: 'destinpq',
        cost: determineCost(type, hoursInvested),
        status: resolvedOn ? 'completed' : 'pending',
        timeSpent: {
          totalHours: hoursInvested,
          lastUpdated: resolvedOn || new Date().toISOString()
        },
        kanbanStatus,
        lastModified: resolvedOn || ''
      };
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
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

// Helper function to determine cost based on type and hours
function determineCost(typeField: string | 'bug' | 'feature', hoursInvested: number = 0): number {
  const type = typeof typeField === 'string' ? determineBugOrFeature(typeField) : typeField;
  const hourlyRate = type === 'bug' ? 200 : 300;
  return Math.round(hourlyRate * hoursInvested);
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
    
    // Calculate cost based on type and hours
    const cost = determineCost(task.type, task.hoursInvested);
    
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

// Get all tasks, developer key is just for authentication
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getTasksByDeveloper(developerKey: string): Promise<Task[]> {
  // Changed to return all tasks regardless of developer assignment
  // The developer key is only used for authentication, not filtering
  
  // If using mock data, return it directly
  if (process.env.USE_MOCK_DATA === 'true') {
    console.log('Using mock data for tasks');
    return MOCK_TASKS; // Return all mock tasks
  }
  
  try {
    const allTasks = await getAllTasks();
    return allTasks; // Return all tasks instead of filtering by developer
  } catch (error) {
    console.error('Error getting tasks:', error);
    
    // Return all mock data in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data for tasks (fallback)');
      return MOCK_TASKS; // Return all mock tasks
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
  try {
    const allTasks = await getAllTasks();
    console.log('Calculating pending money for all tasks...');
    
    const total = allTasks.reduce((total, task) => {
      const hourlyRate = task.type === 'bug' ? 200 : 300;
      const taskCost = hourlyRate * task.hoursInvested;
      console.log(`Task ${task.id}: type=${task.type}, hours=${task.hoursInvested}, rate=${hourlyRate}, cost=${taskCost}`);
      return total + taskCost;
    }, 0);
    
    console.log('Total pending money:', total);
    return total;
  } catch (error) {
    console.error('Error calculating pending money:', error);
    return 0;
  }
}

// Calculate total time invested
export async function calculateTotalHours(): Promise<number> {
  try {
    const allTasks = await getAllTasks();
    return allTasks.reduce((total, task) => total + task.hoursInvested, 0);
  } catch (error) {
    console.error('Error calculating total hours:', error);
    return 0;
  }
}

// Update task status
export async function updateTaskStatus(taskId: string, kanbanStatus: 'todo' | 'in-progress' | 'review' | 'done'): Promise<boolean> {
  try {
    const sheets = await getGoogleSheetsClient();
    if (!sheets) {
      throw new Error('Could not initialize Google Sheets client');
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
    
    try {
      // Update kanban status
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!P${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[kanbanStatus]],
        },
      });
      
      // If status is set to "done", update the resolved date and other fields
      if (kanbanStatus === 'done') {
        const currentDate = new Date().toLocaleDateString();
        
        // Update resolved date
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${sheetName}!K${rowIndex}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[currentDate]],
          },
        });
        
        // Update status to completed
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${sheetName}!O${rowIndex}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [['completed']],
          },
        });
        
        // Update the cost based on hours invested
        const task = allTasks[taskIndex];
        if (task) {
          const cost = determineCost(task.type, task.hoursInvested);
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!N${rowIndex}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [[cost]],
            },
          });
        }
      } else {
        // If moving away from done, clear the resolved date and set status back to pending
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${sheetName}!K${rowIndex}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [['']],
          },
        });
        
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${sheetName}!O${rowIndex}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [['pending']],
          },
        });
      }
      return true;
    } catch (updateError) {
      console.error('Error updating task fields:', updateError);
      return false;
    }
  } catch (error) {
    console.error('Error updating task status:', error);
    return false;
  }
}

// Add time tracking helper
function calculateTimeSpent(startTime: string, endTime: string): number {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return Math.round(diffHours * 10) / 10; // Round to 1 decimal place
} 