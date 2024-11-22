class Notification {
  static push(event, message) {
    // Ambil instance io dari app
    const io = require('../app').get('socketio');
    
    if (io) {
      io.emit(event, { message });
    } else {
      console.error('Socket.IO not initialized');
    }
  }
}

module.exports = Notification;
