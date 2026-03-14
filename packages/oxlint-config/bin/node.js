#!/usr/bin/env node
'use strict';
const { execSync } = require('child_process');
const path = require('path');

const config = path.resolve(__dirname, '../node.json');
const args = process.argv.slice(2).join(' ') || 'src/';
execSync(`oxlint -c "${config}" --deny-warnings ${args}`, { stdio: 'inherit', shell: true });
