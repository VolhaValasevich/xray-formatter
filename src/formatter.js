const {Formatter} = require('@cucumber/cucumber');
const TestCase = require('./testCase');
const TestResults = require('./testResults');

class JiraFormatter extends Formatter {

	constructor(options) {
		super(options);
		const jiraOptions = options.parsedArgvOptions.jiraOptions;

		this.tagRegexp = jiraOptions.regexp;
		this.xrayOutputPath = jiraOptions.report;
		this.results = new TestResults();

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
		const jiraId = test.getJiraId(this.tagRegexp);
		if (jiraId && !test.willBeRetried()) {
			const result = {
				testKey: jiraId,
				status: test.getStatus()
			}
			this.results.push(result);
		}
	}

	finishRun() {
		this.results.save(this.xrayOutputPath);
	}

}

module.exports = JiraFormatter;
