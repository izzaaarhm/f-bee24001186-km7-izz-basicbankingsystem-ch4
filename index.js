const express = require('express');
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient();

app.use(bodyParser.json());

const userRoutes = require('./routes/user');
const bankAccountRoutes = require('./routes/bank_account');
const profileRoutes = require('./routes/profile');
const transactionRoutes = require('./routes/transaction');

app.set('view engine', 'ejs');
app.set('views', './views'); 

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/accounts', bankAccountRoutes);
app.use('/api/v1/profiles', profileRoutes);
app.use('/api/v1/transactions', transactionRoutes);

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});


const shutdown = async () => {
    console.log('Menutup koneksi Prisma Client...');
    await prisma.$disconnect();
    console.log('Koneksi Prisma Client telah ditutup.');
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);