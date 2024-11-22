const { io } = require('../../app.js');

class Notification {
  static push(event, message) {
    if (io) {
      io.emit(event, { message });
    } else {
      console.error('Socket.IO not initialized');
    }
  }
}

module.exports = Notification;
