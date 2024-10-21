const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class BankAccount {
  constructor(userId = null, bankName = null, bankAccountNumber = null, balance = 0) {
    this.id = null;
    this.userId = userId;
    this.bankName = bankName;
    this.bankAccountNumber = bankAccountNumber;
    this.balance = balance;
  }


  async createAccount() {
    try {
      const newAccount = await prisma.bankAccount.create({
        data: {
          userId: this.userId,
          bankName: this.bankName,
          bankAccountNumber: this.bankAccountNumber,
          balance: this.balance,
        },
      });
      this.id = newAccount.id;
      return newAccount;
    } catch (error) {
      throw new Error(`Gagal membuat akun bank: ${error.message}`);
    }
  }


  async getAllAccounts() {
    try {
      const accounts = await prisma.bankAccount.findMany({
        include: { user: true },
      });
      return accounts;
    } catch (error) {
      throw new Error(`Gagal menampilkan akun bank: ${error.message}`);
    }
  }


  async getAccountById(accountId) {
    try {
      const account = await prisma.bankAccount.findUnique({
        where: { id: Number(accountId) },
        include: { user: true }, 
      });
      return account;
    } catch (error) {
      throw new Error(`Akun bank tidak ditemukan: ${error.message}`);
    }
  }


  async withdraw(accountId, amount) {
    try {
      const account = await prisma.bankAccount.findUnique({
        where: { id: Number(accountId) },
      });

      if (account.balance < amount) {
        throw new Error('Saldo tidak mencukupi');
      }

      const updatedAccount = await prisma.bankAccount.update({
        where: { id: Number(accountId) },
        data: { balance: account.balance - amount },
      });

      return updatedAccount;
    } catch (error) {
      throw new Error(`Gagal menarik saldo!: ${error.message}`);
    }
  }


  async deposit(accountId, amount) {
    try {
      const updatedAccount = await prisma.bankAccount.update({
        where: { id: Number(accountId) },
        data: { balance: { increment: amount } },
      });

      return updatedAccount;
    } catch (error) {
      throw new Error(`Gagal melakukan deposit: ${error.message}`);
    }
  }


  async deleteAccount(accountId) {
    try {
      const deletedAccount = await prisma.bankAccount.delete({
        where: { id: Number(accountId) },
      });
      return deletedAccount;
    } catch (error) {
      throw new Error(`Gagal menghapus akun bank: ${error.message}`);
    }
  }
}

module.exports = BankAccount;
