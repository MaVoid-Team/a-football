import * as XLSX from 'xlsx';
import { Booking } from '@/schemas/booking.schema';
import { Branch } from '@/schemas/branch.schema';
import { Court } from '@/schemas/court.schema';

interface ExportBookingsData {
    bookings: Booking[];
    branches: Branch[];
    courts: Court[];
}

export const exportBookingsToExcel = ({ bookings, branches, courts }: ExportBookingsData) => {
    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Prepare data for export
    const exportData = bookings.map(booking => {
        const branch = branches.find(b => Number(b.id) === booking.branch_id);
        const court = courts.find(c => Number(c.id) === booking.court_id);
        
        return {
            'Booking ID': String(booking.id).padStart(5, '0'),
            'Customer Name': booking.user_name,
            'Customer Phone': booking.user_phone,
            'Branch': branch?.name || 'Unknown',
            'Court': court?.name || `Court #${booking.court_id}`,
            'Date': booking.date,
            'Start Time': booking.start_time,
            'End Time': booking.end_time,
            'Total Price': booking.total_price || 0,
            'Status': booking.status,
            'Payment Status': booking.payment_status || 'pending',
            'Notes': booking.notes || '',
            'Created At': booking.created_at,
        };
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const colWidths = [
        { wch: 12 }, // Booking ID
        { wch: 20 }, // Customer Name
        { wch: 15 }, // Customer Phone
        { wch: 20 }, // Branch
        { wch: 20 }, // Court
        { wch: 12 }, // Date
        { wch: 10 }, // Start Time
        { wch: 10 }, // End Time
        { wch: 12 }, // Total Price
        { wch: 12 }, // Status
        { wch: 15 }, // Payment Status
        { wch: 30 }, // Notes
        { wch: 20 }, // Created At
    ];
    worksheet['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `bookings-export-${timestamp}.xlsx`;

    // Export the file
    XLSX.writeFile(workbook, filename);
};

export const exportBookingsToCSV = ({ bookings, branches, courts }: ExportBookingsData) => {
    // Prepare data for export
    const exportData = bookings.map(booking => {
        const branch = branches.find(b => Number(b.id) === booking.branch_id);
        const court = courts.find(c => Number(c.id) === booking.court_id);
        
        return {
            'Booking ID': String(booking.id).padStart(5, '0'),
            'Customer Name': booking.user_name,
            'Customer Phone': booking.user_phone,
            'Branch': branch?.name || 'Unknown',
            'Court': court?.name || `Court #${booking.court_id}`,
            'Date': booking.date,
            'Start Time': booking.start_time,
            'End Time': booking.end_time,
            'Total Price': booking.total_price || 0,
            'Status': booking.status,
            'Payment Status': booking.payment_status || 'pending',
            'Notes': booking.notes || '',
            'Created At': booking.created_at,
        };
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Create CSV workbook
    const csvWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(csvWorkbook, worksheet, 'Bookings');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `bookings-export-${timestamp}.csv`;

    // Export the file
    XLSX.writeFile(csvWorkbook, filename, { bookType: 'csv' });
};
