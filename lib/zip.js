
const fse = require('fs-extra');

const childProcess = require('child_process');
const program = require('commander');

const PROCESS_PATH = process.cwd();
const PACKAGE_FILE_PATH = `${PROCESS_PATH}/package.json`;
const DIST_DIRECTORY_PATH = `${PROCESS_PATH}/dist`;
const ZIP_DIRECTORY_PATH = `${PROCESS_PATH}/zip`;

const MPAAS_CONFIG_FILE_NAMES = ['moduleInfo.json', 'pageInfo.json'];

/**
 * 检验dist目录是否存在
 */
const onDistDirectoryReady = () => {
  const exists = fse.pathExistsSync(DIST_DIRECTORY_PATH);
  if (!exists) {
    console.log(`${DIST_DIRECTORY_PATH} 不存在，请生成dist目录`);
    process.exit();
  }
}

/**
 * @description: 读取package.json 文件相关信息
 */
const onPackageFileRead = () => {
  const jsonConfig = fse.readJsonSync(PACKAGE_FILE_PATH);
  const { name, version, versionKey, mpaas, appId } = jsonConfig;
  
  const infoIsMiss = [name, version, versionKey, appId, mpaas].some(itm => !itm);
  if (infoIsMiss) {
    console.log(`信息缺失，${PACKAGE_FILE_PATH} 中 name, version, versionKey, mpaas, appId 不可缺失`);
    process.exit();
  }
  return {
    name, version, versionKey, mpaas, appId
  };
}

/**
 * @description: 清空目标路径，新建目标目录，将源目录拷贝至目标目录
 */
const onCopyDistDirectorySync = (sourcePath, destPath) => {
  fse.removeSync(destPath);
  fse.ensureDirSync(destPath);
  fse.copySync(sourcePath, destPath);
}

/**
 * @description: 用 mPaasConfig 配置数据替换 mpaasPath 路径下文件中内容，生成的文件放在 destPath 目录下
 */
const updateMpaasFileSync = (mpaasPath, mPaasConfig, destPath) => {
  const mpaasFileList = fse.readdirSync(mpaasPath);

  const anyFileNonExit = MPAAS_CONFIG_FILE_NAMES.some((file) => (!fse.existsSync(`${mpaasPath}/${file}`))); // 检查mpaas目录下是否有配置文件
  if (anyFileNonExit) {
    console.log(`请检查package.json mpaas 值\n该目录下需要包含 ${MPAAS_CONFIG_FILE_NAMES.join(' ')}，请注意大小写`);
    process.exit();
  }

  mpaasFileList.forEach((fileName) => {
    const dataStr = fse.readFileSync(`${PROCESS_PATH}/${mpaasPath}/${fileName}`, 'utf8');
    const configJSONStr = updateJsonFile(dataStr, mPaasConfig);
    fse.writeFileSync(`${destPath}/${fileName}`, configJSONStr)
  })
}

/**
 * @description: 正则替换 config 中配置的数据
 */
const updateJsonFile = (tpl, config)=> {
  const reg = new RegExp(/{{(.*?)}}/g);
  return ('' + tpl).replace(reg, function (match, $1) {
    const val = config[$1];
    if (!val) {
      throw `[ERROR] [mPaaS config] ${$1} is not defined`;
    }
    return config[$1];
  });
}

/**
 * date 查看时间：https://www.cnblogs.com/qmfsun/p/4598650.html
 */
const getCommit = () => {
  if (process.env.productVersion) {
    return `制品号：${process.env.productVersion}`
  }

  const commit = childProcess.execSync('git rev-parse --short HEAD').toString();
  const branch = childProcess.execSync('git symbolic-ref --short -q HEAD').toString();
  const time = childProcess.execSync('date "+%Y-%m-%d %H:%M"').toString();
  const gitStatus = childProcess.execSync('git status').toString();

  const data = `
  commit: ${commit} \n
  branch: ${branch} \n
  date: ${time} \n
  gitStatus: \n ${gitStatus}
  `;

  return data;
}


const generateZip = () => {
  program
        .command('zip')
        .description('execute the given remote cmd')
        .action(() => {
          onDistDirectoryReady(); // 检查dist目录是否存在
          const { name, version, versionKey, appId, mpaas } = onPackageFileRead(); // 读取package.json 
          console.log('读取数据成功');

          fse.removeSync(ZIP_DIRECTORY_PATH); // 清空zip目录

          const sourcePath = DIST_DIRECTORY_PATH; // 源路径
          const destPath = `${ZIP_DIRECTORY_PATH}/${appId}/${name}`; // 目标目录 zip/20201125/creditweb
          const mpaasDestPath = `${ZIP_DIRECTORY_PATH}/${appId}`; // mpaas 配置目录 zip/20201125
          
          onCopyDistDirectorySync(sourcePath, destPath); 
          console.log('拷贝dist目录成功');

          const mPaasConfig = {
            appId,
            appName: name,
            appVersion: version,
            appVersionKey: versionKey,
          };
          
          updateMpaasFileSync(mpaas, mPaasConfig, mpaasDestPath); // 更新mpaas 配置文件内容，并放在 zip/20201125目录下
          console.log('mpaas 配置文件更新成功');
          
          const commitInfo = getCommit();
          fse.writeFileSync(`${mpaasDestPath}/readme.txt`, commitInfo);
        
          childProcess.execSync(`cd zip && zip -rm ${appId}.zip ${appId}`);
          console.log(`打包完成，请查看${ZIP_DIRECTORY_PATH}`);
        });
      
  program.parse(process.argv); 
}


module.exports = generateZip