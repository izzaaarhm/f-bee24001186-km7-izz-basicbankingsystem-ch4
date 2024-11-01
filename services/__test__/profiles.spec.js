const Profile = require('../profiles');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    profile: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

describe('Profile Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProfile', () => {
    test('harus membuat profile baru', async () => {
      const profile = new Profile(1, 'KTP', '1234567890', 'Jl. Nuh No. 1');
      const mockProfile = {
        id: 1,
        userId: 1,
        identityType: 'KTP',
        identityNumber: '1234567890',
        address: 'Jl. Nuh No. 1',
      };

      prisma.profile.create.mockResolvedValue(mockProfile);

      const result = await profile.createProfile();

      expect(prisma.profile.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          identityType: 'KTP',
          identityNumber: '1234567890',
          address: 'Jl. Nuh No. 1',
        },
      });
      expect(result).toEqual(mockProfile);
      expect(profile.id).toBe(mockProfile.id);
    });

    test('harus menampilkan error jika pembuatan profile gagal', async () => {
      const profile = new Profile(1, 'KTP', '1234567890', 'Jl. Nuh No. 1');
      prisma.profile.create.mockRejectedValue(new Error('Database error'));

      await expect(profile.createProfile()).rejects.toThrow('Gagal membuat profile: Database error');
    });
  });

  describe('getAllProfiles', () => {
    test('harus menampilkan daftar semua profile', async () => {
      const mockProfiles = [
        { id: 1, userId: 1, identityType: 'KTP', identityNumber: '1234567890', address: 'Jl. Nuh No. 1', user: {} },
        { id: 2, userId: 2, identityType: 'SIM', identityNumber: '0987654321', address: 'Jl. Baru No. 2', user: {} },
      ];

      prisma.profile.findMany.mockResolvedValue(mockProfiles);

      const result = await new Profile().getAllProfiles();

      expect(prisma.profile.findMany).toHaveBeenCalledWith({ include: { user: true } });
      expect(result).toEqual(mockProfiles);
    });

    test('harus menampilkan error jika pengambilan data gagal', async () => {
      prisma.profile.findMany.mockRejectedValue(new Error('Database error'));

      await expect(new Profile().getAllProfiles()).rejects.toThrow('Gagal menampilkan profile: Database error');
    });
  });

  describe('getProfileById', () => {
    test('harus menampilkan profile dengan ID yang diberikan', async () => {
      const mockProfile = { id: 1, userId: 1, identityType: 'KTP', identityNumber: '1234567890', address: 'Jl. Nuh No. 1', user: {} };
      prisma.profile.findUnique.mockResolvedValue(mockProfile);

      const result = await new Profile().getProfileById(1);

      expect(prisma.profile.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { user: true },
      });
      expect(result).toEqual(mockProfile);
    });

    test('harus menampilkan error jika profile tidak ditemukan', async () => {
      prisma.profile.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(new Profile().getProfileById(99)).rejects.toThrow('Profile tidak ditemukan: Database error');
    });
  });

  describe('updateProfile', () => {
    test('harus memperbarui profile dengan data baru', async () => {
      const profile = new Profile();
      const mockUpdatedProfile = {
        id: 1,
        userId: 1,
        identityType: 'KTP',
        identityNumber: '1234567890',
        address: 'Jl. Baru No. 3',
      };

      prisma.profile.update.mockResolvedValue(mockUpdatedProfile);

      const result = await profile.updateProfile(1, { address: 'Jl. Baru No. 3' });

      expect(prisma.profile.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { address: 'Jl. Baru No. 3' },
      });
      expect(result).toEqual(mockUpdatedProfile);
    });

    test('harus menampilkan error jika pembaruan profile gagal', async () => {
      prisma.profile.update.mockRejectedValue(new Error('Database error'));

      await expect(new Profile().updateProfile(1, { address: 'Jl. Baru No. 3' })).rejects.toThrow('Gagal mengupdate profile: Database error');
    });
  });

  describe('deleteProfile', () => {
    test('harus menghapus profile dengan ID yang diberikan', async () => {
      const mockDeletedProfile = { id: 1, userId: 1, identityType: 'KTP', identityNumber: '1234567890', address: 'Jl. Nuh No. 1' };
      prisma.profile.delete.mockResolvedValue(mockDeletedProfile);

      const result = await new Profile().deleteProfile(1);

      expect(prisma.profile.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockDeletedProfile);
    });

    test('harus menampilkan error jika penghapusan profile gagal', async () => {
      prisma.profile.delete.mockRejectedValue(new Error('Database error'));

      await expect(new Profile().deleteProfile(1)).rejects.toThrow('Gagal menghapus profile: Database error');
    });
  });
});
