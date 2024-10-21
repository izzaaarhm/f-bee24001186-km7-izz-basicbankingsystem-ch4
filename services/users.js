const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class User {
  constructor(name = null, email = null, password = null, profile = null) {
    this.id = null;
    this.name = name;
    this.email = email;
    this.password = password;
    this.profile = profile;
  }


  
  async register() {
    try {
      const newUser = await prisma.user.create({
        data: {
          name: this.name,
          email: this.email,
          password: this.password,
          profile: this.profile ? { create: this.profile } : undefined,
        },
      });
      this.id = newUser.id;
      return newUser;
    } catch (error) {
      throw new Error(`Gagal mendaftarkan user: ${error.message}`);
    }
  }


  async getAllUsers() {
    try {
      const users = await prisma.user.findMany({
        include: { profile: true },
      });
      return users;
    } catch (error) {
      throw new Error(`Gagal menampilkan user: ${error.message}`);
    }
  }


  async findUserById(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
        include: { profile: true },
      });
      return user;
    } catch (error) {
      throw new Error(`User tidak ditemukan: ${error.message}`);
    }
  }
}

module.exports = User;
