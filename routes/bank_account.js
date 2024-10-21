const express = require('express');
const router = express.Router();
const BankAccount = require('../services/bank_accounts');
const { bankAccountSchema, withdrawSchema, depositSchema } = require('../services/validation');

router.post('/', async (req, res) => {
    const { error } = bankAccountSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { userId, bankName, bankAccountNumber, balance } = req.body;
    const account = new BankAccount(userId, bankName, bankAccountNumber, balance);

    try {
        const newAccount = await account.createAccount();
        res.status(201).json(newAccount); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    const accountInstance = new BankAccount();
    try {
        const accounts = await accountInstance.getAllAccounts();
        res.json(accounts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:accountId', async (req, res) => {
    const { accountId } = req.params;

    const accountInstance = new BankAccount();
    try {
        const account = await accountInstance.getAccountById(accountId);
        if (!account) {
            return res.status(404).json({ error: 'Akun bank tidak ditemukan' });
        }
        res.json(account);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:accountId/withdraw', async (req, res) => {
    const { error } = withdrawSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { accountId } = req.params;
    const { amount } = req.body;

    const accountInstance = new BankAccount();
    try {
        const updatedAccount = await accountInstance.withdraw(accountId, amount);
        res.json(updatedAccount);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:accountId/deposit', async (req, res) => {
    const { error } = depositSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { accountId } = req.params;
    const { amount } = req.body;

    const accountInstance = new BankAccount();
    try {
        const updatedAccount = await accountInstance.deposit(accountId, amount);
        res.json(updatedAccount);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:accountId', async (req, res) => {
    const { accountId } = req.params;

    const accountInstance = new BankAccount();
    try {
        const deletedAccount = await accountInstance.deleteAccount(accountId);
        res.json(deletedAccount);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
