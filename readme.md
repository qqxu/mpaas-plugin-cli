###

## 安装


## 调试
当前 mpaas-cli-plign 项目 A
```
npm i 

npm link
```

在B项目 

```
npm link [A]
mpaas -V // 显示版本

mpaas zip // 打包
```



## 使用
B项目 package.json

```
script: {
  "ziptest": "mpaas -V"
},
devDependencies: {
  "@ether/mpaas-plugin-cli": "0.0.4"
}

```

## 生成json文件
生成包含空格的json文件

```
  const dataObj = {
    a: '1',
    b: 2,
  };
  const dataStr = JSON.stringify(dataObj, null, 2);
  fse.writeFileSync('config.json', dataStr);
```

## 获取git提交信息

```
  const childProcess = require('child_process');

   // last commit id
  const commit = childProcess.execSync('git rev-parse --short HEAD').toString();
  // 分支
  const branch = childProcess.execSync('git symbolic-ref --short -q HEAD').toString();
  // 格式化当前时间
  const time = childProcess.execSync('date "+%Y-%m-%d %H:%M"').toString();
  const gitStatus = childProcess.execSync('git status').toString();

```

## 发布检验
- 发布之前检验当前工作区 work tree
- 命令行用户交互更新package.json version
- 将最后一个commit 做为 changelog

```
 const changedFileNameStr = childProcess.execSync('git status -s', { encoding: 'utf8' });
  if (changedFileNameStr) {
    console.log('ERR：存在未提交内容');
    process.exit();
  }

   // 自动升级版本号
  const versionNumber = childProcess.execSync(`npm version ${versionType}`).toString();

  // 将升级后的版本号及commit内容 追加 写入 CHANGELOG.md
  fse.appendFileSync('CHANGELOG.md',
   `### ${versionNumber} \n
   ${commit} \n`);
   

```

## 参考资料
[脚手架开发](https://juejin.cn/post/6879265583205089287)



