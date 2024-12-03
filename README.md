# Basic Banking System
Hai! Projek ini merupakan sebuah banking system API sederhana (sangat-sangat sederhana) yang mengimplementasikan:
- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web framework for Node.js.
- **Prisma**: ORM for database management with PostgreSQL.
- **PostgreSQL**: Relational database used for storing user, account, profile, and transaction data.
- **Joi**: Input validation for incoming data.
- **JWT**: A Json Web Token to implement authentication.
- **Jest**: Unit Testing
-**Swagger-jsdoc**: to make a generated API Documentation^^

## Prerequisites
- **Node.js**
- **PostgreSQL** (make sure it's running on your pc)
- **Prisma**
- **Joi**

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
5. **Config JWT**:
    - gunakan JWT_SECRET dari .env.sample, salin ke file .env Anda, Anda dapat mengubah nilainya.
      
6. **Jalankan server**:
   ```bash
     npm run start
     npm run test (untuk menjalankan testing dgn jest)
   ```
   
## API Documentation
Dalam membuat dokumentasi API, project ini mengimplementasikan Swagger. Setelah server berjalan, dokumentasi dapat diakses di link yang tersedia atau melalui link berikut:
```bash
    https://agile-binder-441009-r1.et.r.appspot.com/api-docs/
```
       
