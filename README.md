# Basic Banking System
Hai! Projek ini merupakan sebuah banking system API sederhana (sangat-sangat sederhana) yang mengimplementasikan:
- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web framework for Node.js.
- **Prisma**: ORM for database management with PostgreSQL.
- **PostgreSQL**: Relational database used for storing user, account, profile, and transaction data.
- **Joi**: Input validation for incoming data.
## Prerequisites
- **Node.js** yang sudah terinstall
- **PostgreSQL** yang terinstall pada pc dan pastikan sedang berjalan

## Steps to Run Locally

1. **Clone repository ini**:
    ```bash
     git clone https://github.com/yourusername/your-repo.git
     cd your-repo
    ```
3. **Install seluruh package yang diperlukan**:
   ```bash
     npm install express prisma @prisma/client joi ejs
   ```
4. **Config Database**:
    - Buat database pada pgAdmin
    - Salin file .env.sample menjadi .env dan sesuaikan isi DATABASE_URL dengan pengaturan database yang telah dibuat
    - Jalankan migrasi Prisma
      ```bash
        npx prisma migrate dev
      ```
5. **Jalankan server**:
   ```bash
     node index.js
   ```
6. **Akses API**:
   ```bash
     (http://localhost:3000)
   ```
      
       
