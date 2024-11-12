const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Profile {
  constructor(userId = null, identityType = null, identityNumber = null, address = null) {
    this.id = null;
    this.userId = userId;
    this.identityType = identityType;
    this.identityNumber = identityNumber;
    this.address = address;
  }


  async createProfile() {
    try {
      const newProfile = await prisma.profile.create({
        data: {
          userId: this.userId,
          identityType: this.identityType,
          identityNumber: this.identityNumber,
          address: this.address,
        },
      });
      this.id = newProfile.id;
      return newProfile;
    } catch (error) {
      throw new Error(`Gagal membuat profile: ${error.message}`);
    }
  }


  async getAllProfiles() {
    try {
      const profiles = await prisma.profile.findMany({
        include: { user: true }, 
      });
      return profiles;
    } catch (error) {
      throw new Error(`Gagal menampilkan profile: ${error.message}`);
    }
  }

  async getProfileById(profileId) {
    try {
      const profile = await prisma.profile.findUnique({
        where: { id: Number(profileId) },
        include: { user: true }, 
      });
      return profile;
    } catch (error) {
      throw new Error(`Profile tidak ditemukan: ${error.message}`);
    }
  }

  async updateProfile(profileId, data) {
    try {
      const updatedProfile = await prisma.profile.update({
        where: { id: Number(profileId) },
        data,
      });
      return updatedProfile;
    } catch (error) {
      throw new Error(`Gagal mengupdate profile: ${error.message}`);
    }
  }

  async deleteProfile(profileId) {
    try {
      const deletedProfile = await prisma.profile.delete({
        where: { id: Number(profileId) },
      });
      return deletedProfile;
    } catch (error) {
      throw new Error(`Gagal menghapus profile: ${error.message}`);
    }
  }
}

module.exports = Profile;
