require('dotenv').config();
require('./src/libs/sentry');

const Sentry = require('@sentry/node');
const express = require('express');
const { PORT = 3000} = process.env;
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient();
const swaggerDocs = require('./swagger');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);


app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

app.use('/images', express.static('public/images'));

app.set('view engine', 'ejs');
app.set('views', './src/views'); 

app.get('/', (req, res) => {
    res.render('index');
});

const userRoutes = require('./src/routes/user');
const bankAccountRoutes = require('./src/routes/bank_account');
const profileRoutes = require('./src/routes/profile');
const transactionRoutes = require('./src/routes/transaction');
const mediaRoutes = require('./src/routes/media');

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/accounts', bankAccountRoutes);
app.use('/api/v1/profiles', profileRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/media', mediaRoutes);

app.set('socketio', io);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

app.get("/debug-sentry", function mainHandler() {
    throw new Error("My first Sentry error!");
});

Sentry.setupExpressErrorHandler(app);

server.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    swaggerDocs(app, PORT);
});


const shutdown = async () => {
    console.log('Menutup koneksi Prisma Client...');
    await prisma.$disconnect();
    console.log('Koneksi Prisma Client telah ditutup.');
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = app;
