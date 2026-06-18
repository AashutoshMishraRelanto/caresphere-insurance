const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');
const Policy = require('../src/models/Policy');

let mongoServer;
let token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(uri);

  // Seed Admin
  const user = await User.create({
    username: 'test_agent',
    password: 'password123'
  });

  // Seed Policy
  await Policy.create({
    policyNumber: 'POL999',
    policyHolderName: 'Jane Doe',
    provider: 'Star Health',
    coverageStatus: 'Active',
    approvedClaimLimit: 500000,
    availableBalance: 450000,
    planType: 'Premium',
    policyStartDate: new Date('2025-01-01'),
    policyExpiryDate: new Date('2027-12-31'),
    city: 'New York',
    state: 'NY',
    country: 'USA',
    email: 'jane@example.com',
    phoneNumber: '1234567890'
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Insurance API Tests', () => {
  
  it('1. should login and return JWT token', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      username: 'test_agent',
      password: 'password123'
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token; // save token for next tests
  });

  it('2. should verify policy correctly', async () => {
    const res = await request(app)
      .post('/api/v1/insurance/verify')
      .set('Authorization', `Bearer ${token}`)
      .send({ policyNumber: 'POL999' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.policyNumber).toBe('POL999');
    expect(res.body.coverageStatus).toBe('Active');
    expect(res.body.approvedClaimLimit).toBe(500000);
  });

  it('3. should retrieve policy details', async () => {
    const res = await request(app)
      .get('/api/v1/insurance/policy/POL999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.policyNumber).toBe('POL999');
    expect(res.body.provider).toBe('Star Health');
  });

  it('4. should get provider statistics', async () => {
    const res = await request(app)
      .get('/api/v1/providers/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.totalPolicies).toBe(1);
    expect(res.body.averageClaimLimit).toBe(500000);
  });

});
