#! /usr/bin/env node
import * as path from 'path';
import * as fs from 'fs';
import * as parser from 'gherkin-parse';
import klawSync from 'klaw-sync';
import JiraService from '../JiraService';
import config from './config';
import yargs from 'yargs';

const argv: any = yargs((process.argv.slice(2))).option('config', config)
    .option('path', {
        alias: 'p',
        demandOption: true,
        type: 'string',
        desc: 'Path to your feature files.',
        coerce: (arg: string) => path.resolve(arg)
    })
    .option('regexp', {
        alias: 'r',
        type: 'string',
        desc: 'Regular expression for getting a test\'s Jira ID from its tags. The first capturing group should return the ID.',
        coerce: (arg: string) => new RegExp(arg)
    }).example(
        'xray-import --config ./xray.config.json --path ./features/ --regexp "(PC-\\d+|DP-\\d+)"',
        'upload steps from feature files to jira scenarios'
    ).argv;

if (!argv.config.customFields) {
    console.error('You need to provide customFields in the xray config file. See README for more info.');
} else if (!fs.existsSync(argv.path)) {
    console.error(`Path ${argv.path} doesn't exist!`);
} else {
    const featureFiles = klawSync(argv.path, {
        nodir: true
    }).map(item => item.path).filter(path => path.endsWith('.feature'));
    const features = featureFiles.map(path => parser.convertFeatureFileToJSON(path).feature);
    const scenarios = features.map(feature => feature.children).flat();

    const promises = [];
    const client = new JiraService(argv.config.endpoint, argv.config.token);
    for (const scenario of scenarios) {
        let testKey;
        const tag = scenario.tags.find((tag: any) => argv.regexp.test(tag.name));
        if (tag) {
            testKey = tag.name.match(argv.regexp)[1];
        } else continue;

        const data: any = {
            fields: {}
        };
        data.fields[argv.config.customFields.testTypeField] = {
            id: argv.config.customFields.cucumberTypeId
        };
        data.fields[argv.config.customFields.scenarioTypeField] = {};
        data.fields[argv.config.customFields.scenarioTypeField].id = scenario.type === 'Scenario'
            ? argv.config.customFields.scenarioTypeId
            : argv.config.customFields.scenarioOutlineTypeId;
        data.fields[argv.config.customFields.stepsField] = scenario.steps.reduce((scenario: string, step: any) => {
            return scenario + `${step.keyword}${step.text}\n`;
        }, '');
        promises.push(client.updateTest(testKey, data));
    }
    Promise.all(promises).then(() => console.log('Tests were updated.')).catch(console.error);
}
