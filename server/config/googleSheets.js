import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let authClient = null;
let sheetsClient = null;
let driveClient = null;

/**
 * Initialize Google API auth client using service account credentials.
 * Looks for credentials.json in the project root directory.
 */
const getAuthClient = async () => {
    if (authClient) return authClient;

    try {
        // Look for credentials.json in the project root directory
        const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH
            || path.join(__dirname, '..', '..', 'credentials.json');

        if (!fs.existsSync(credentialsPath)) {
            throw new Error(
                `Google credentials file not found at: ${credentialsPath}. ` +
                `Please place your credentials.json in the project root directory.`
            );
        }

        const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: [
                'https://spreadsheets.google.com/feeds',
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/spreadsheets',
            ],
        });

        authClient = await auth.getClient();
        console.log('Google API auth client initialized successfully');
        return authClient;
    } catch (error) {
        console.error('Failed to initialize Google API auth:', error.message);
        throw error;
    }
};

const getGoogleSheetsClient = async () => {
    if (sheetsClient) return sheetsClient;
    const auth = await getAuthClient();
    sheetsClient = google.sheets({ version: 'v4', auth });
    return sheetsClient;
};

const getGoogleDriveClient = async () => {
    if (driveClient) return driveClient;
    const auth = await getAuthClient();
    driveClient = google.drive({ version: 'v3', auth });
    return driveClient;
};

/**
 * Find a Google Sheet by name using the Drive API.
 * Similar to gspread's client.open("Sheet_Name").
 */
const findSpreadsheetByName = async (name) => {
    try {
        const drive = await getGoogleDriveClient();
        const response = await drive.files.list({
            q: `name='${name}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
            fields: 'files(id, name)',
            spaces: 'drive',
        });

        if (response.data.files && response.data.files.length > 0) {
            console.log(`Found spreadsheet "${name}" with ID: ${response.data.files[0].id}`);
            return response.data.files[0].id;
        }

        throw new Error(`Spreadsheet "${name}" not found. Make sure it is shared with the service account email.`);
    } catch (error) {
        console.error(`Failed to find spreadsheet "${name}":`, error.message);
        throw error;
    }
};

/**
 * Get the spreadsheet ID — either from env variable or by searching by name.
 */
let cachedSpreadsheetId = null;
const getSpreadsheetId = async () => {
    if (cachedSpreadsheetId) return cachedSpreadsheetId;

    // First try env variable
    if (process.env.GOOGLE_SHEET_ID) {
        cachedSpreadsheetId = process.env.GOOGLE_SHEET_ID;
        return cachedSpreadsheetId;
    }

    // Otherwise, find by name
    const sheetName = process.env.GOOGLE_SPREADSHEET_NAME || 'Task_Completed';
    cachedSpreadsheetId = await findSpreadsheetByName(sheetName);
    return cachedSpreadsheetId;
};

/**
 * Append a completed task row to the Google Sheet.
 * Spreadsheet: "Task_Completed", Worksheet/Tab: "DATA"
 * Columns: Customer Name | Device Type | Problem Description | Assigned Employee | Task Status | Completion Date | Delivery date
 */
export const appendTaskToSheet = async (taskData) => {
    try {
        const sheets = await getGoogleSheetsClient();
        const spreadsheetId = await getSpreadsheetId();
        const worksheetName = process.env.GOOGLE_SHEET_TAB_NAME || 'DATA';

        // Format completion date
        const completionDate = taskData.completed_at
            ? new Date(taskData.completed_at).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            })
            : new Date(taskData.updated_at).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });

        // Delivery date = the date the task is being removed/delivered to customer
        const deliveryDate = new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

        const row = [
            taskData.customer_name || '',
            taskData.contact_number || '',
            taskData.device_name || '',
            taskData.problem_reported || '',
            taskData.assigned_employee_name || 'Unassigned',
            'Completed',
            completionDate,
            deliveryDate,
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${worksheetName}!A:H`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                values: [row],
            },
        });

        console.log(`Task archived to Google Sheet: ${taskData.customer_name} - ${taskData.device_name}`);
        return true;
    } catch (error) {
        console.error('Failed to append task to Google Sheet:', error.message);
        throw error;
    }
};

