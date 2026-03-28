// FIX: Use path.join for correct .env resolution regardless of where script is run from
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');

// FIX: Use the real models (not inline re-definitions) so pre-save hooks run correctly
// The Citizen model has a pre('save') hook that hashes passwords automatically
const Citizen = require('../models/Citizen');
const Scheme = require('../models/Scheme');
const Fund = require('../models/Fund');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/airgss';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB:', MONGO_URI);

  // Clear existing seed data
  await Scheme.deleteMany({});
  await Fund.deleteMany({});
  await Citizen.deleteMany({
    email: { $in: ['admin@airgss.gov', 'officer@airgss.gov', 'citizen@test.com'] }
  });

  // Seed Schemes
  await Scheme.insertMany([
    {
      name: 'PM Awas Yojana',
      description: 'Housing for all rural poor families. Provides financial assistance to build a pucca house.',
      ministry: 'Ministry of Housing & Urban Affairs',
      benefits: ['Rs 2.5 lakh grant', 'Subsidized home loan', 'Land allocation support'],
      eligibilityRules: { maxIncome: 300000, gender: 'all' },
      documents: ['Aadhar Card', 'Income Certificate', 'Land Documents'],
      isActive: true
    },
    {
      name: 'PM Kisan Samman Nidhi',
      description: 'Income support of Rs 6000 per year for small and marginal farmers.',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      benefits: ['Rs 6000 per year', 'Direct bank transfer in 3 instalments', 'Farmer insurance coverage'],
      eligibilityRules: { maxIncome: 200000, occupation: ['farmer'] },
      documents: ['Aadhar Card', 'Land Records', 'Bank Account Details'],
      isActive: true
    },
    {
      name: 'Ayushman Bharat PMJAY',
      description: 'World\'s largest health insurance scheme providing Rs 5 lakh coverage per family per year.',
      ministry: 'Ministry of Health & Family Welfare',
      benefits: ['Rs 5 lakh annual health coverage', 'Cashless treatment at empanelled hospitals', 'Pre and post hospitalisation cover'],
      eligibilityRules: { maxIncome: 250000 },
      documents: ['Aadhar Card', 'Ration Card', 'Income Certificate'],
      isActive: true
    },
    {
      name: 'MGNREGA',
      description: 'Mahatma Gandhi National Rural Employment Guarantee Act — 100 days of wage employment guarantee.',
      ministry: 'Ministry of Rural Development',
      benefits: ['100 days of guaranteed work per year', 'Minimum wage payment', 'Work within 5km of residence'],
      eligibilityRules: { minAge: 18, maxAge: 60 },
      documents: ['Aadhar Card', 'Job Card', 'Bank Account'],
      isActive: true
    },
    {
      name: 'Ujjwala Yojana 2.0',
      description: 'Free LPG connection to BPL women households to replace polluting cooking fuels.',
      ministry: 'Ministry of Petroleum & Natural Gas',
      benefits: ['Free LPG connection', 'First refill cylinder free', 'Safety equipment included'],
      eligibilityRules: { maxIncome: 200000, gender: 'female' },
      documents: ['Aadhar Card', 'BPL Ration Card', 'Bank Account'],
      isActive: true
    },
    {
      name: 'PM Jan Dhan Yojana',
      description: 'Financial inclusion program ensuring access to banking, savings, insurance and pension.',
      ministry: 'Ministry of Finance',
      benefits: ['Zero balance savings account', 'RuPay debit card', 'Rs 1 lakh accident insurance', 'Rs 30,000 life insurance'],
      eligibilityRules: {},
      documents: ['Aadhar Card', 'Passport Photo'],
      isActive: true
    },
    {
      name: 'Sukanya Samriddhi Yojana',
      description: 'Savings scheme for girl child providing high interest rate and tax benefits.',
      ministry: 'Ministry of Finance',
      benefits: ['High interest rate (8.2%)', 'Tax exemption under 80C', 'Maturity at age 21'],
      eligibilityRules: { maxAge: 10, gender: 'female' },
      documents: ['Birth Certificate', 'Aadhar Card', 'Guardian ID Proof'],
      isActive: true
    },
    {
      name: 'National Scholarship Portal',
      description: 'Scholarships for meritorious students from economically weaker sections.',
      ministry: 'Ministry of Education',
      benefits: ['Rs 10,000 to Rs 50,000 per year', 'Covers tuition and living expenses', 'Renewable annually'],
      eligibilityRules: { maxIncome: 250000, maxAge: 30 },
      documents: ['Marksheets', 'Income Certificate', 'Aadhar Card', 'Bank Account'],
      isActive: true
    }
  ]);
  console.log('✅ Schemes seeded (8 schemes)');

  // Seed Funds
  await Fund.insertMany([
    {
      projectName: 'Village Road Expansion',
      description: 'Widening and resurfacing of main village roads — 4.5 km stretch',
      budget: 5000000,
      spentAmount: 2100000,
      status: 'ongoing',
      category: 'Infrastructure',
      location: 'Main Road, Ward 1-3'
    },
    {
      projectName: 'Drinking Water Pipeline',
      description: 'New clean water pipeline connecting all 5 wards',
      budget: 3000000,
      spentAmount: 3000000,
      status: 'completed',
      category: 'Water Supply',
      location: 'Ward 1-5'
    },
    {
      projectName: 'Community Health Centre',
      description: 'New Primary Health Centre building with OPD and maternity ward',
      budget: 8000000,
      spentAmount: 1500000,
      status: 'ongoing',
      category: 'Health',
      location: 'Central Village Square'
    },
    {
      projectName: 'Solar Street Lights',
      description: 'Installation of 50 solar-powered street lights across all wards',
      budget: 1500000,
      spentAmount: 0,
      status: 'planned',
      category: 'Electricity',
      location: 'All Wards'
    },
    {
      projectName: 'Anganwadi Renovation',
      description: 'Renovation and modernization of 3 Anganwadi centers',
      budget: 2500000,
      spentAmount: 800000,
      status: 'ongoing',
      category: 'Education',
      location: 'Ward 2, 3, 4'
    }
  ]);
  console.log('✅ Funds seeded (5 projects)');

  // FIX: Use plain passwords — the Citizen model's pre('save') hook hashes them automatically
  // Old code used bcrypt.hash() THEN the model hashed AGAIN = double hashing = login always failed
  await Citizen.create([
    {
      name: 'Admin User',
      email: 'admin@airgss.gov',
      password: 'password123',   // Model pre-save hook will hash this
      phone: '9000000001',
      role: 'admin',
      isActive: true,
      isVerified: true
    },
    {
      name: 'Panchayat Officer',
      email: 'officer@airgss.gov',
      password: 'password123',
      phone: '9000000002',
      role: 'officer',
      department: 'Public Works Department',
      isActive: true,
      isVerified: true
    },
    {
      name: 'Ram Prasad',
      email: 'citizen@test.com',
      password: 'password123',
      phone: '9000000003',
      role: 'citizen',
      age: 35,
      gender: 'male',
      income: 180000,
      occupation: 'farmer',
      address: 'House No. 12, Gali No. 3, Rampur Village',
      village: 'Rampur',
      district: 'Lucknow',
      state: 'Uttar Pradesh',
      familySize: 5,
      isActive: true,
      isVerified: true
    }
  ]);

  console.log('\n✅ Demo users seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Admin   : admin@airgss.gov   / password123');
  console.log('  Officer : officer@airgss.gov / password123');
  console.log('  Citizen : citizen@test.com   / password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
  console.log('✅ Seeding complete. Database ready.');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
