/*
Summary:
Script to bump the package version.

Workflow:
1. Create new branch 'bump/${version}'
2. Bump version on package.json
3. Bump version on require.js
4. Commit and push branch to GitHub
5. Create pull request in Github
*/

const path = require("path");
const fs = require("fs");
const execSync = require("child_process").execSync;

function exec(cmd) {
    execSync(cmd, { stdio: "inherit", env: process.env });
}

function execAndOutput(cmd) {
    return execSync(cmd, { env: process.env }).toString();
}
exec('cd ..');
exec('git pull');
exec(`npm version prerelease --preid=outsystems --no-git-tag-version`);

const cwd = process.cwd();
const currentBranch = execAndOutput('git branch --no-color --show-current').replace(/[\r\n]+/, "");

const newVersionNumber = require('./package.json').version;

const filesToChangeVersion = ["require.js"];
filesToChangeVersion.forEach(file => {
    const filePath = path.resolve(__dirname, `./${file}`);

    const data = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' }); 

    const result = data.replace(
        /version = '.*',/g,
        `version = '${newVersionNumber}',`
    );

    fs.writeFileSync(filePath, result, { encoding: "utf8"}); 
});

const newBranch = `bump/${releaseType}-${newVersionNumber}`;
exec(`git checkout -b ${newBranch}`);
exec('git add -u');
exec(`git commit -m "Bump version to ${newVersionNumber}"`);
exec(`git push -u origin ${newBranch}`);
exec(`gh pr create --title "Bump version to ${newVersionNumber}" --body "Bump package version to ${newVersionNumber}" --base ${currentBranch}`);

process.chdir(cwd);
