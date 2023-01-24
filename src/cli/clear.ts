import JiraService from '../JiraService';

exports.command = 'clear';

exports.describe = 'set all tests in a Xray execution in TODO status';

exports.builder = {
    execution: {
        alias: 'e',
        demandOption: true,
        type: 'string',
        desc: 'Execution ID',
    },
}

exports.handler = async (argv: { config: JiraConfig, execution: string }) => {
    const client = new JiraService(argv.config.endpoint, argv.config.token);
    const allTests = await client.getAllTestsFromExecution(argv.execution);
    if (!allTests) throw new Error(`Failed to get results from ${argv.execution} execution.`);
    const emptyResults = allTests.map(test => {
        return {
            testKey: test.key,
            status: 'TODO'
        }
    });
    await client.uploadExecutionResults(argv.execution, emptyResults);
    console.log(`Tests in ${argv.execution} execution have been set in TODO status.`);
}
