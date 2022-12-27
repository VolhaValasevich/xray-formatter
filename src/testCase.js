class TestCase {
    constructor(testResult) {
        this.testResult = testResult;
    }

    getStatus() {
        const isFailed = Object.values(this.testResult.stepResults).some(step => step.status !== 'PASSED');
        return isFailed ? 'FAIL' : 'PASS';
    }

    getJiraId(regexp) {
        const tag = this.testResult.pickle.tags.find(tag => regexp.test(tag.name));
        if (tag) {
            return tag.name.match(regexp)[1];
        }
    }

    willBeRetried() {
        return this.testResult.willBeRetried;
    }
}

module.exports = TestCase;
