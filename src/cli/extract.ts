import * as path from 'path';
import JiraService from "../JiraService";

exports.command = 'extract';

exports.describe = 'extract failed tags from an Xray execution'

exports.builder = {
    config: {
        alias: 'c',
        demandOption: true,
        type: 'string',
        desc: 'Path to your Jira config',
        coerce: (arg: string) => require(path.resolve(arg)),
    },
    execution: {
        alias: 'e',
        demandOption: true,
        type: 'string',
        desc: 'Execution ID',
    }
}

exports.handler = (argv: {config: any, execution: string}) => {
    const client = new JiraService(argv.config.endpoint, argv.config.token);
    console.log(argv.config.endpoint, argv.config.token);
}
