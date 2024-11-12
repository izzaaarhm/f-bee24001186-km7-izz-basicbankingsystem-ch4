const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Transaction {
  constructor(sourceAccountId = null, destinationAccountId = null, amount = 0) {
    this.id = null;
    this.sourceAccountId = sourceAccountId;
    this.destinationAccountId = destinationAccountId;
    this.amount = amount;
  }

  async transfer() {
    const { sourceAccountId, destinationAccountId, amount } = this;

    const transaction = await prisma.$transaction(async (prisma) => {
      const sourceAccount = await prisma.bankAccount.findUnique({
        where: { id: Number(sourceAccountId) },
      });

      if (!sourceAccount) {
        throw new Error('Rekening sumber tidak ditemukan');
      }

      const destinationAccount = await prisma.bankAccount.findUnique({
        where: { id: Number(destinationAccountId) },
      });

      if (!destinationAccount) {
        throw new Error('Rekening tujuan tidak ditemukan');
      }

      if (sourceAccount.balance < amount) {
        throw new Error('Saldo rekening sumber tidak mencukupi');
      }

      await prisma.bankAccount.update({
        where: { id: Number(sourceAccountId) },
        data: { balance: { decrement: amount } },
      });

      await prisma.bankAccount.update({
        where: { id: Number(destinationAccountId) },
        data: { balance: { increment: amount } },
      });

      const newTransaction = await prisma.transaction.create({
        data: {
          sourceAccountId: Number(sourceAccountId),
          destinationAccountId: Number(destinationAccountId),
          amount,
        },
      });

      return newTransaction;
    });

    return transaction;
  }

  async getAllTransactions() {
    try {
      const transactions = await prisma.transaction.findMany({
        include: {
          sourceAccount: true,
          destinationAccount: true,
        },
      });
      return transactions;
    } catch (error) {
      throw new Error(`Gagal menampilkan seluruh transaksi: ${error.message}`);
    }
  }

  async getTransactionById(transactionId) {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: Number(transactionId) },
        include: {
          sourceAccount: true,
          destinationAccount: true,
        },
      });
      return transaction;
    } catch (error) {
      throw new Error(`Transaksi tidak ditemukan: ${error.message}`);
    }
  }
}

module.exports = Transaction;
