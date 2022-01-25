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
  const a = childProcess.execSync(`npm version ${versionType}`).toString();

  console.log('a', a);
  fse.appendFileSync('CHANGELOG.md',
   `### ${a} \n
   ${commit} \n`);
  // childProcess.execSync('npm publish');
})();