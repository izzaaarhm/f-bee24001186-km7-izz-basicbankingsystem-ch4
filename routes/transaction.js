const express = require('express');
const router = express.Router();
const Transaction = require('../services/transactions');
const { transactionSchema } = require('../services/validation');

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

router.get('/', async (req, res) => {
    const transactionInstance = new Transaction();
    try {
        const transactions = await transactionInstance.getAllTransactions();
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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
