#! /usr/bin/env node
import yargs from 'yargs';
import path from "path";

yargs.option('config', {
        alias: 'c',
        demandOption: true,
        type: 'string',
        desc: 'Path to your Jira config',
        coerce: (arg: string) => require(path.resolve(arg)),
    })
    .command(require('./extract'))
    .help()
    .demandCommand(1, 'You need to pass a command.')
    .argv;
