const crypto = require('crypto');
const PDFDocument = require('pdfkit');

/**
 * Generate a unique ticket token using crypto.randomUUID()
 * @returns {string} UUID token
 */
const generateTicketToken = () => {
    return crypto.randomUUID();
};

/**
 * Generate a PDF ticket with event details and QR code
 * @param {Object} options
 * @param {string} options.eventTitle - Name of the event
 * @param {Date} options.eventDate - Date of the event
 * @param {string} options.eventLocation - Venue/location
 * @param {string} options.userName - Attendee's name
 * @param {string} options.userEmail - Attendee's email
 * @param {string} options.ticketToken - Unique ticket token
 * @param {string} options.qrDataURL - Base64 data URL of the QR code image
 * @returns {Promise<Buffer>} PDF file as a buffer
 */
const generateTicketPDF = ({ eventTitle, eventDate, eventLocation, userName, userEmail, ticketToken, qrDataURL }) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: [450, 680],
                margins: { top: 0, bottom: 0, left: 0, right: 0 }
            });

            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // ── Background ──
            doc.rect(0, 0, 450, 680).fill('#fafafa');

            // ── Header bar ──
            doc.rect(0, 0, 450, 90).fill('#6C3CE1');
            doc.fontSize(28).fill('#ffffff').font('Helvetica-Bold')
                .text('EVENZO', 0, 25, { align: 'center' });
            doc.fontSize(10).fill('#d4c4f7').font('Helvetica')
                .text('YOUR EVENT TICKET', 0, 58, { align: 'center' });

            // ── Event Title ──
            doc.fontSize(20).fill('#1a1a2e').font('Helvetica-Bold')
                .text(eventTitle, 30, 115, { width: 390, align: 'center' });

            // ── Divider ──
            const titleBottom = doc.y + 15;
            doc.moveTo(40, titleBottom).lineTo(410, titleBottom)
                .strokeColor('#e0d6f5').lineWidth(1.5).stroke();

            // ── Details section ──
            const detailsY = titleBottom + 20;
            const labelX = 40;
            const valueX = 140;

            const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
            const formattedTime = new Date(eventDate).toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit'
            });

            // Date
            doc.fontSize(10).fill('#888').font('Helvetica-Bold')
                .text('DATE', labelX, detailsY);
            doc.fontSize(12).fill('#1a1a2e').font('Helvetica')
                .text(formattedDate, valueX, detailsY);

            // Time
            doc.fontSize(10).fill('#888').font('Helvetica-Bold')
                .text('TIME', labelX, detailsY + 28);
            doc.fontSize(12).fill('#1a1a2e').font('Helvetica')
                .text(formattedTime, valueX, detailsY + 28);

            // Location
            doc.fontSize(10).fill('#888').font('Helvetica-Bold')
                .text('VENUE', labelX, detailsY + 56);
            doc.fontSize(12).fill('#1a1a2e').font('Helvetica')
                .text(eventLocation, valueX, detailsY + 56, { width: 270 });

            // Attendee
            doc.fontSize(10).fill('#888').font('Helvetica-Bold')
                .text('ATTENDEE', labelX, detailsY + 84);
            doc.fontSize(12).fill('#1a1a2e').font('Helvetica')
                .text(userName, valueX, detailsY + 84);

            // Email
            doc.fontSize(10).fill('#888').font('Helvetica-Bold')
                .text('EMAIL', labelX, detailsY + 112);
            doc.fontSize(12).fill('#1a1a2e').font('Helvetica')
                .text(userEmail, valueX, detailsY + 112);

            // ── Dashed cut line ──
            const cutLineY = detailsY + 155;
            doc.moveTo(20, cutLineY).lineTo(430, cutLineY)
                .strokeColor('#ccc').lineWidth(1)
                .dash(5, { space: 4 }).stroke();
            doc.undash();

            // ── QR Code section ──
            const qrY = cutLineY + 20;
            doc.fontSize(11).fill('#6C3CE1').font('Helvetica-Bold')
                .text('SCAN TO VERIFY', 0, qrY, { align: 'center' });

            // Convert data URL to buffer for embedding
            const qrBase64 = qrDataURL.replace(/^data:image\/png;base64,/, '');
            const qrBuffer = Buffer.from(qrBase64, 'base64');

            const qrSize = 160;
            const qrX = (450 - qrSize) / 2;
            doc.image(qrBuffer, qrX, qrY + 20, { width: qrSize, height: qrSize });

            // ── Ticket ID ──
            const ticketIdY = qrY + 190;
            doc.fontSize(8).fill('#aaa').font('Helvetica')
                .text(`Ticket ID: ${ticketToken}`, 0, ticketIdY, { align: 'center' });

            // ── Footer ──
            doc.rect(0, 640, 450, 40).fill('#6C3CE1');
            doc.fontSize(9).fill('#d4c4f7').font('Helvetica')
                .text('Present this QR code at the venue entrance', 0, 652, { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateTicketToken, generateTicketPDF };
