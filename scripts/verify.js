const fs = require('fs');
const path = require('path');

console.log('🔍 Starting LegalLens-AI Verification...');

let hasErrors = false;

function check(message, condition, warnOnly = false) {
  if (condition) {
    console.log(`✅ ${message}`);
  } else {
    if (warnOnly) {
      console.log(`⚠️  ${message} (Optional / Missing locally)`);
    } else {
      console.log(`❌ ${message}`);
      hasErrors = true;
    }
  }
}

// 1. Environment checks
const envPath = path.join(__dirname, '..', '.env');
const envExists = fs.existsSync(envPath);
check('Environment file (.env) exists', envExists);

if (envExists) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  check('.env contains AI_PROVIDER configuration', envContent.includes('AI_PROVIDER'), true);
  check('.env contains FIREBASE_PROJECT_ID', envContent.includes('FIREBASE_PROJECT_ID'), true);

  if (envContent.includes('AI_PROVIDER=google-gemini-api') || !envContent.includes('AI_PROVIDER')) {
    check('.env contains GEMINI_API_KEY (Required locally for Gemini API)', envContent.includes('GEMINI_API_KEY'), true);
  }
}

// 2. Gitignore check
const gitignorePath = path.join(__dirname, '..', '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  check('.gitignore includes .env', gitignoreContent.includes('.env'));
} else {
  check('.gitignore exists', false);
}

// 3. Firebase config
check('firestore.indexes.json exists', fs.existsSync(path.join(__dirname, '..', 'firestore.indexes.json')));
check('firebase.json exists', fs.existsSync(path.join(__dirname, '..', 'firebase.json')));

if (hasErrors) {
  console.error('\n❌ Verification failed. Please fix the mandatory errors above.');
  process.exit(1);
} else {
  console.log('\n✨ Configuration verification passed successfully! Proceeding to build check...');
}
