const childProcess = require('child_process');
const fse = require('fs-extra'); 
const inquirer = require('inquirer'); // 命令行交互

(async () => {
  // 检验work tree 是否有改动
  const changedFileNameStr = childProcess.execSync('git status -s', { encoding: 'utf8' });
  if (changedFileNameStr) {
    console.log('ERR：存在未提交内容');
    process.exit();
  }
  // 查看最后一个commit 内容，更新到 changelog，升级version
  const commit = childProcess.execSync("git log -1 --pretty='%s'").toString();
  const { versionType } = await inquirer.prompt([
    {
      type: "list",
      name: "versionType",
      message: "plz choose type: major.minor.patch",
      choices: ["major", "minor", "patch"],
      default: "patch"
    }
  ]);
  const versionNumber = childProcess.execSync(`npm version ${versionType}`).toString();
  const branch = childProcess.execSync('git symbolic-ref --short -q HEAD').toString();

  fse.appendFileSync('CHANGELOG.md',
   `### ${versionNumber} \n
   ${commit} \n`);
   childProcess.execSync('git add .');

   childProcess.execSync('git commit -m --amend');
   childProcess.execSync(`git push origin ${branch}`);

  // childProcess.execSync('npm publish');
})();