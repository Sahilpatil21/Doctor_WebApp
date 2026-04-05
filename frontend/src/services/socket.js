import io from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(token) {
    if (this.socket && this.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.connected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  joinDoctorRoom(doctorId) {
    if (this.socket) {
      this.socket.emit('joinDoctorRoom', doctorId);
    }
  }

  joinPatientRoom(patientId) {
    if (this.socket) {
      this.socket.emit('joinPatientRoom', patientId);
    }
  }

  onAppointmentBooked(callback) {
    if (this.socket) {
      this.socket.on('appointmentBooked', callback);
    }
  }

  onQueueUpdated(callback) {
    if (this.socket) {
      this.socket.on('queueUpdated', callback);
    }
  }

  onStatusUpdated(callback) {
    if (this.socket) {
      this.socket.on('statusUpdated', callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  isConnected() {
    return this.connected;
  }
}

export default new SocketService();
