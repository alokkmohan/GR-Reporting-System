function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function getReportingMonth(dateStr) {
  var d = new Date(dateStr);
  var months = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
  return months[d.getMonth()] + ' ' + d.getFullYear();
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function formatTimestamp(date) {
  var d = date || new Date();
  return Utilities.formatDate(d, 'Asia/Kolkata', 'dd-MM-yyyy HH:mm:ss');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
