#! /usr/bin/env node
import yargs from 'yargs';

yargs.command(require('./extract'))
    .help()
    .demandCommand(1, 'You need to pass a command.')
    .argv;
