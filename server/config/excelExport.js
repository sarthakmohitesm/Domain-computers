import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Format date to DD/MM/YYYY
 */
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Export tasks to Excel file
 */
export const exportTasksToExcel = (tasks, filename = 'tasks.xlsx') => {
  try {
    // Transform tasks data
    const data = tasks.map(task => ({
      'Customer Name': task.customer_name || '',
      'Contact Number': task.contact_number || '',
      'Device Type': task.device_name || '',
      'Problem Description': task.problem_reported || '',
      'Assigned Employee': task.assigned_to || '',
      'Task Status': task.status || '',
      'Completion Date': formatDate(task.completed_at),
      'Delivery Date': formatDate(task.delivery_date),
      'Accessories Received': task.accessories_received || '',
      'Staff Notes': task.staff_notes || '',
      'Created Date': formatDate(task.created_at),
    }));

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Set column widths
    const colWidths = [
      { wch: 18 }, // Customer Name
      { wch: 15 }, // Contact Number
      { wch: 18 }, // Device Type
      { wch: 25 }, // Problem Description
      { wch: 18 }, // Assigned Employee
      { wch: 15 }, // Task Status
      { wch: 15 }, // Completion Date
      { wch: 15 }, // Delivery Date
      { wch: 18 }, // Accessories Received
      { wch: 20 }, // Staff Notes
      { wch: 15 }, // Created Date
    ];
    worksheet['!cols'] = colWidths;

    // Add header styling (bold)
    const headers = Object.keys(data[0] || {});
    headers.forEach((header, index) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });
      if (!worksheet[cellRef]) return;
      worksheet[cellRef].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '366092' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };
    });

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');

    // Save file
    const exportDir = path.join(__dirname, '../../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const filepath = path.join(exportDir, filename);
    XLSX.writeFile(workbook, filepath);

    return {
      success: true,
      filepath,
      filename,
      message: `Excel file created: ${filename}`,
    };
  } catch (error) {
    console.error('Excel export error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
