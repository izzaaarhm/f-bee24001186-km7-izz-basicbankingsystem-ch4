const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class User {
  constructor(name = null, email = null, password = null, profile = null) {
    this.id = null;
    this.name = name;
    this.email = email;
    this.password = password;
    this.profile = profile;
  }
  
  async findUserByEmail(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email },
      });
      return user;
    } catch (error) {
      throw new Error(`Gagal menemukan user dengan email: ${error.message}`);
    }
  }

  async register() {
    try {
      const hashedPassword = await bcrypt.hash(this.password, 10);
      const newUser = await prisma.user.create({
        data: {
          name: this.name,
          email: this.email,
          password: hashedPassword,
          profile: this.profile ? { create: this.profile } : undefined,
        },
      });
      this.id = newUser.id;
      return newUser;
    } catch (error) {
      throw new Error(`Gagal mendaftarkan user: ${error.message}`);
    }
  }

  
  async login(email, password) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new Error('Email atau password salah');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Email atau password salah');
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return { token, userId: user.id };
    } 
    catch (error) {
      throw new Error(`Login gagal: ${error.message}`);
    }
  }

  async forgotPassword(email) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
  
      if (!user) {
        throw new Error('Email tidak terdaftar');
      }
  
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
  
      const { sendEmail } = require('./email_service');
      await sendEmail(
        email,
        'Reset Password',
        `<h3>Klik link berikut untuk mereset password Anda: </h3>
        <a href="${resetLink}">${resetLink}</a>`
      );
  
      return { message: 'Link untuk reset password telah dikirim ke email Anda' };
    } catch (error) {
      throw new Error(`Gagal memproses permintaan lupa password: ${error.message}`);
    }
  }
  
  async resetPassword(token, newPassword) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      await prisma.user.update({
        where: { id: decoded.id },
        data: { password: hashedPassword },
      });
  
      return { message: 'Password berhasil direset' };
    } catch (error) {
      throw new Error(`Gagal mereset password: ${error.message}`);
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
