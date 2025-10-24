# HRM Location-Based Attendance Backend

**Tech Stack:** Node.js, Express.js, MongoDB, JWT Authentication, Swagger UI  

---

## Installation

Clone the repository:
```bash
git clone https://github.com/muthassir/hrm.git
cd hrm
npm install
npm install express mongoose cors dotenv joi bcrypt express-validator helmet json2csv jsonwebtoken swagger-jsdoc morgan swagger-ui-express yamljs
```
## .env
PORT=5000
MONGO_URI=<Your MongoDB URI>
JWT_ACCESS_SECRET=<RandomString>
JWT_REFRESH_SECRET=<RandomString>
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
SALT_ROUNDS=10
NODE_ENV=production
BASE_URL=http://localhost:5000

## Swagger ui
http://localhost:5000/api-docs


