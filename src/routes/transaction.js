const express = require('express');
const router = express.Router();
const Transaction = require('../services/transactions');
const { transactionSchema } = require('../middleware/validation');

/**
 * @swagger
 * /api/v1/transactions/transfer:
 *   post:
 *     summary: Melakukan transfer antara dua akun
 *     tags: [Transaction]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sourceAccountId:
 *                 type: string
 *               destinationAccountId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Transfer berhasil
 *       400:
 *         description: Input tidak valid atau akun sumber dan tujuan sama
 *       500:
 *         description: Kesalahan server
 */
router.post('/transfer', async (req, res) => {
    const { error } = transactionSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { sourceAccountId, destinationAccountId, amount } = req.body;
    
    if (sourceAccountId === destinationAccountId) {
        return res.status(400).json({ error: 'Transfer tidak bisa dilakukan ke akun yang sama.' });
    }

    const transaction = new Transaction(sourceAccountId, destinationAccountId, amount);

    try {
        const newTransaction = await transaction.createTransaction();
        res.status(201).json(newTransaction); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/v1/transactions:
 *   get:
 *     summary: Menampilkan semua transaksi
 *     tags: [Transaction]
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan daftar transaksi
 *       500:
 *         description: Kesalahan server
 */
router.get('/', async (req, res) => {
    const transactionInstance = new Transaction();
    try {
        const transactions = await transactionInstance.getAllTransactions();
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/v1/transactions/{transactionId}:
 *   get:
 *     summary: Menampilkan transaksi berdasarkan ID
 *     tags: [Transaction]
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID transaksi
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan transaksi
 *       404:
 *         description: Transaksi tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.get('/:transactionId', async (req, res) => {
    const { transactionId } = req.params;

    const transactionInstance = new Transaction();
    try {
        const transaction = await transactionInstance.getTransactionById(transactionId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
        }
        res.json(transaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
