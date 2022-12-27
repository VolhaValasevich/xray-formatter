const fs = require('fs');

class TestResults {
	constructor() {
		this.results = [];
	}

	push(newResult) {
		const index = this.results.findIndex(result => result.testKey === newResult.testKey);
		if (index > -1) {
			this.results[index].status = this.results[index].status === 'FAIL'
				? this.results[index].status
				: newResult.status;
		} else this.results.push(newResult);
	}

	save(pathToFile) {
		fs.writeFileSync(pathToFile, JSON.stringify(this.results));
	}
}

module.exports = TestResults;
