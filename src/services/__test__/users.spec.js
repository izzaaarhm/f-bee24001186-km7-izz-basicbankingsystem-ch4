const User = require('../users');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(() => Promise.resolve({ messageId: 'mockMessageId' })),
  })),
}));

jest.mock('bcrypt');

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

describe('User Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('findUserByEmail', () => {
    test('harus menampilkan user dengan email yang diberikan', async () => {
      const mockUser = { id: 1, name: 'User One', email: 'userone@example.com', profile: null };
      prisma.user.findUnique.mockResolvedValue(mockUser);
  
      const result = await new User().findUserByEmail('userone@example.com');
  
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'userone@example.com' },
      });
      expect(result).toEqual(mockUser);
    });
  
    test('harus menampilkan error jika user tidak ditemukan', async () => {
      prisma.user.findUnique.mockRejectedValue(new Error('Database error'));
  
      await expect(new User().findUserByEmail('notfound@example.com')).rejects.toThrow('Gagal menemukan user dengan email: Database error');
    });
  });

  describe('register', () => {
    test('harus mendaftarkan user baru', async () => {
      const user = new User('Izza', 'test@example.com', 'pass123');
      const hashedPassword = 'hashedPassword123'; 
      const mockUser = {
        id: 1,
        name: 'Izza',
        email: 'test@example.com',
        password: hashedPassword,
      };

      bcrypt.hash.mockResolvedValue(hashedPassword); 
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await user.register();

      expect(bcrypt.hash).toHaveBeenCalledWith('pass123', 10); 
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'Izza',
          email: 'test@example.com',
          password: hashedPassword,
          profile: undefined,
        },
      });
      expect(result).toEqual(mockUser);
      expect(user.id).toBe(mockUser.id);
    });

    test('harus menampilkan error jika pendaftaran gagal', async () => {
      const user = new User('Izza', 'test@example.com', 'pass123');
      prisma.user.create.mockRejectedValue(new Error('Database error'));

      await expect(user.register()).rejects.toThrow('Gagal mendaftarkan user: Database error');
    });
  });

  describe('login', () => {
    test('harus mengembalikan token jika login berhasil', async () => {
      const user = new User();
      const mockUser = { id: 1, email: 'test@example.com', password: 'hashedPassword' };
      const mockToken = 'jsonwebtoken';
      
      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jest.spyOn(jwt, 'sign').mockReturnValue(mockToken);
  
      const result = await user.login('test@example.com', 'pass123');
  
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('pass123', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUser.id, email: mockUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      expect(result).toEqual({ token: mockToken, userId: mockUser.id });
    });
  
    test('harus menampilkan error jika email tidak ditemukan', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
  
      await expect(new User().login('notfound@example.com', 'pass123')).rejects.toThrow('Email atau password salah');
    });
  
    test('harus menampilkan error jika password salah', async () => {
      const mockUser = { id: 1, email: 'test@example.com', password: 'hashedPassword' };
      
      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);
  
      await expect(new User().login('test@example.com', 'wrongpass')).rejects.toThrow('Email atau password salah');
    });
  });

  describe('forgotPassword', () => {
    test('harus mengirimkan email reset password jika email valid', async () => {
      const user = new User();
      const mockUser = { id: 1, email: 'test@example.com', name: 'Izza' };
      prisma.user.findUnique.mockResolvedValue(mockUser);
  
      const mockTransporter = require('nodemailer').createTransport();
      const sendMailSpy = jest.spyOn(mockTransporter, 'sendMail');
  
      const result = await user.forgotPassword('test@example.com');
  
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(sendMailSpy).toHaveBeenCalledWith({
        from: process.env.EMAIL_SENDER,
        to: mockUser.email,
        subject: 'Reset Password',
        text: expect.any(String),
      });
      expect(result).toEqual({ message: 'Email untuk reset password telah dikirim' });
    });
  
    test('harus menampilkan error jika email tidak ditemukan', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
  
      await expect(new User().forgotPassword('notfound@example.com')).rejects.toThrow(
        'Email tidak terdaftar'
      );
    });
  });
  
  describe('resetPassword', () => {
    test('harus memperbarui password jika token valid', async () => {
      const user = new User();
      const mockUser = { id: 1, email: 'test@example.com', password: 'oldHashedPassword' };
      const mockTokenPayload = { userId: 1, email: 'test@example.com' };
  
      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.hash.mockResolvedValue('newHashedPassword');
      jest.spyOn(jwt, 'verify').mockReturnValue(mockTokenPayload);
  
      const result = await user.resetPassword('validToken', 'newPassword');
  
      expect(jwt.verify).toHaveBeenCalledWith('validToken', process.env.JWT_SECRET);
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { password: 'newHashedPassword' },
      });
      expect(result).toEqual({ message: 'Password berhasil direset' });
    });
  
    test('harus menampilkan error jika token tidak valid', async () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });
  
      await expect(new User().resetPassword('invalidToken', 'newPassword')).rejects.toThrow('Gagal mereset password: Invalid token');
    });
  });   

  describe('getAllUsers', () => {
    test('harus menampilkan daftar semua user', async () => {
      const mockUsers = [
        { id: 1, name: 'User One', profile: null },
        { id: 2, name: 'User Two', profile: null },
      ];

      prisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await new User().getAllUsers();

      expect(prisma.user.findMany).toHaveBeenCalledWith({ include: { profile: true } });
      expect(result).toEqual(mockUsers);
    });

    test('harus menampilkan error jika pengambilan data gagal', async () => {
      prisma.user.findMany.mockRejectedValue(new Error('Database error'));

      await expect(new User().getAllUsers()).rejects.toThrow('Gagal menampilkan user: Database error');
    });
  });

  describe('findUserById', () => {
    test('harus menampilkan user dengan ID yang diberikan', async () => {
      const mockUser = { id: 1, name: 'User One', profile: null };
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await new User().findUserById(1);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { profile: true },
      });
      expect(result).toEqual(mockUser);
    });

    test('harus menampilkan error jika user tidak ditemukan', async () => {
      prisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(new User().findUserById(99)).rejects.toThrow('User tidak ditemukan: Database error');
    });
  });
});
