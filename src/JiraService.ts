import axios, {AxiosInstance} from 'axios';
import {TestResult} from "./TestResults";

class JiraService {
    client: AxiosInstance;
    pageLimit: number;

    constructor(baseUrl: string, token: string, pageLimit = 200) {
        this.client = axios.create({
            baseURL: baseUrl
        });
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        this.pageLimit = pageLimit;
    }

    errorMessage(err: any) {
        if (err.response) {
            return err.response.data.message || err.response.data.error || err.response.data;
        } else return err.message;
    }

    async getTestFromExecution(id: string, testKey: string) {
        try {
            const response = await this.client.get(`rest/raven/1.0/testruns?testExecKey=${id}&testKey=${testKey}`)
            return response.data[0];
        } catch (err: any) {
            console.error(`Error while getting ${testKey} test in ${id} execution: ${this.errorMessage(err)}`)
        }
    }

    async uploadExecutionResults(id: string, executionResults: TestResult[]) {
        const data = {
            testExecutionKey: id,
            tests: executionResults
        };
        try {
            await this.client.post('rest/raven/1.0/import/execution', data);
        } catch (err: any) {
            console.error(`Error while uploading results to ${id} execution: ${this.errorMessage(err)}`)
        }
    }
}

export default JiraService;
