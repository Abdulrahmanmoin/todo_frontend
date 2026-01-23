const { execSync } = require('child_process');
try {
  console.log('Installing @radix-ui/react-scroll-area...');
  execSync('npm install @radix-ui/react-scroll-area', { stdio: 'inherit' });
  console.log('Installation successful.');
} catch (error) {
  console.error('Installation failed:', error.message);
}
