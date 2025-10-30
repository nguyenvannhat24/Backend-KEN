// tests/setup.js - Jest setup file
const path = require('path');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3006';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing_only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DB_CONNECTION_STRING = 'mongodb+srv://phamdobanvia24h_db_user:aLJVXtyle8NV3Lai@cluster0.eufiomf.mongodb.net/KEN?retryWrites=true&w=majority&appName=Cluster0';
process.env.DB_NAME = 'KEN';
process.env.KEYCLOAK_BASE_URL = 'http://localhost:9090/auth';
process.env.KEYCLOAK_REALM = 'testrealm';
process.env.KEYCLOAK_RESOURCE = 'test-app';
process.env.KEYCLOAK_PUBLIC_CLIENT = 'true';
process.env.KEYCLOAK_CONFIDENTIAL_PORT = '0';
process.env.KEYCLOAK_SSL_REQUIRED = 'external';
process.env.CORS_ORIGIN = 'http://localhost:3001';

// Load dotenv for test environment
require('dotenv').config({ path: path.resolve(__dirname, '../env.test') });

// Global test setup
beforeAll(() => {
  console.log('🧪 Setting up test environment...');
});

afterAll(() => {
  console.log('🧹 Cleaning up test environment...');
});

// Suppress console.log during tests (optional)
if (process.env.SUPPRESS_CONSOLE === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}
