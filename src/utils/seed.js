require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const User = require('../models/User');
const Policy = require('../models/Policy');
const connectDB = require('../config/db');

const providers = [
  'Star Health', 'ICICI Lombard', 'HDFC Ergo', 'Care Health', 
  'Niva Bupa', 'Tata AIG', 'Reliance General', 'Bajaj Allianz', 
  'SBI General', 'Aditya Birla Health'
];

const statuses = ['Active', 'Expired', 'Suspended'];
const planTypes = ['Basic', 'Standard', 'Premium', 'Family Floater'];

const generatePolicies = (count) => {
  const policies = [];
  for (let i = 0; i < count; i++) {
    const provider = faker.helpers.arrayElement(providers);
    const coverageStatus = faker.helpers.arrayElement(statuses);
    const planType = faker.helpers.arrayElement(planTypes);
    const approvedClaimLimit = faker.number.int({ min: 100000, max: 2000000 });
    const availableBalance = faker.number.int({ min: 0, max: approvedClaimLimit });
    
    let policyStartDate, policyExpiryDate;
    
    if (coverageStatus === 'Expired') {
      policyStartDate = faker.date.past({ years: 3 });
      policyExpiryDate = faker.date.past({ years: 1 });
    } else {
      policyStartDate = faker.date.past({ years: 1 });
      policyExpiryDate = faker.date.future({ years: 2 });
    }

    policies.push({
      policyNumber: `POL${100000 + i}`,
      policyHolderName: faker.person.fullName(),
      provider,
      coverageStatus,
      approvedClaimLimit,
      availableBalance,
      planType,
      policyStartDate,
      policyExpiryDate,
      city: faker.location.city(),
      state: faker.location.state(),
      country: 'India',
      email: faker.internet.email(),
      phoneNumber: faker.phone.number(),
    });
  }
  return policies;
};

const seedDB = async () => {
  try {
    console.log('Clearing database...');
    await User.deleteMany();
    await Policy.deleteMany();

    console.log('Creating Admin User...');
    const user = await User.create({
      username: 'salesforce_agent',
      password: 'sfdcpassword123',
      role: 'admin'
    });
    console.log('Admin user created: salesforce_agent / sfdcpassword123');

    console.log('Generating policies...');
    const policies = generatePolicies(1111);
    
    await Policy.insertMany(policies);
    console.log(`Successfully seeded ${policies.length} policies.`);

    return { success: true, message: `Successfully seeded ${policies.length} policies.` };
  } catch (error) {
    console.error('Error with seed data:', error);
    throw error;
  }
};

if (require.main === module) {
  connectDB().then(() => {
    seedDB().then(() => process.exit(0)).catch(() => process.exit(1));
  });
}

module.exports = { seedDB };
