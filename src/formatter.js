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
			this.resetTests = jiraOptions.resetTests;
		}

		options.eventBroadcaster.on('envelope', this.processEnvelope.bind(this));
	}

	async processEnvelope(envelope) {
		if (envelope.testRunStarted && this.resetTests) {
			await this.resetTestStatuses();
		} else if (envelope.testCaseFinished) {
			await this.saveTestResult(envelope.testCaseFinished);
		} else if (envelope.testRunFinished) {
			this.saveResultsToFile();
		}
	}

	async resetTestStatuses() {
		let tags = this.resetTests.match(new RegExp(this.tagRegexp.source, 'g'));
		if (tags && tags.length > 0) {
			tags = tags.map(tag => tag.match(this.tagRegexp)[1]);
			await this.jiraService.uploadExecutionResults(this.execution, tags.map(tag => {
				return {
					testKey: tag,
					status: `TODO`
				}
			}))
		}
	}

	async saveTestResult(testCase) {
		const test = new TestCase(this.eventDataCollector.getTestCaseAttempt(testCase.testCaseStartedId));
		const testKey = test.getJiraId(this.tagRegexp);
		if (testKey && !test.willBeRetried()) {
			const status = test.getStatus()
			const result = {testKey, status};
			if (test.isOutline()) {
				result.examples = [status];
			}
			this.results.push(result);
			if (this.execution) {
				const results = await this.jiraService.getAllTestsFromExecution(this.execution);
				const existingResult = results.find(item => item.key === testKey);
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

module.exports = JiraFormatter;
