import * as path from 'path';
import * as fs from 'fs';
import * as parser from 'gherkin-parse';
import klawSync from 'klaw-sync';
import * as cliProgress from 'cli-progress';
import JiraService from "../JiraService";

exports.command = 'update';

exports.describe = 'update steps in Jira scenarios based on feature files';

exports.builder = {
    path: {
        alias: 'p',
        demandOption: true,
        type: 'string',
        desc: 'Path to your feature files.',
        coerce: (arg: string) => path.resolve(arg)
    },
    regexp: {
        alias: 'r',
        type: 'string',
        desc: 'Regular expression for getting a test\'s Jira ID from its tags. The first capturing group should return the ID.',
        coerce: (arg: string) => new RegExp(arg)
    },
}

exports.handler = async (argv: { config: JiraConfig, path: string, regexp: RegExp }) => {
    if (fs.existsSync(argv.path)) {
        const featureFiles = klawSync(argv.path, {
            nodir: true
        }).map(item => item.path).filter(path => path.endsWith('.feature'));
        const features = featureFiles.map(path => parser.convertFeatureFileToJSON(path).feature);
        const scenarios = features.map(feature => feature.children).flat();

        const client = new JiraService(argv.config.endpoint, argv.config.token);
        const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        progressBar.start(scenarios.length, 0);
        for (const scenario of scenarios) {
            let testKey;
            const tag = scenario.tags.find((tag: any) => argv.regexp.test(tag.name));
            if (tag) {
                testKey = tag.name.match(argv.regexp)[1];
            } else {
                progressBar.increment();
                continue;
            }

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

            await client.updateTest(testKey, data);
            progressBar.increment();
        }
        progressBar.stop();
        console.log('Tests were updated.');
    } else {
        console.error(`Path ${argv.path} doesn't exist!`);
    }
}