/**
 * Google Apps Script - Web App for AllSportsProfessionals Contact Form
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com and create a new project
 * 2. Replace the default code with this script
 * 3. Create a Google Sheet and copy its ID from the URL
 * 4. Replace SPREADSHEET_ID below with your Sheet ID
 * 5. Deploy as Web App:
 *    - Click "Deploy" > "New deployment"
 *    - Select type: "Web app"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 *    - Click "Deploy" and copy the URL
 * 6. Set the Web App URL as GOOGLE_SCRIPT_URL in your .env.local
 *
 * OPTIONAL EMAIL NOTIFICATION:
 * - The script also sends an email to NOTIFICATION_EMAIL on each submission
 * - Update NOTIFICATION_EMAIL below with your email address
 */

// eslint-disable-next-line no-unused-vars
var SPREADSHEET_ID = "YOUR_GOOGLE_SHEET_ID_HERE";
// eslint-disable-next-line no-unused-vars
var NOTIFICATION_EMAIL = "info@allsportsprofessionals.com";

// eslint-disable-next-line no-unused-vars
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet =
      SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();

    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Name",
        "Email",
        "Phone",
        "Sport",
        "Inquiry Type",
        "Message",
        "Source",
      ]);
      // Format header row
      var headerRange = sheet.getRange(1, 1, 1, 8);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#3b82f6");
      headerRange.setFontColor("#ffffff");
    }

    // Append the data
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name,
      data.email,
      data.phone,
      data.sport,
      data.type,
      data.message || "",
      data.source || "Website",
    ]);

    // Send email notification
    if (NOTIFICATION_EMAIL) {
      var subject =
        "New Inquiry - AllSportsProfessionals: " + data.type;
      var body =
        "New inquiry received!\n\n" +
        "Name: " + data.name + "\n" +
        "Email: " + data.email + "\n" +
        "Phone: " + data.phone + "\n" +
        "Sport: " + data.sport + "\n" +
        "Type: " + data.type + "\n" +
        "Message: " + (data.message || "N/A") + "\n" +
        "Time: " + (data.timestamp || new Date().toISOString()) + "\n\n" +
        "---\nAllSportsProfessionals Contact Form";

      MailApp.sendEmail(NOTIFICATION_EMAIL, subject, body);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// eslint-disable-next-line no-unused-vars
function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: "active",
      service: "AllSportsProfessionals Contact Form",
    })
  ).setMimeType(ContentService.MimeType.JSON);
}
