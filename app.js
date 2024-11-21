const express = require('express');
const app = express();
const { PORT = 3000} = process.env;
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient();
const swaggerDocs = require('./swagger');
const morgan = require('morgan');
const Sentry = require('@sentry/node');

require('dotenv').config();
require('./src/libs/sentry.js');

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use('/images', express.static('public/images'));

const userRoutes = require('./src/routes/user');
const bankAccountRoutes = require('./src/routes/bank_account');
const profileRoutes = require('./src/routes/profile');
const transactionRoutes = require('./src/routes/transaction');
const mediaRoutes = require('./src/routes/media');

app.set('view engine', 'ejs');
app.set('views', './src/views'); 

app.get('/', (req, res) => {
    res.render('index');
});

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/accounts', bankAccountRoutes);
app.use('/api/v1/profiles', profileRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/media', mediaRoutes);

app.get("/debug-sentry", function mainHandler(req, res) {
    throw new Error("My first Sentry error!");
  });

app.listen(PORT, () => {
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
