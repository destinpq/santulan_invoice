import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { differenceInDays, parse } from 'date-fns';

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
  estDeadline?: string;
  daysUntilDeadline?: number;
}

// Get the spreadsheet ID from env
const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1_40r55K_kFme_UCSqdkKKU2ZwDUmWp6540qRe7imwZk';
// This will be populated after we get the sheet info
let SHEET_NAME = '';

// Function to initialize Google Sheets client
async function getGoogleSheetsClient() {
  // Always use real API data, no environment variable checks
  console.log('Always using real Google Sheets API - all environment checks bypassed');

  try {
    let authClient;
    
    // First, try using GOOGLE_APPLICATION_CREDENTIALS JSON string
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        console.log('Attempting auth via GOOGLE_APPLICATION_CREDENTIALS');
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
      console.log('Attempting auth via individual env vars...'); 
      const privateKey = process.env.GOOGLE_PRIVATE_KEY;
      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      
      if (!privateKey || !serviceAccountEmail) {
        console.error('Individual credentials MISSING! Cannot authenticate.'); 
        throw new Error('Missing Google API credentials');
      }
      
      // Properly format the private key
      console.log('Found individual credentials, formatting key...');
      const formattedKey = privateKey.replace(/\\n/g, '\n');
      
      authClient = new JWT({
        email: serviceAccountEmail,
        key: formattedKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    }

    // Add timeout to avoid hanging builds
    const authorizePromise = authClient.authorize();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Authorization timeout after 10 seconds')), 10000);
    });

    await Promise.race([authorizePromise, timeoutPromise]);
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
    
    // Add timeout for API request
    const getInfoPromise = sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Spreadsheet info timeout after 10 seconds')), 10000);
    });
    
    // Use Promise.race to implement timeout
    const spreadsheet = await Promise.race([getInfoPromise, timeoutPromise]);
    
    if (spreadsheet.data?.sheets && spreadsheet.data.sheets.length > 0) {
      // Use the first sheet as default
      const firstSheet = spreadsheet.data.sheets[0];
      if (firstSheet.properties && firstSheet.properties.title) {
        SHEET_NAME = firstSheet.properties.title;
        return SHEET_NAME;
      }
    }
    
    throw new Error('No sheets found in the spreadsheet');
  } catch (error: any) {
    console.error('Error getting sheet info:', error);
    // Still throw but with a more informative message
    throw new Error(`Sheet info error: ${error.message || 'Unknown error'}`);
  }
}

