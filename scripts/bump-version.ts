import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const packageJsonPath = path.resolve(__dirname, '../package.json');
const appJsonPath = path.resolve(__dirname, '../app.json');

// Read files
const packageJson = require(packageJsonPath);
const appJson = require(appJsonPath);

function getCommitMessages(): string[] {
    try {
        // Get messages since the last tag, or last 10 commits if no tags
        // This is a simplified approach. Ideally, find the last tag corresponding to a version.
        const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null').toString().trim();
        const range = lastTag ? `${lastTag}..HEAD` : 'HEAD~10..HEAD';
        const logs = execSync(`git log ${range} --pretty=format:%s`).toString().trim();
        return logs.split('\n');
    } catch (e) {
        console.warn('Could not fetch git history, defaulting to no messages.');
        return [];
    }
}

function determineBumpType(messages: string[]): 'major' | 'minor' | 'patch' | null {
    let type: 'major' | 'minor' | 'patch' | null = null;

    for (const msg of messages) {
        if (msg.includes('BREAKING CHANGE') || msg.includes('!:')) {
            return 'major';
        }
        if (msg.startsWith('feat')) {
            type = 'minor';
        }
        if (!type && (msg.startsWith('fix') || msg.startsWith('perf'))) {
            type = 'patch';
        }
    }
    return type;
}

// CLI Args
const arg = process.argv[2];
let releaseType = arg;

if (arg === '--auto') {
    console.log('Analyzing commit messages for version bump...');
    const messages = getCommitMessages();
    const detectedType = determineBumpType(messages);

    if (!detectedType) {
        console.log('No significant changes detected (feat/fix/BREAKING CHANGE). Skipping bump.');
        process.exit(0);
    }
    console.log(`Detected release type: ${detectedType}`);
    releaseType = detectedType;
}

const validTypes = ['major', 'minor', 'patch'];
if (!validTypes.includes(releaseType)) {
    console.error(`Invalid release type: ${releaseType}. Usage: ts-node scripts/bump-version.ts <major|minor|patch|--auto>`);
    process.exit(1);
}

// Parse current version
let [major, minor, patch] = packageJson.version.split('.').map(Number);

// Increment version
switch (releaseType) {
    case 'major':
        major++;
        minor = 0;
        patch = 0;
        break;
    case 'minor':
        minor++;
        patch = 0;
        break;
    case 'patch':
        patch++;
        break;
}

const newVersion = `${major}.${minor}.${patch}`;

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log(`Updated package.json version to ${newVersion}`);

// Update app.json
if (appJson.expo) {
    appJson.expo.version = newVersion;

    // Update Android versionCode
    if (appJson.expo.android && appJson.expo.android.versionCode) {
        appJson.expo.android.versionCode += 1;
        console.log(`Updated Android versionCode to ${appJson.expo.android.versionCode}`);
    }

    // Update iOS buildNumber
    if (appJson.expo.ios && appJson.expo.ios.buildNumber) {
        const currentBuildNumber = parseInt(appJson.expo.ios.buildNumber, 10) || 0;
        appJson.expo.ios.buildNumber = (currentBuildNumber + 1).toString();
        console.log(`Updated iOS buildNumber to ${appJson.expo.ios.buildNumber}`);
    }
}

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
console.log(`Updated app.json version to ${newVersion}`);

// Ask GitHub Action to output the new version via standard output for referencing in other steps
console.log(`::set-output name=new_version::${newVersion}`);
