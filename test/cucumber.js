const path = require('path');

const common = {
	paths: ['test/features/*.feature'],
	require: ['test/step-definitions/steps.js'],
	format: [
		'json:test/report.json',
		'./src/formatter.js:test/xray.json',
	],
	publishQuiet: true
}

module.exports = {
	default: {
		...common,
		formatOptions: {
			jiraOptions: {
				regexp: /@jira\((\w+-\d+)\)/,
				report: path.resolve('./test/xray.json')
			}
		}
	},
	simpleTag: {
		...common,
		formatOptions: {
			jiraOptions: {
				regexp: /(PC-\d+|DP-\d+)/,
				report: path.resolve('./test/xray.json')
			}
		}
	},
	retry: {
		...common,
		retry: 1,
		formatOptions: {
			jiraOptions: {
				regexp: /@jira\((\w+-\d+)\)/,
				report: path.resolve('./test/xray.json')
			}
		}
	},
	uploadToJira: {
		...common,
		retry: 1,
		formatOptions: {
			jiraOptions: {
				endpoint: 'http://localhost:8080',
				token: 'NTgxMTYxOTc3NDk4OtGLxQbvlj5ZuoaMTgR6dZjOVnmb',
				execution: 'PC-7',
				resetTests: '@jira(PC-1) or @jira(PC-2) or @jira(PC-3)',
				regexp: /@jira\((\w+-\d+)\)/,
				report: path.resolve('./test/xray.json')
			}
		}
	},
}
