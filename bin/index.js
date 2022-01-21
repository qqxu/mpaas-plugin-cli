#!/usr/bin/env node


const getCliVersion = require('../lib/version')
getCliVersion();

const generateZip = require('../lib/zip')
generateZip();
