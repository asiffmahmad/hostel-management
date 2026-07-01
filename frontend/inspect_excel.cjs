const xlsx = require('xlsx');
const workbook = xlsx.readFile('../student_room_details_corrected_roomwise.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet);
console.log("Number of rows:", data.length);
if (data.length > 0) {
  console.log("Columns:", Object.keys(data[0]));
  console.log("First row:", data[0]);
}