// Get all tasks from the spreadsheet
export async function getAllTasks(): Promise<Task[]> {
  try {
    const sheets = await getGoogleSheetsClient();
    
    // Make sure we have the correct sheet name
    const sheetName = await getSheetInfo();
    
    console.log(`Attempting to fetch data from sheet: ${sheetName}`); // Log before fetch
    
    // Add timeout for API request
    const getDataPromise = sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}`,
    });
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Fetching data timeout after 15 seconds')), 15000);
    });
    
    // Use Promise.race to implement timeout
    const response = await Promise.race([getDataPromise, timeoutPromise]);

    console.log('Successfully fetched data, processing rows...'); // Log after fetch
    const rows = response.data.values || [];
    if (rows.length <= 1) {
      console.log('No data found in sheet (or only headers)');
      return [];
    }
    
    // Skip the header row and map the data to our Task interface
    return rows.slice(1).map((row: any[], index: number) => {
      console.log(`Processing row ${index + 2}`); // Log each row
      try { // Add try...catch inside map
        // Corrected indices based on screenshot:
        const timestamp = row[0] || ''; // Column A: Timestamp (Used for timestamp field)
        const emailAddress = row[1] || ''; // Column B: Email Address
        const dateReported = row[2] || ''; // Column C: Date reported
        const reportedBy = row[3] || ''; // Column D: Reported by
        const typeField = row[4] || ''; // Column E: Is it a new feature or bug?
        const severity = row[5] || 'Medium'; // Column F: Urgency / Severity of issue
        const screenshot = row[6] || ''; // Column G: Attach screenshot if bug
        const bucket = row[7] || 'Other'; // Column H: What bucket does it fall under?
        const description = row[8] || ''; // Column I: Description of task
        const hoursInvested = parseFloat(row[9] || '0'); // Column J: Time invested
        const resolvedOn = row[10] || ''; // Column K: Resolved on
        // Column L: Status (Not directly used in Task interface)
        const priority = row[12] || ''; // Column M: Priority (Not directly used, maybe map to severity?)
        const devName = row[13] || 'destinpq'; // Column N: Dev name (Map to developer field)
        const kanbanBoardStatus = (row[14] || '').toLowerCase(); // Column O: Kanban Board status
        const devStatus = (row[15] || '').toLowerCase(); // Column P: Dev status (Use this for explicit kanban status)
        const estDeadlineString = row[11] || ''; // Column L: Est Deadline - FIXED FROM COLUMN 16 to 11

        // Add extra debugging for all data from the sheet
        console.log(`Row ${index + 2} data:`, {
          id: index,
          description: description.substring(0, 30) + '...',
          estDeadlineString,
          rowLength: row.length,
          allColumns: row.map((cell, i) => `Col ${i}: ${cell ? cell.toString().substring(0, 20) : 'empty'}`).join(' | ')
        });

        // Generate a unique ID - Using timestamp + index might be better than just timestamp
        const id = `${timestamp}-${index}` || `generated-${index}`;
        
        const type = determineBugOrFeature(typeField);
      
        // Determine kanban status: Check explicit column P first, then column O, then resolvedOn
      let kanbanStatus: 'todo' | 'in-progress' | 'review' | 'done' = 'todo';
        if (devStatus === 'in-progress' || devStatus === 'review') {
            kanbanStatus = devStatus;
        } else if (kanbanBoardStatus === 'in-progress' || kanbanBoardStatus === 'review') {
            kanbanStatus = kanbanBoardStatus;
        } else if (devStatus === 'done' || kanbanBoardStatus === 'done' || resolvedOn) {
        kanbanStatus = 'done';
        }

        // Log raw data for every task's key fields
        console.log(`Task Debug - ${index+2}: ${description.substring(0, 30)}...`);
        console.log(`- resolvedOn: "${resolvedOn}" (${typeof resolvedOn})`);
        console.log(`- Deadline: "${estDeadlineString}" (${typeof estDeadlineString})`);
        console.log(`- Status: kanban=${kanbanStatus}, Bucket: ${bucket}`);

        // Calculate days until deadline
        let daysUntilDeadline: number | undefined = undefined;
        
        // If the task is resolved, consider deadline as met
        // Make this check more comprehensive and log extensively for debugging
        if (resolvedOn && resolvedOn.trim() !== '') {
          // Use 100 as a special value to indicate "Deadline Met" for resolved tasks
          daysUntilDeadline = 100;
          console.log(`✅ Task "${description}" is resolved (${resolvedOn}), marking deadline as met`);
        } 
        // Otherwise calculate days normally if estDeadlineString exists
        else if (estDeadlineString) {
          // Log the raw deadline string first
          console.log(`Processing deadline string: "${estDeadlineString}" for task "${description}"`);
          
          try {
            // First try MM/DD/YYYY format (your standard format with or without leading zeros)
            // This format matches dates like 4/4/2025 or 04/04/2025
            const deadlineDate = parse(estDeadlineString, 'M/d/yyyy', new Date());
            
            if (!isNaN(deadlineDate.getTime())) {
              daysUntilDeadline = differenceInDays(deadlineDate, new Date());
              console.log(`✅ Successfully parsed deadline for task "${description}": ${estDeadlineString} -> ${daysUntilDeadline} days remaining`);
            } else {
              throw new Error('Invalid date - first parsing attempt failed');
            }
          } catch (parseError) {
            console.warn(`First parsing attempt failed for "${estDeadlineString}"`);
            
            // Try different format combinations as fallbacks
            const formatAttempts = [
              'MM/dd/yyyy', // 04/04/2025
              'd/M/yyyy',   // 4/4/2025
              'yyyy/MM/dd', // 2025/04/04
              'yyyy-MM-dd', // 2025-04-04
              'dd-MM-yyyy', // 04-04-2025
              'dd.MM.yyyy'  // 04.04.2025
            ];
            
            let parsed = false;
            
            for (const format of formatAttempts) {
              try {
                const attemptDate = parse(estDeadlineString, format, new Date());
                if (!isNaN(attemptDate.getTime())) {
                  daysUntilDeadline = differenceInDays(attemptDate, new Date());
                  console.log(`✅ Parsed deadline using format ${format} for task "${description}": ${daysUntilDeadline} days remaining`);
                  parsed = true;
                  break;
                }
              } catch (err) {
                // Continue to next format
              }
            }
            
            // If all parsing attempts failed, try creating a date directly
            if (!parsed) {
              try {
                const directDate = new Date(estDeadlineString);
                if (!isNaN(directDate.getTime())) {
                  daysUntilDeadline = differenceInDays(directDate, new Date());
                  console.log(`✅ Parsed deadline using direct Date constructor for task "${description}": ${daysUntilDeadline} days remaining`);
                } else {
                  console.error(`❌ All parsing attempts failed for deadline: "${estDeadlineString}"`);
                }
              } catch (finalError) {
                console.error(`❌ Failed to parse date "${estDeadlineString}" with any method:`, finalError);
              }
            }
          }
        }

      return {
        id,
          timestamp: timestamp || new Date().toISOString(),
          emailAddress,
          dateReported,
          reportedBy,
        type,
          severity, // Or potentially map from priority (row[12])
          screenshot,
          bucket,
          description,
        hoursInvested,
        resolvedOn,
          month: determineMonth(dateReported || ''), // Determine month from Date Reported
          developer: devName, // Use Dev Name from sheet
          cost: determineCost(type, hoursInvested), // Calculate cost
          status: resolvedOn ? 'completed' : 'pending', // Determine status based on Resolved On
        timeSpent: {
          totalHours: hoursInvested,
          lastUpdated: resolvedOn || new Date().toISOString()
        },
          kanbanStatus, // Use determined Kanban status
          estDeadline: estDeadlineString, // Keep the original string
          // FORCE any done/resolved tasks to have deadline met
          daysUntilDeadline: (kanbanStatus === 'done' || resolvedOn) ? 100 : daysUntilDeadline, 
          // lastModified: resolvedOn || '' // Removed, not in Task interface
      };
      } catch (mapError: any) {
        console.error(`Error processing row ${index + 2}:`, mapError);
        console.error('Row data:', row);
        // Return a minimal or null object, or re-throw if needed
        return null; // Returning null for now, will filter out later
      }
    }).filter(task => task !== null) as Task[]; // Filter out nulls from failed rows
  } catch (error: any) {
    console.error('Error fetching or processing tasks in getAllTasks:', error);
    console.error('Error details:', JSON.stringify(error, null, 2)); // Log full error details
    
    // Re-throw the error or return empty array if preferred
    // throw error; // Option 1: Let the API route handle it
    return []; // Option 2: Return empty array on error
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
    const sheets = await getGoogleSheetsClient();
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
    return false; // Indicate failure
  }
}

// Update task hours
export async function updateTaskHours(taskId: string, hours: number): Promise<boolean> {
  try {
    const sheets = await getGoogleSheetsClient();
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
    return false; // Indicate failure
  }
}

// Get all tasks, developer key is just for authentication
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getTasksByDeveloper(developerKey: string): Promise<Task[]> {
  try {
    const allTasks = await getAllTasks();
    return allTasks; // Return all tasks instead of filtering by developer
  } catch (error) {
    console.error('Error getting tasks:', error);
    return [];
  }
}

// Get tasks grouped by month
export async function getTasksByMonth(): Promise<Record<string, Task[]>> {
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
    return {};
  }
}

// Get tasks grouped by bucket
export async function getTasksByBucket(): Promise<Record<string, Task[]>> {
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
    return false; // Indicate failure
  }
}

// Add time tracking helper
function calculateTimeSpent(startTime: string, endTime: string): number {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return Math.round(diffHours * 10) / 10; // Round to 1 decimal place
} 