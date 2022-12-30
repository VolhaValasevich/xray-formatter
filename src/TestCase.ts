import {ITestCaseAttempt} from "@cucumber/cucumber/lib/formatter/helpers/event_data_collector";

class TestCase {
    testResult: ITestCaseAttempt;

    constructor(testResult: ITestCaseAttempt) {
        this.testResult = testResult;
    }

    getStatus() {
        return this.testResult.worstTestStepResult.status === 'PASSED' ? 'PASS' : 'FAIL';
    }

    getJiraId(regexp: RegExp) {
        const tag = this.testResult.pickle.tags.find(tag => regexp.test(tag.name));
        if (tag) {
            const matches = tag.name.match(regexp);
            return matches ? matches[1] : undefined;
        }
    }

    willBeRetried() {
        return this.testResult.willBeRetried;
    }

    isOutline() {
        const id = this.testResult.pickle.astNodeIds[0];
        const gherkinDoc = this.testResult.gherkinDocument.feature?.children.find(item => item.scenario?.id === id);
        return gherkinDoc ? gherkinDoc.scenario?.keyword === 'Scenario Outline' : false;
    }
}

export default TestCase;
