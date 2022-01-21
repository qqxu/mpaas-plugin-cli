const getCliVersion = ()=> {
  const program = require('commander')

  const cliVersion = require('../package.json').version;
  // 打印脚手架版本号
  // ' mpaas -V ' 或  ' mpaas --version ' 
  program
        .version(cliVersion)
        .parse(process.argv)

}

module.exports = getCliVersion