const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes.js');
const employeeRoutes = require('./routes/employee.routes.js');
const attendanceRoutes = require('./routes/attendance.routes.js');
const adminRoutes = require('./routes/admin.routes.js');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger.js');

const { errorHandler } = require('./middlewares/error.middleware.js');

const app = express();
app.use(helmet());
app.use(cors( {origin: '*'} ));
app.use(express.json());
app.use(morgan('dev'));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);

// swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// root
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'HRM Location Backend API' });
});

// error handler

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log('Server started on port', PORT));
  })
  .catch(err => {
    console.error('Mongo connection error', err);
    process.exit(1);
  });
