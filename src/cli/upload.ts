import JiraService from '../JiraService';
import * as path from 'path';
import * as fs from 'fs';

exports.command = 'upload';

exports.describe = 'upload results from an xray.json report to Jira';

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
        demandOption: true,
        desc: 'Path to xray.json',
        coerce: (arg: string) => path.resolve(arg)
    }
}

exports.handler = async (argv: { config: JiraConfig, execution: string, path: string }) => {
    if (fs.existsSync(argv.path)) {
        const client = new JiraService(argv.config.endpoint, argv.config.token);
        console.log(`Uploading results to "${argv.execution}" execution.`);
        const executionResults = require(argv.path).tests;
        await client.uploadExecutionResults(argv.execution, executionResults);
        console.log(`Test results were uploaded to ${argv.execution} execution.`)
    } else {
        console.error(`File ${argv.path} doesn't exist!`);
    }
}
