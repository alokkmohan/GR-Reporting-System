var OTP_EXPIRY_SECONDS = 300;   // 5 minutes
var SESSION_EXPIRY_SECONDS = 1800; // 30 minutes
var ADMIN_EMAIL = 'alok.mohan@educategirls.ngo';

function sendOTP(email) {
  if (!isValidEmail(email)) return { success: false, message: 'Invalid email address.' };

  var otp = generateOTP();
  var cache = CacheService.getScriptCache();
  cache.put('otp_' + email, otp, OTP_EXPIRY_SECONDS);

  try {
    MailApp.sendEmail({
      to: email,
      subject: 'GR Reporting System Your Login OTP',
      body: 'Your OTP for GR Reporting System login is: ' + otp + '\n\nThis OTP is valid for 5 minutes.\n\nDo not share this OTP with anyone.\n\nEducate Girls'
    });
    return { success: true };
  } catch (e) {
    return { success: false, message: 'Could not send email. Please try again.' };
  }
}

function verifyOTP(email, otp) {
  var cache = CacheService.getScriptCache();
  var stored = cache.get('otp_' + email);
  if (!stored) return { success: false, message: 'OTP expired. Please request a new one.' };
  if (stored !== otp.toString().trim()) return { success: false, message: 'Incorrect OTP.' };
  cache.remove('otp_' + email);

  var user = getUserByEmail(email);
  if (!user) {
    var token = createSession(email, null, 'unregistered');
    return { success: true, status: 'unregistered', token: token };
  }
  if (user.status === 'pending') {
    var token = createSession(email, user.role, 'pending');
    return { success: true, status: 'pending', token: token };
  }
  if (user.status === 'suspended') {
    return { success: false, message: 'Your account has been suspended. Contact admin.' };
  }

  var token = createSession(email, user.role, 'active');
  return { success: true, status: 'active', token: token, role: user.role, user: user };
}

function createSession(email, role, status) {
  var token = generateUUID();
  var cache = CacheService.getScriptCache();
  cache.put('session_' + token, JSON.stringify({ email: email, role: role, status: status }), SESSION_EXPIRY_SECONDS);
  return token;
}

function verifySession(token) {
  if (!token) return null;
  var cache = CacheService.getScriptCache();
  var data = cache.get('session_' + token);
  if (!data) return null;
  return JSON.parse(data);
}

function destroySession(token) {
  CacheService.getScriptCache().remove('session_' + token);
}

function getSessionUser(token) {
  var session = verifySession(token);
  if (!session) return null;
  var user = getUserByEmail(session.email);
  return user;
}
