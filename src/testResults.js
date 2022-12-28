const fs = require('fs');

class TestResults {
	constructor() {
		this.results = [];
	}

	push(newResult) {
		const index = this.results.findIndex(result => result.testKey === newResult.testKey);
		if (index > -1) {
			const oldResult = this.results[index];
			if (oldResult.status !== 'FAIL') oldResult.status = newResult.status;
		} else this.results.push(newResult);
	}

	save(pathToFile) {
		fs.writeFileSync(pathToFile, JSON.stringify(this.results));
	}
}

module.exports = TestResults;
