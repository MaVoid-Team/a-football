import ExcelJS from "exceljs";
import { Booking } from '@/schemas/booking.schema';
import { Branch } from '@/schemas/branch.schema';
import { Court } from '@/schemas/court.schema';

interface ExportBookingsData {
    bookings: Booking[];
    branches: Branch[];
    courts: Court[];
}

const BOOKING_HEADERS = [
    'Booking ID',
    'Customer Name',
    'Customer Phone',
    'Branch',
    'Court',
    'Date',
    'Start Time',
    'End Time',
    'Total Price',
    'Payment Type',
    'Amount Due Now',
    'Amount Remaining',
    'Status',
    'Payment Status',
    'Notes',
    'Created At',
] as const;

const COL_WIDTHS = [12, 20, 15, 20, 20, 12, 10, 10, 12, 14, 14, 16, 12, 15, 30, 20];

const buildExportData = ({ bookings, branches, courts }: ExportBookingsData) => {
    return bookings.map((booking) => {
        const branch = branches.find((b) => Number(b.id) === booking.branch_id);
        const court = courts.find((c) => Number(c.id) === booking.court_id);

        return {
            'Booking ID': String(booking.id).padStart(5, '0'),
            'Customer Name': booking.user_name,
            'Customer Phone': booking.user_phone,
            Branch: branch?.name || 'Unknown',
            Court: court?.name || `Court #${booking.court_id}`,
            Date: booking.date,
            'Start Time': booking.start_time,
            'End Time': booking.end_time,
            'Total Price': booking.total_price || 0,
            'Payment Type': booking.payment_option || 'full',
            'Amount Due Now': booking.amount_due_now || booking.total_price || 0,
            'Amount Remaining': booking.amount_remaining || 0,
            Status: booking.status,
            'Payment Status': booking.payment_status || 'pending',
            Notes: booking.notes || '',
            'Created At': booking.created_at,
        };
    });
};

const toCsvValue = (value: unknown): string => {
    const raw = String(value ?? '');
    if (/[",\n]/.test(raw)) {
        return `"${raw.replace(/"/g, '""')}"`;
    }
    return raw;
};

const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const exportBookingsToExcel = ({ bookings, branches, courts }: ExportBookingsData) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bookings');
    const exportData = buildExportData({ bookings, branches, courts });

    worksheet.columns = BOOKING_HEADERS.map((header, index) => ({
        header,
        key: header,
        width: COL_WIDTHS[index],
    }));

    exportData.forEach((row) => {
        worksheet.addRow(row);
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `bookings-export-${timestamp}.xlsx`;

    workbook.xlsx.writeBuffer()
        .then((buffer) => {
            downloadBlob(
                new Blob([buffer], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                }),
                filename,
            );
        })
        .catch((error) => {
            console.error('Failed to export bookings to Excel', error);
        });
};

export const exportBookingsToCSV = ({ bookings, branches, courts }: ExportBookingsData) => {
    const exportData = buildExportData({ bookings, branches, courts });
    const lines = [
        BOOKING_HEADERS.map((header) => toCsvValue(header)).join(','),
        ...exportData.map((row) => BOOKING_HEADERS.map((header) => toCsvValue(row[header])).join(',')),
    ];

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `bookings-export-${timestamp}.csv`;

    downloadBlob(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' }), filename);
};
