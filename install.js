const { execSync } = require('child_process');
try {
  console.log('Installing @openai/chatkit-react and @radix-ui/react-scroll-area...');
  execSync('npm install @openai/chatkit-react @radix-ui/react-scroll-area', { stdio: 'inherit' });
  console.log('Installation successful.');
} catch (error) {
  console.error('Installation failed:', error.message);
}
