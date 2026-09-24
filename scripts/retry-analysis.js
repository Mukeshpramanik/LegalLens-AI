const { execSync } = require('child_process');

console.log('Running analysis test with retries...');
let success = false;
for (let i = 0; i < 5; i++) {
  try {
    console.log(`\nAttempt ${i + 1}...`);
    const output = execSync('node scripts/diagnose-real-analysis.js', { encoding: 'utf8' });
    console.log(output);
    if (output.includes('Firestore Save Succeeded!')) {
      success = true;
      break;
    }
  } catch (err) {
    console.log(err.stdout);
    console.error(err.message);
  }
}
if (!success) {
  console.log('All attempts failed due to 503 / unexpected errors.');
} else {
  console.log('Successfully completed end-to-end analysis!');
}
