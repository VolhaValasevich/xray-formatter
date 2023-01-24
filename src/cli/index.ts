#! /usr/bin/env node
import yargs from 'yargs';
import path from 'path';

yargs.option('config', {
    alias: 'c',
    demandOption: true,
    type: 'string',
    desc: 'Path to your Jira config',
    coerce: (arg: string) => {
        const config: JiraConfig = require(path.resolve(arg));
        if (!config.endpoint || !config.token) {
            throw new Error('Config file must contain your Jira endpoint and access token.');
        }
        return config;
    },
})
    .command(require('./extract'))
    .command(require('./clear'))
    .command(require('./upload'))
    .command(require('./update'))
    .demandCommand(1, 'You need to pass a command.')
    .argv;
