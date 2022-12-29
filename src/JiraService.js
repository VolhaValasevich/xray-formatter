const axios = require('axios');

class JiraService {
	constructor(baseUrl, token, pageLimit = 200) {
		this.client = axios.create({
			baseURL: baseUrl
		});
		this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
		this.pageLimit = pageLimit;
	}

	async getTestFromExecution(id, testKey) {
		try {
			const response = await this.client.get(`rest/raven/1.0/testruns?testExecKey=${id}&testKey=${testKey}`)
			return response.data[0];
		} catch(err) {
			console.error(`Error while getting ${testKey} test in ${id} execution: ${err.response.data || err.message}`)
		}
	}

	async getAllTestsFromExecution(id) {
		try {
			let allResults = [], page = 1, isLast = false;
			while (!isLast) {
				const result = await this.client.get(`rest/raven/1.0/api/testexec/${id}/test?limit=${this.pageLimit}&page=${page}`);
				allResults = [...allResults, ...result.data];
				result.data.length < this.pageLimit
					? isLast = true
					: page++;
			}
			return allResults;
		} catch (err) {
			console.error(`Error while getting tests from ${id} execution: ${err.response.data || err.message}`);
		}
	}

	async uploadExecutionResults(id, executionResults) {
		const data = {
			testExecutionKey: id,
			tests: executionResults
		};
		try {
			await this.client.post('rest/raven/1.0/import/execution', data);
		} catch(err) {
			console.error(`Error while uploading results to ${id} execution: ${err.response.data || err.message}`)
		}
	}
}

module.exports = JiraService;
