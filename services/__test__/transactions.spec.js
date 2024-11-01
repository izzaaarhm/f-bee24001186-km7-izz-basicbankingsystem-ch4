const Transaction = require('../transactions');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    transaction: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
    },
    bankAccount: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrisma)),
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

describe('Transaction Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('transfer', () => {
    test('harus melakukan transfer', async () => {
      const transaction = new Transaction(1, 2, 100);

      prisma.bankAccount.findUnique
        .mockResolvedValueOnce({ id: 1, balance: 200 })
        .mockResolvedValueOnce({ id: 2, balance: 300 });

      prisma.bankAccount.update
        .mockResolvedValueOnce({ id: 1, balance: 100 }) 
        .mockResolvedValueOnce({ id: 2, balance: 400 });

      prisma.transaction.create.mockResolvedValue({ id: 1, ...transaction });

      const result = await transaction.transfer();

      expect(prisma.bankAccount.findUnique).toHaveBeenCalledTimes(2);
      expect(prisma.bankAccount.update).toHaveBeenCalledTimes(2);
      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: {
          sourceAccountId: 1,
          destinationAccountId: 2,
          amount: 100,
        },
      });
      expect(result).toEqual({ id: 1, ...transaction });
    });
    
    test('harus menampilkan error jika rekening sumber tidak ditemukan', async () => {
      const transaction = new Transaction(1, 2, 100);
      prisma.bankAccount.findUnique.mockResolvedValueOnce(null);

      await expect(transaction.transfer()).rejects.toThrow('Rekening sumber tidak ditemukan');
      expect(prisma.bankAccount.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.bankAccount.update).not.toHaveBeenCalled();
      expect(prisma.transaction.create).not.toHaveBeenCalled();
    });

    test('harus menampilkan error jika rekening tujuan tidak ditemukan', async () => {
      const transaction = new Transaction(1, 2, 100);
      prisma.bankAccount.findUnique
        .mockResolvedValueOnce({ id: 1, balance: 200 })
        .mockResolvedValueOnce(null);

      await expect(transaction.transfer()).rejects.toThrow('Rekening tujuan tidak ditemukan');
      expect(prisma.bankAccount.findUnique).toHaveBeenCalledTimes(2);
      expect(prisma.bankAccount.update).not.toHaveBeenCalled();
      expect(prisma.transaction.create).not.toHaveBeenCalled();
    });

    test('harus menampilkan eror jika saldo tidak mencukupi', async () => {
      const transaction = new Transaction(1, 2, 500);
      prisma.bankAccount.findUnique.mockResolvedValueOnce({ id: 1, balance: 100 });

      await expect(transaction.transfer()).rejects.toThrow('Saldo rekening sumber tidak mencukupi');
      expect(prisma.bankAccount.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.bankAccount.update).not.toHaveBeenCalled();
      expect(prisma.transaction.create).not.toHaveBeenCalled();
    });
  });

  describe('getAllTransactions', () => {
    test('harus menampilkan daftar seluruh transaksi', async () => {
      const mockTransactions = [
        {
          id: 1,
          sourceAccountId: 1,
          destinationAccountId: 2,
          amount: 500,
          sourceAccount: {},
          destinationAccount: {},
        },
        {
          id: 2,
          sourceAccountId: 2,
          destinationAccountId: 3,
          amount: 200,
          sourceAccount: {},
          destinationAccount: {},
        },
      ];

      prisma.transaction.findMany.mockResolvedValue(mockTransactions);

      const result = await new Transaction().getAllTransactions();

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        include: {
          sourceAccount: true,
          destinationAccount: true,
        },
      });
      expect(result).toEqual(mockTransactions);
    });

    test('harus menampilkan error jika pengambilan data transaksi gagal', async () => {
      prisma.transaction.findMany.mockRejectedValue(new Error('Database error'));

      await expect(new Transaction().getAllTransactions()).rejects.toThrow('Gagal menampilkan seluruh transaksi: Database error');
    });
  });

  describe('getTransactionById', () => {
    test('harus menampilkan transaksi dengan ID yang diberikan', async () => {
      const mockTransaction = {
        id: 1,
        sourceAccountId: 1,
        destinationAccountId: 2,
        amount: 500,
        sourceAccount: {},
        destinationAccount: {},
      };

      prisma.transaction.findUnique.mockResolvedValue(mockTransaction);

      const result = await new Transaction().getTransactionById(1);

      expect(prisma.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          sourceAccount: true,
          destinationAccount: true,
        },
      });
      expect(result).toEqual(mockTransaction);
    });

    test('harus menampilkan error jika transaksi tidak ditemukan', async () => {
      prisma.transaction.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(new Transaction().getTransactionById(99)).rejects.toThrow('Transaksi tidak ditemukan: Database error');
    });
  });
});
