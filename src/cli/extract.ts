#! /usr/bin/env node
import * as path from 'path';
import * as fs from 'fs';
import yargs from 'yargs';
import JiraService from '../JiraService';
import config from './config';

const argv: any = yargs((process.argv.slice(2))).option('config', config)
    .option('execution', {
        alias: 'e',
        demandOption: true,
        type: 'string',
        desc: 'Execution ID',
    }).option('path', {
        alias: 'p',
        type: 'string',
        default: './tags.txt',
        desc: 'Path to file for saving the tag string.',
        coerce: (arg: string) => path.resolve(arg)
    }).option('format', {
        alias: 'f',
        type: 'string',
        default: '@id',
        desc: 'format for saving Jira IDs in a tag string.'
    }).argv;

const client = new JiraService(argv.config.endpoint, argv.config.token);
client.getAllTestsFromExecution(argv.execution).then(allTests => {
    if (!allTests) throw new Error(`Failed to get results from ${argv.execution} execution.`);
    const failedTests = allTests
        .filter(test => test.status !== 'PASS')
        .map(test => argv.format.replace('id', test.key));
    if (failedTests.length === 0) {
        console.log(`No failed or unexecuted tests found in ${argv.execution} execution.`);
    } else {
        fs.writeFileSync(argv.path, failedTests.join(' or '));
        console.log(`Tags were saved in ${argv.path}`);
    }
});

