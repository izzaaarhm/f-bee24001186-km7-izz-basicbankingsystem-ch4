const express = require('express');
const router = express.Router();
const BankAccount = require('../services/bank_accounts');
const { bankAccountSchema, withdrawSchema, depositSchema } = require('../middleware/validation');
const { authJWT } = require('../middleware/auth');

/**
 * @swagger
 * /api/v1/accounts:
 *   post:
 *     summary: Membuat akun bank baru
 *     tags: [Bank Account]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               bankName:
 *                 type: string
 *               bankAccountNumber:
 *                 type: string
 *               balance:
 *                 type: number
 *     responses:
 *       201:
 *         description: Akun bank berhasil dibuat
 *       400:
 *         description: Input tidak valid
 *       500:
 *         description: Kesalahan server
 */
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


/**
 * @swagger
 * /api/v1/accounts:
 *   get:
 *     summary: Menampilkan semua akun bank
 *     tags: [Bank Account]
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan daftar akun bank
 *       500:
 *         description: Kesalahan server
 */
router.get('/', authJWT, async (req, res) => {
    const accountInstance = new BankAccount();
    try {
        const accounts = await accountInstance.getAllAccounts();
        res.json(accounts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/v1/accounts/{accountId}:
 *   get:
 *     summary: Menampilkan akun bank berdasarkan ID
 *     tags: [Bank Account]
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID akun bank
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan akun bank
 *       404:
 *         description: Akun bank tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.get('/:accountId', authJWT, async (req, res) => {
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

/**
 * @swagger
 * /api/v1/accounts/{accountId}/withdraw:
 *   post:
 *     summary: Menarik saldo dari akun bank
 *     tags: [Bank Account]
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID akun bank
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Jumlah yang akan ditarik
 *     responses:
 *       200:
 *         description: Penarikan berhasil
 *       400:
 *         description: Input tidak valid
 *       500:
 *         description: Kesalahan server
 */
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

/**
 * @swagger
 * /api/v1/accounts/{accountId}/deposit:
 *   post:
 *     summary: Melakukan penyetoran ke akun bank
 *     tags: [Bank Account]
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID akun bank
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Jumlah yang akan disetorkan
 *     responses:
 *       200:
 *         description: Penyetoran berhasil
 *       400:
 *         description: Input tidak valid
 *       500:
 *         description: Kesalahan server
 */
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

/**
 * @swagger
 * /api/v1/accounts/{accountId}:
 *   delete:
 *     summary: Menghapus akun bank
 *     tags: [Bank Account]
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID akun bank yang akan dihapus
 *     responses:
 *       200:
 *         description: Akun bank berhasil dihapus
 *       404:
 *         description: Akun bank tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
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
