import * as fs from 'fs';

export default class TestResults {
    results: TestResult[];

    constructor() {
        this.results = [];
    }

    findExistingResult(testKey: string) {
        return this.results.find(result => result.testKey === testKey);
    }

    updateStatus(existingResult: TestResult, newStatus: string) {
        if (existingResult.status !== 'FAIL') existingResult.status = newStatus;
    }

    updateExamples(existingResult: TestResult, newExamples: string[]) {
        if (existingResult.examples) {
            existingResult.examples = [...existingResult.examples, ...newExamples];
        } else existingResult.examples = newExamples;
    }

    push(newResult: TestResult) {
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

    save(pathToFile: string) {
        try {
            fs.writeFileSync(pathToFile, JSON.stringify({
                tests: this.results
            }));
        } catch (e: any) {
            console.error(`Couldn't save '${pathToFile}' file: ${e.message}`);
        }
    }
}
