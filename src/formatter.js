const {Formatter} = require('@cucumber/cucumber');
const TestCase = require('./testCase');
const TestResults = require('./testResults');
const JiraService = require('./jiraService');

class JiraFormatter extends Formatter {

	constructor(options) {
		super(options);
		const jiraOptions = options.parsedArgvOptions.jiraOptions;

		this.tagRegexp = jiraOptions.regexp;
		this.xrayOutputPath = jiraOptions.report;
		this.results = new TestResults();

		if (jiraOptions.endpoint && jiraOptions.token && jiraOptions.execution) {
			this.jiraService = new JiraService(jiraOptions.endpoint, jiraOptions.token);
			this.execution = jiraOptions.execution;
		}

		options.eventBroadcaster.on('envelope', this.processEnvelope.bind(this));
	}

	async processEnvelope(envelope) {
		if (envelope.testCaseFinished) {
			await this.finishTest(envelope.testCaseFinished);
		} else if (envelope.testRunFinished) {
			this.finishRun();
		}
	}

	async finishTest(testCase) {
		const test = new TestCase(this.eventDataCollector.getTestCaseAttempt(testCase.testCaseStartedId));
		const testKey = test.getJiraId(this.tagRegexp);
		if (testKey && !test.willBeRetried()) {
			const status = test.getStatus()
			const result = {testKey, status};
			if (test.isOutline()) {
				result.examples = [status];
			}
			if (this.execution) {
				await this.jiraService.uploadExecutionResults(this.execution, [result]);
			}
			this.results.push(result);
		}
	}

	finishRun() {
		this.results.save(this.xrayOutputPath);
	}

}

module.exports = JiraFormatter;
