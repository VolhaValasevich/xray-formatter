import {Formatter, IFormatterOptions} from '@cucumber/cucumber';
import {Envelope, TestCaseFinished} from '@cucumber/messages';
import TestCase from './TestCase';
import TestResults from './TestResults';
import JiraService from './JiraService';

class JiraFormatter extends Formatter {
    tagRegexp: RegExp;
    xrayOutputPath: string;
    results: TestResults;
    jiraService?: JiraService;
    execution?: string;
    resetTests?: string[];

    constructor(options: IFormatterOptions) {
        super(options);
        const jiraOptions = options.parsedArgvOptions.jiraOptions;

        if (!jiraOptions)
            throw new Error('You need to provide jiraOptions in Cucumber formatOptions. See README for more info.');
        if (!jiraOptions.regexp || !jiraOptions.report)
            throw new Error(`You need to provide regexp and report path in jiraOptions. See README for more info.`)

        this.tagRegexp = jiraOptions.regexp;
        this.xrayOutputPath = jiraOptions.report;
        this.results = new TestResults();

        if (jiraOptions.endpoint && jiraOptions.token && jiraOptions.execution) {
            this.jiraService = new JiraService(jiraOptions.endpoint, jiraOptions.token, jiraOptions.pageLimit);
            this.execution = jiraOptions.execution;
            this.resetTests = jiraOptions.resetTests;
        }

        options.eventBroadcaster.on('envelope', this.processEnvelope.bind(this));
    }

    async processEnvelope(envelope: Envelope) {
        if (envelope.testRunStarted) {
            await this.resetTestStatuses();
        } else if (envelope.testCaseFinished) {
            await this.saveTestResult(envelope.testCaseFinished);
        } else if (envelope.testRunFinished) {
            this.saveResultsToFile();
        }
    }

    async resetTestStatuses() {
        if (this.jiraService && this.execution && this.resetTests && this.resetTests.length > 0) {
            await this.jiraService.uploadExecutionResults(this.execution, this.resetTests.map(tag => {
                return {
                    testKey: tag,
                    status: `TODO`
                }
            }))
        }
    }

    async saveTestResult(testCase: TestCaseFinished) {
        const test = new TestCase(this.eventDataCollector.getTestCaseAttempt(testCase.testCaseStartedId));
        const testKey = test.getJiraId(this.tagRegexp);
        if (testKey && !test.willBeRetried()) {
            const status = test.getStatus()
            const result: TestResult = {testKey, status};
            if (test.isOutline()) {
                result.examples = [status];
            }
            this.results.push(result);
            if (this.jiraService && this.execution) {
                const existingResult = await this.jiraService.getTestFromExecution(this.execution, testKey);
                if (!existingResult || existingResult.status !== 'FAIL') {
                    await this.jiraService.uploadExecutionResults(this.execution, [result]);
                }
            }
        }
    }

    saveResultsToFile() {
        this.results.save(this.xrayOutputPath);
    }

}

export default JiraFormatter;
