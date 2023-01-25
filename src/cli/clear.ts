#! /usr/bin/env node
import yargs from 'yargs';
import JiraService from '../JiraService';
import config from './config';

const argv: any = yargs((process.argv.slice(2))).option('config', config)
    .option('execution', {
        alias: 'e',
        demandOption: true,
        type: 'string',
        desc: 'Execution ID',
    }).argv;

const client = new JiraService(argv.config.endpoint, argv.config.token);
client.getAllTestsFromExecution(argv.execution).then(allTests => {
    if (!allTests) throw new Error(`Failed to get results from ${argv.execution} execution.`);
    const emptyResults = allTests.map(test => {
        return {
            testKey: test.key,
            status: 'TODO'
        }
    });
    return client.uploadExecutionResults(argv.execution, emptyResults);
}).then(() => console.log(`Tests in ${argv.execution} execution have been set in TODO status.`));

