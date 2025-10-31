const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'HRM Location Backend',
    version: '1.0.0',
    description: 'HRM API for location-based attendance'
  },
  servers: [
    { url: process.env.BASE_URL || 'http://localhost:5000' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    },
    schemas: {
      UserRegister: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          password: { type: 'string' },
          role: { type: 'string', enum: ['admin','employee'] }
        },
        required: ['name','email','password']
      },
      Login: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          password: { type: 'string' }
        },
        required: ['email','password']
      },
      TokenResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' }
        }
      },
      OfficeLocation: {
        type: 'object',
        properties: {
          latitude: { type: 'number' },
          longitude: { type: 'number' },
          radius: { type: 'number', description: 'meters' }
        },
        required: ['latitude','longitude','radius']
      },
      AttendanceCheck: {
        type: 'object',
        properties: {
          lat: { type: 'number' },
          lng: { type: 'number' }
        },
        required: ['lat','lng']
      },
      EmployeeCreate: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          password: { type: 'string' },
          phone: { type: 'string' },
          designation: { type: 'string' },
          department: { type: 'string' },
          dateOfJoining: { type: 'string', format: 'date' }
        },
        required: ['name','email','password']
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user (admin or employee)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UserRegister' } } }
        },
        responses: { '201': { description: 'User created' } }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Login' } } }
        },
        responses: { '200': { description: 'Success' } }
      }
    },

    '/api/employees': {
      post: {
        tags: ['Employees'],
        summary: 'Create employee (admin only)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/EmployeeCreate' } } } },
        responses: { '201': { description: 'Employee created' } }
      },
      get: {
        tags: ['Employees'],
        summary: 'List employees (admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'q', in: 'query', schema: { type: 'string' } },
          { name: 'department', in: 'query', schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'Paginated list' } }
      }
    },

    '/api/employees/me': {
      get: {
        tags: ['Employees'],
        summary: 'Get current authenticated user (both roles)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Profile returned' } }
      }
    },

    '/api/employees/{id}': {
      get: {
        tags: ['Employees'],
        summary: 'Get employee by id (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Employee' }, '404': { description: 'Not found' } }
      },
      put: {
        tags: ['Employees'],
        summary: 'Update employee (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { '200': { description: 'Updated' } }
      },
      delete: {
        tags: ['Employees'],
        summary: 'Delete employee (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Deleted' } }
      }
    },

    '/api/employees/office': {
      post: {
        tags: ['Employees'],
        summary: 'Set office location (admin only)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/OfficeLocation' } } } },
        responses: { '200': { description: 'Office saved' } }
      },
      get: {
        tags: ['Employees'],
        summary: 'Get office location (admin only)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Office location' } }
      }
    },

    '/api/attendance/checkin': {
      post: {
        tags: ['Attendance'],
        summary: 'Employee check-in with location',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AttendanceCheck' } } } },
        responses: { '200': { description: 'Checked in' } }
      }
    },
    '/api/attendance/checkout': {
      post: {
        tags: ['Attendance'],
        summary: 'Employee check-out with location',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AttendanceCheck' } } } },
        responses: { '200': { description: 'Checked out' } }
      }
    },

    '/api/attendance/me': {
      get: {
        tags: ['Attendance'],
        summary: "Get authenticated user's attendance history (paginated)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'from', in: 'query', schema: { type: 'string' } },
          { name: 'to', in: 'query', schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'Attendance history' } }
      }
    }
  }
};

module.exports = swaggerSpec;
