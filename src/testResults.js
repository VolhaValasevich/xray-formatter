const fs = require('fs');

class TestResults {
	constructor() {
		this.results = [];
	}

	findExistingResult(testKey) {
		return this.results.find(result => result.testKey === testKey);
	}

	updateStatus(existingResult, newStatus) {
		if (existingResult.status !== 'FAIL') existingResult.status = newStatus;
	}

	updateExamples(existingResult, newExamples) {
		existingResult.examples = [...existingResult.examples, ...newExamples];
	}

	push(newResult) {
		const existingResult = this.findExistingResult(newResult.testKey);
		if (existingResult) {
			this.updateStatus(existingResult, newResult.status);
			if (newResult.examples) {
				this.updateExamples(existingResult, newResult.examples);
			}
		} else {
			this.results.push(newResult);
		}
	}

	save(pathToFile) {
		fs.writeFileSync(pathToFile, JSON.stringify({
			tests: this.results
		}));
	}
}

module.exports = TestResults;
