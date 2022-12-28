const axios = require('axios');

class JiraService {
	constructor(baseUrl, token) {
		this.client = axios.create({
			baseURL: baseUrl
		});
		this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
	}

	uploadExecutionResults(id, executionResults) {
		const data = {
			testExecutionKey: id,
			tests: executionResults
		};
		return this.client
			.post(`rest/raven/1.0/import/execution`, data)
			.catch(err => console.error(`Error while uploading results to ${id} execution: ${err}`));
	}
}

module.exports = JiraService;
