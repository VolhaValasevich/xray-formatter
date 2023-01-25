#! /usr/bin/env node
import JiraService from '../JiraService';
import * as path from 'path';
import * as fs from 'fs';
import yargs from 'yargs';
import config from './config';

const argv: any = yargs((process.argv.slice(2))).option('config', config)
    .option('execution', {
        alias: 'e',
        demandOption: true,
        type: 'string',
        desc: 'Execution ID',
    })
    .option('path', {
        alias: 'p',
        type: 'string',
        demandOption: true,
        desc: 'Path to xray.json',
        coerce: (arg: string) => path.resolve(arg)
    }).example(
        'xray-upload --config ./xray.config.json --path ./report/xray.json --execution PC-1',
        'upload test results from xray.json file to the execution'
    ).argv;

if (fs.existsSync(argv.path)) {
    const client = new JiraService(argv.config.endpoint, argv.config.token);
    console.log(`Uploading results to "${argv.execution}" execution.`);
    const executionResults = require(argv.path).tests;
    client.uploadExecutionResults(argv.execution, executionResults)
        .then(() => console.log(`Test results were uploaded to ${argv.execution} execution.`))
        .catch(console.error);
} else {
    console.error(`File ${argv.path} doesn't exist!`);
}
