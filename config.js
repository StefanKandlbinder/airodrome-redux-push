const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  publicVapidKey: process.env.PUBLIC_VAPID_KEY,
  privateVapidKey: process.env.PRIVATE_VAPID_KEY,
  webPushContact: process.env.WEB_PUSH_CONTACT
};