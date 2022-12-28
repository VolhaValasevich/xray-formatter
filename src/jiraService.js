const axios = require('axios');

class JiraService {
	constructor(baseUrl, token) {
		this.client = axios.create({
			baseURL: baseUrl
		});
		this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
	}

	async getNumberOfPagesInExecution(id) {
		try {
			const result = await this.client.get(`/rest/api/2/issue/${id}`);
			const fields = result.data.fields;
			let total;
			for (const key in fields) {
				if (fields[key] && fields[key].count && fields[key].statuses) {
					total = fields[key].count;
				}
			}
			return Math.ceil(total / 200);
		} catch (e) {
			console.error(`Error while fetching number of test pages in ${id} test execution: ${e}`);
		}
	}

	getTestsOnExecutionPage(id, pageNumber) {
		return this.client
			.get(`/rest/raven/1.0/api/testexec/${id}/test?limit=200&page=${pageNumber}`)
			.then(response => response.data)
			.catch(err => console.error(`Error while fetching tests from ${id} execution: ${err}`))
	}

	async getAllTestsFromExecution(id) {
		const numberOfPages = await this.getNumberOfPagesInExecution(id);
		const arrayOfPromises = [];
		for (let i = 1; i <= numberOfPages; i++) {
			arrayOfPromises.push(this.getTestsOnExecutionPage(id, i));
		}
		const results = await Promise.all(arrayOfPromises);
		return results.flat();
	}

	uploadExecutionResults(id, executionResults) {
		const data = {
			testExecutionKey: id,
			tests: executionResults
		};
		return this.client
			.post('rest/raven/1.0/import/execution', data)
			.catch(err => console.error(`Error while uploading results to ${id} execution: ${err}`));
	}
}

module.exports = JiraService;
