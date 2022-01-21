#!/usr/bin/env node

const program = require('commander')

const generateZip = require('../lib/zip');
const publishValidate = require('../lib/publish');

program.version(require('../package.json').version, '-v, --version')

program
      .command('zip')
      .description('zip dist')
      .action(() => {
        generateZip()
      });

program
      .command('pub')
      .description('validate before publish')
      .action(() => {
        publishValidate();
      });


program.parse(process.argv); 