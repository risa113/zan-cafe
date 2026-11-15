const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const apiDir = path.join(rootDir, 'src', 'app', 'api');
const apiBackupDir = path.join(rootDir, '.api_backup_gh_pages');
const publicDir = path.join(rootDir, 'public');
const publicNoJekyll = path.join(publicDir, '.nojekyll');
const outDir = path.join(rootDir, 'out');
const outNoJekyll = path.join(outDir, '.nojekyll');

console.log('🚀 Starting GitHub Pages static export build for Zan Cafe...');

// 1. Ensure public/.nojekyll exists
try {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(publicNoJekyll, '', 'utf8');
  console.log('✓ Ensured public/.nojekyll exists');
} catch (e) {
  console.warn('Could not write public/.nojekyll:', e.message);
}

let apiBackedUp = false;

try {
  // 2. Temporarily park API route handlers so Next.js static exporter compiles purely static pages
  if (fs.existsSync(apiDir) && fs.readdirSync(apiDir).length > 0) {
    console.log('📦 Parking backend API route handlers in .api_backup_gh_pages...');
    if (fs.existsSync(apiBackupDir)) {
      fs.rmSync(apiBackupDir, { recursive: true, force: true });
    }
    fs.mkdirSync(apiBackupDir, { recursive: true });
    fs.cpSync(apiDir, apiBackupDir, { recursive: true });

    // Empty src/app/api without deleting the directory itself
    const items = fs.readdirSync(apiDir);
    for (const item of items) {
      fs.rmSync(path.join(apiDir, item), { recursive: true, force: true });
    }
    apiBackedUp = true;
    console.log('✓ Backend API routes parked cleanly');
  }

  // 3. Run Next.js static export build
  console.log('🔨 Executing Next.js export build (GITHUB_PAGES=true)...');
  execSync('npx next build', {
    cwd: rootDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      GITHUB_PAGES: 'true',
    },
  });

  console.log('✨ Next.js build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exitCode = 1;
} finally {
  // 4. Guarantee restoring API route handlers
  if (apiBackedUp && fs.existsSync(apiBackupDir)) {
    console.log('🔄 Restoring backend API route handlers to src/app/api...');
    fs.cpSync(apiBackupDir, apiDir, { recursive: true });
    fs.rmSync(apiBackupDir, { recursive: true, force: true });
    console.log('✓ API route handlers restored successfully to pristine state');
  }
}

// 5. Post-build tasks for GitHub Pages
if (process.exitCode !== 1 && fs.existsSync(outDir)) {
  try {
    fs.writeFileSync(outNoJekyll, '', 'utf8');
    console.log('✓ Created out/.nojekyll');

    // Create 404.html from index.html if needed for client-side routing on GitHub Pages
    const outIndex = path.join(outDir, 'index.html');
    const out404 = path.join(outDir, '404.html');
    if (fs.existsSync(outIndex) && !fs.existsSync(out404)) {
      fs.copyFileSync(outIndex, out404);
      console.log('✓ Generated out/404.html for SPA fallback on GitHub Pages');
    }
    console.log('🎉 GitHub Pages bundle is ready in "out/" directory!');
  } catch (err) {
    console.warn('Post-build warning:', err.message);
  }
}
