const BankAccount = require('../bank_accounts');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    bankAccount: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

describe('BankAccount Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAccount', () => {
    test('harus membuat akun bank baru', async () => {
      const bankAccount = new BankAccount(1, 'BCA', '1234567890', 100000);
      const mockAccount = {
        id: 1,
        userId: 1,
        bankName: 'BCA',
        bankAccountNumber: '1234567890',
        balance: 100000,
      };

      prisma.bankAccount.create.mockResolvedValue(mockAccount);

      const result = await bankAccount.createAccount();

      expect(prisma.bankAccount.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          bankName: 'BCA',
          bankAccountNumber: '1234567890',
          balance: 100000,
        },
      });
      expect(result).toEqual(mockAccount);
      expect(bankAccount.id).toBe(mockAccount.id);
    });

    test('harus menampilkan error jika pembuatan akun bank gagal', async () => {
      const bankAccount = new BankAccount(1, 'BCA', '1234567890', 100000);
      prisma.bankAccount.create.mockRejectedValue(new Error('Database error'));

      await expect(bankAccount.createAccount()).rejects.toThrow('Gagal membuat akun bank: Database error');
    });
  });

  describe('getAllAccounts', () => {
    test('harus menampilkan daftar semua akun bank', async () => {
      const mockAccounts = [
        { id: 1, userId: 1, bankName: 'BCA', bankAccountNumber: '1234567890', balance: 100000, user: {} },
        { id: 2, userId: 2, bankName: 'Mandiri', bankAccountNumber: '0987654321', balance: 200000, user: {} },
      ];

      prisma.bankAccount.findMany.mockResolvedValue(mockAccounts);

      const result = await new BankAccount().getAllAccounts();

      expect(prisma.bankAccount.findMany).toHaveBeenCalledWith({ include: { user: true } });
      expect(result).toEqual(mockAccounts);
    });

    test('harus menampilkan error jika pengambilan data gagal', async () => {
      prisma.bankAccount.findMany.mockRejectedValue(new Error('Database error'));

      await expect(new BankAccount().getAllAccounts()).rejects.toThrow('Gagal menampilkan akun bank: Database error');
    });
  });

  describe('getAccountById', () => {
    test('harus menampilkan akun bank dengan ID yang diberikan', async () => {
      const mockAccount = { id: 1, userId: 1, bankName: 'BCA', bankAccountNumber: '1234567890', balance: 100000, user: {} };
      prisma.bankAccount.findUnique.mockResolvedValue(mockAccount);

      const result = await new BankAccount().getAccountById(1);

      expect(prisma.bankAccount.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { user: true },
      });
      expect(result).toEqual(mockAccount);
    });

    test('harus menampilkan error jika akun bank tidak ditemukan', async () => {
      prisma.bankAccount.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(new BankAccount().getAccountById(99)).rejects.toThrow('Akun bank tidak ditemukan: Database error');
    });
  });

  describe('withdraw', () => {
    test('harus menarik saldo jika saldo mencukupi', async () => {
      const mockAccount = { id: 1, userId: 1, balance: 100000 };
      const updatedAccount = { ...mockAccount, balance: 50000 };

      prisma.bankAccount.findUnique.mockResolvedValue(mockAccount);
      prisma.bankAccount.update.mockResolvedValue(updatedAccount);

      const result = await new BankAccount().withdraw(1, 50000);

      expect(prisma.bankAccount.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.bankAccount.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { balance: 50000 },
      });
      expect(result).toEqual(updatedAccount);
    });

    test('harus menampilkan error jika saldo tidak mencukupi', async () => {
      const mockAccount = { id: 1, userId: 1, balance: 10000 };

      prisma.bankAccount.findUnique.mockResolvedValue(mockAccount);

      await expect(new BankAccount().withdraw(1, 50000)).rejects.toThrow('Saldo tidak cukup!');
    });
  });

  describe('deposit', () => {
    test('harus menambah saldo akun bank', async () => {
      const mockAccount = { id: 1, userId: 1, balance: 100000 };
      const updatedAccount = { ...mockAccount, balance: 150000 };

      prisma.bankAccount.update.mockResolvedValue(updatedAccount);

      const result = await new BankAccount().deposit(1, 50000);

      expect(prisma.bankAccount.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { balance: { increment: 50000 } },
      });
      expect(result).toEqual(updatedAccount);
    });

    test('harus menampilkan error jika deposit gagal', async () => {
      prisma.bankAccount.update.mockRejectedValue(new Error('Database error'));

      await expect(new BankAccount().deposit(1, 50000)).rejects.toThrow('Gagal melakukan deposit: Database error');
    });
  });

  describe('deleteAccount', () => {
    test('harus menghapus akun bank dengan ID yang diberikan', async () => {
      const mockDeletedAccount = { id: 1, userId: 1, bankName: 'BCA', bankAccountNumber: '1234567890', balance: 100000 };
      prisma.bankAccount.delete.mockResolvedValue(mockDeletedAccount);

      const result = await new BankAccount().deleteAccount(1);

      expect(prisma.bankAccount.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockDeletedAccount);
    });

    test('harus menampilkan error jika penghapusan akun bank gagal', async () => {
      prisma.bankAccount.delete.mockRejectedValue(new Error('Database error'));

      await expect(new BankAccount().deleteAccount(1)).rejects.toThrow('Gagal menghapus akun bank: Database error');
    });
  });
});
