const validateEnv = () => {
  const missing = [];
  const requiredVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'PORT'
  ];

  requiredVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  });

  if (missing.length > 0) {
    console.error(`\n❌ FATAL ERROR: Missing required environment variables:\n -> ${missing.join('\n -> ')}\n`);
    process.exit(1);
  }

  console.log('✅ Environment variables validated successfully.');
};

module.exports = validateEnv;
