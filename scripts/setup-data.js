const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DATA_DIR = path.join(__dirname, '..', 'data');
const dirs = ['holdings', 'cache/quotes', 'cache/search', 'benchmark', 'audit'];

// Create directories
for (const dir of dirs) {
  const fullPath = path.join(DATA_DIR, dir);
  fs.mkdirSync(fullPath, { recursive: true });
  console.log(`Created ${fullPath}`);
}

// Create default settings if not exists
const settingsPath = path.join(DATA_DIR, 'settings.json');
if (!fs.existsSync(settingsPath)) {
  // Generate password hash for default password
  let passwordHash = '';
  try {
    const result = execSync(
      `node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(h => process.stdout.write(h));"`,
      { encoding: 'utf-8', cwd: path.join(__dirname, '..', 'server') }
    );
    passwordHash = result;
  } catch {
    console.log('Warning: Could not hash password. Install server dependencies first.');
    console.log('Run: cd server && npm install');
    passwordHash = '';
  }

  const settings = {
    portfolio: {
      title: 'My Portfolio',
      subtitle: 'Personal Investment Portfolio',
      description: 'A long-term growth-oriented investment portfolio.',
      disclaimer: 'This portfolio page is for informational purposes only. It does not constitute investment advice.'
    },
    benchmark: {
      symbol: 'SPY',
      name: 'S&P 500 (SPY)'
    },
    publicPage: {
      isPublished: false,
      slug: 'portfolio',
      seoTitle: 'Portfolio',
      seoDescription: 'View my investment portfolio performance and allocation.'
    },
    auth: {
      username: 'admin',
      passwordHash: passwordHash
    },
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  console.log(`Created ${settingsPath}`);
  if (passwordHash) {
    console.log('Default admin credentials: admin / admin123');
    console.log('Change the password after first login!');
  }
} else {
  console.log('Settings already exist, skipping.');
}

console.log('\nData directory setup complete.');
