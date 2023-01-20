import JiraService from '../JiraService';
import {JiraConfig} from './index';
import * as path from 'path';
import * as fs from 'fs';

exports.command = 'extract';

exports.describe = 'extract tags of non-passed tests from an Xray execution';

exports.builder = {
    execution: {
        alias: 'e',
        demandOption: true,
        type: 'string',
        desc: 'Execution ID',
    },
    path: {
        alias: 'p',
        type: 'string',
        default: './tags.txt',
        desc: 'Path to file for saving the tag string.',
        coerce: (arg: string) => path.resolve(arg)
    },
    format: {
        alias: 'f',
        type: 'string',
        default: '@id',
        desc: 'format for saving Jira IDs in a tag string.'
    }
}

exports.handler = async (argv: { config: JiraConfig, execution: string, path: string, format: string }) => {
    const client = new JiraService(argv.config.endpoint, argv.config.token);
    const allTests = await client.getAllTestsFromExecution(argv.execution);
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
}
