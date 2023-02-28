#! /usr/bin/env node
import * as path from 'path';
import * as fs from 'fs';
import * as cliProgress from 'cli-progress';
import * as parser from 'gherking';
import {format} from 'gherkin-formatter';
import klawSync from 'klaw-sync';
import yargs from 'yargs';
import JiraService from '../JiraService';
import TableFormatter from '../TableFormatter';
import config from './config';

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
    }).argv;

const getJiraTag = (scenario: parser.Scenario, regexp: RegExp) => {
    return scenario.tags.find((tag: any) => regexp.test(tag.name));
}

const readScenarios = async (path: string, tests?: string[], regexp?: RegExp) => {
    const featureFiles = klawSync(path, {nodir: true})
        .map(item => item.path)
        .filter(path => path.endsWith('.feature'));
    const features = await Promise.all(featureFiles.map(path => {
        return parser.load(path).then(feature => {
            return parser.process(feature[0], new TableFormatter());
        });
    }));
    const scenarios: any[] = features.map(feature => feature[0].feature.elements).flat();
    if (tests && regexp) {
        const filteredScenarios = [];
        for (const id of tests) {
            const foundScenario = scenarios.find(scenario => {
                const tag = getJiraTag(scenario, regexp);
                if (tag) return tag.name.includes(id);
            });
            if (foundScenario) filteredScenarios.push(foundScenario);
            else console.error(`No test with ${id} tag found`);
        }
        return filteredScenarios;
    } else return scenarios;
}

const formatSteps = (scenario: any) => {
    const feature: parser.Feature = new parser.Feature('Feature', 'Feature', 'Desc');
    feature.elements.push(scenario);
    const document: parser.Document = new parser.Document('feature', feature);
    return format(document, {compact: true})
        .split(scenario.name)[1]
        .replace(/^\r\n/g, '');
}

const importScenarios = async (argv: any) => {
    const scenarios = await readScenarios(argv.path, argv.tests, argv.regexp);
    const client = new JiraService(argv.config.endpoint, argv.config.token);
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(scenarios.length, 0);
    for (const scenario of scenarios) {
        let testKey;
        const tag = getJiraTag(scenario, argv.regexp);
        if (tag) {
            testKey = tag.name.match(argv.regexp)![1];
            const steps = formatSteps(scenario);
            await client.updateTest(testKey, scenario.keyword, steps, argv.config.customFields);
            progressBar.increment();
        }
    }
    progressBar.stop();
}

if (!argv.config.customFields) {
    console.error('You need to provide customFields in the xray config file. See README for more info.');
} else if (!fs.existsSync(argv.path)) {
    console.error(`Path ${argv.path} doesn't exist!`);
} else {
    importScenarios(argv).then(() => console.log('Tests were updated.')).catch(console.error);
}
