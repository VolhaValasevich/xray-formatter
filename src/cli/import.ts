#! /usr/bin/env node
import * as path from 'path';
import * as fs from 'fs';
import * as parser from 'gherking';
import {format} from 'gherkin-formatter';
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
        demandOption: true,
        type: 'string',
        desc: 'Regular expression for getting a test\'s Jira ID from its tags. The first capturing group should return the ID.',
        coerce: (arg: string) => new RegExp(arg)
    }).option('tests', {
        alias: 't',
        type: 'array',
        desc: 'IDs of tests that should be updated.',
    }).example(
        'xray-import --path ./features/ --regexp "(PC-\\d+|DP-\\d+)"',
        'upload steps from feature files to jira scenarios'
    ).example(
        'xray-import --path ./features/ --regexp "(PC-\\d+|DP-\\d+)" --tests PC-1 PC-2 PC-3',
        'upload steps from certain tests to jira scenarios'
    ).argv;

const importScenarios = async (argv: any) => {
    const featureFiles = klawSync(argv.path, {
        nodir: true
    }).map(item => item.path).filter(path => path.endsWith('.feature'));
    const features = await Promise.all(featureFiles.map(path => parser.load(path)));
    const scenarios: any[] = features.map(feature => feature[0].feature.elements).flat();

    const client = new JiraService(argv.config.endpoint, argv.config.token);
    for (const scenario of scenarios) {
        let testKey;
        const tag = scenario.tags.find((tag: any) => argv.regexp.test(tag.name));
        if (tag) {
            testKey = tag.name.match(argv.regexp)[1];
            if (argv.tags && !argv.tags.includes(testKey)) continue;
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
            data.fields[argv.config.customFields.stepsField] = formatSteps(scenario);
            await client.updateTest(testKey, data);
        }
    }
}

const formatSteps = (scenario: any) => {
    const feature: parser.Feature = new parser.Feature('Feature', 'Feature', 'Desc');
    feature.elements.push(scenario);
    const document: parser.Document = new parser.Document('feature', feature);
    return format(document, {compact: true})
        .split(scenario.name)[1]
        .replace(/^\r\n/g, '');
}

if (!argv.config.customFields) {
    console.error('You need to provide customFields in the xray config file. See README for more info.');
} else if (!fs.existsSync(argv.path)) {
    console.error(`Path ${argv.path} doesn't exist!`);
} else {
    importScenarios(argv).then(() => console.log('Tests were updated.')).catch(console.error);
}
