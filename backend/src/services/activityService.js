const UAParser = require('ua-parser-js');
const { supabaseAdmin } = require('../config/supabase');
const logger = require('../config/logger');

/**
 * Logs user activity (login, logout, register) to DB + file
 */
const logActivity = async ({ userId, email, eventType, req, authProvider, metadata = {} }) => {
  try {
    const ua = new UAParser(req.headers['user-agent']);
    const browser = ua.getBrowser();
    const os = ua.getOS();
    const device = ua.getDevice();

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.headers['x-real-ip']
      || req.socket?.remoteAddress
      || 'unknown';

    const deviceType = device.type || 'desktop';

    // Write to Supabase activity_logs table
    const { error } = await supabaseAdmin.from('activity_logs').insert({
      user_id: userId || null,
      email,
      event_type: eventType,
      ip_address: ip,
      user_agent: req.headers['user-agent'],
      device_type: deviceType,
      browser: `${browser.name || ''} ${browser.version || ''}`.trim(),
      os: `${os.name || ''} ${os.version || ''}`.trim(),
      auth_provider: authProvider,
      metadata,
    });

    if (error) logger.error('Failed to write activity log to DB', { error: error.message });

    // Also write to log file
    logger.info(`USER_ACTIVITY: ${eventType}`, {
      userId,
      email,
      eventType,
      ip,
      deviceType,
      browser: browser.name,
      os: os.name,
      authProvider,
    });
  } catch (err) {
    logger.error('logActivity error', { error: err.message });
  }
};

module.exports = { logActivity };
