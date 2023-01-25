#! /usr/bin/env node
import * as path from 'path';
import * as fs from 'fs';
import yargs from 'yargs';
import JiraService from '../JiraService';
import config from './config';

const argv: any = yargs((process.argv.slice(2))).option('config', config)
    .option('execution', {
        alias: 'e',
        type: 'string',
        desc: 'Execution ID',
    })
    .option('report', {
        alias: 'r',
        type: 'string',
        desc: 'Path to your xray report',
        coerce: (arg: string) => path.resolve(arg)
    })
    .option('path', {
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
    }).conflicts(
        'execution',
        'report'
    ).example(
        'xray-extract --execution PC-1',
        'save tags of failed tests from the execution'
    ).example(
        'xray-extract --report ./report/xray.json',
        'save tags of failed tests from xray.json'
    ).example(
        'xray-extract --execution PC-1 --format @jira(id)',
        'save tags of failed tests in [@jira(id1) or @jira(id2)] format'
    )
    .help()
    .argv;

const parseTests = async (argv: any) => {
    let allTests;
    if (argv.execution) {
        const client = new JiraService(argv.config.endpoint, argv.config.token);
        allTests = await client.getAllTestsFromExecution(argv.execution);
        if (!allTests) throw new Error(`Failed to get results from ${argv.execution} execution.`);
    } else if (argv.report) {
        allTests = require(argv.report).tests;
        if (!allTests) throw new Error(`Failed to get results from ${argv.report} file.`);
    } else throw new Error('Either execution or path to xray report should be provided.')

    const failedTests = allTests
        .filter((test: any) => test.status !== 'PASS')
        .map((test: any) => argv.format.replace('id', test.key || test.testKey));
    if (failedTests.length === 0) {
        console.log(`No failed or unexecuted tests were found.`);
    } else {
        fs.writeFileSync(argv.path, failedTests.join(' or '));
    }
}

parseTests(argv)
    .then(() => console.log(`Tags were saved in ${argv.path}`))
    .catch(console.error);

