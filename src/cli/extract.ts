import JiraService from "../JiraService";
import JiraConfig from "./JiraConfig";
import * as path from "path";
import * as fs from "fs";

exports.command = 'extract';

exports.describe = 'extract tags of non-passed tests from an Xray execution'

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
    }
}

exports.handler = async (argv: { config: JiraConfig, execution: string, path: string }) => {
    const client = new JiraService(argv.config.endpoint, argv.config.token);
    const allTests = await client.getAllTestsFromExecution(argv.execution);
    if (!allTests) throw new Error(`Failed to get results from ${argv.execution} execution.`);
    const failedTests = allTests.filter(test => test.status !== 'PASS').map(test => test.key);
    if (failedTests.length === 0) {
        console.log(`No failed or unexecuted tests found in ${argv.execution} execution.`)
    } else {
        fs.writeFileSync(argv.path, failedTests.join(' or '));
    }
}
