const express = require('express')
const path = require('path')
const { Socket } = require('socket.io')
const app = express()
const PORT = process.env.PORT || 4000
const server = app.listen(PORT, () => console.log('💬 server on port ' + PORT ))

const io = require('socket.io')(server)

app.use(express.static(path.join(__dirname, 'public')))

// Function to broadcast the accurate, real-time client count
function emitClientCount() {
  // io.engine.clientsCount fetches the actual active connection count natively
  io.emit('clients-total', io.engine.clientsCount);
}

io.on('connection', (socket) => {
  console.log('Socket terkoneksi dengan ID:', socket.id)

  // Mengirim total klien yang aktif menggunakan io.engine.clientsCount
  io.emit('clients-total', io.engine.clientsCount)

  // === MENERIMA DATA DARI sendMessage() ANDA ===
  socket.on('message', (data) => {
    // data di sini berisi objek { name, message, dateTime } dari main.js Anda
    console.log('Pesan masuk:', data)
    
    // Kirimkan balik objek data tersebut ke semua user lain
    // Ini akan ditangkap oleh socket.on('chat-message') di main.js milik user lain
    socket.broadcast.emit('chat-message', data)
  })

  // Logika saat ada user yang menutup tab atau reload halaman
  socket.on('disconnect', () => {
    console.log('Socket terputus:', socket.id)
    io.emit('clients-total', io.engine.clientsCount)
  })

  socket.on('feedback', (data) => {
    socket.broadcast.emit('feedback',data)
  })
})