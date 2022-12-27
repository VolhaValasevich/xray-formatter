class TestCase {
    constructor(testResult) {
        this.testResult = testResult;
    }

    getStatus() {
        return this.testResult.worstTestStepResult.status === 'PASSED' ? 'PASS' : 'FAIL';
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
