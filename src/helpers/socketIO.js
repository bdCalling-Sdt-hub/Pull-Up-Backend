
const socketIO = (io) => {
  io.on('connection', (socket) => {
    socket.on('disconnect', () => {
      console.log(`ID: ${socket.id} disconnected`);
    });
  });
};

module.exports = socketIO;
