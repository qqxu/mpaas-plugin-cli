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
  const { versionType } = await inquirer.prompt([
    {
      type: "list",
      name: "versionType",
      message: "plz choose type: major.minor.patch",
      choices: ["major", "minor", "patch"],
      default: "patch"
    }
  ]);
  // 查看最后一个commit 内容
  const commit = childProcess.execSync("git log -1 --pretty='%s'").toString();
  // 自动升级版本号
  const versionNumber = childProcess.execSync(`npm version ${versionType}`).toString();

  // 将升级后的版本号及commit内容 追加 写入 CHANGELOG.md
  fse.appendFileSync('CHANGELOG.md',
   `### ${versionNumber} \n
   ${commit} \n`);
   
  // 将更新的CHANGELOG.md 推送到远端
  childProcess.execSync('git add .');
  const branch = childProcess.execSync('git symbolic-ref --short -q HEAD').toString();
  childProcess.execSync("git commit -m 'refactor: update CHANGELOG.md'");
  childProcess.execSync(`git push origin ${branch}`);

  childProcess.execSync('npm publish');
})();