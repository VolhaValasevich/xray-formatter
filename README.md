[![npm version](https://badge.fury.io/js/xray-formatter.svg)](https://badge.fury.io/js/xray-formatter)
# xray-formatter

This is a Xray formatter for Cucumber automation framework.
Use this formatter if you use [Xray Jira plugin](https://www.getxray.app/test-management) for managing your automation test cases and running them via [Xray Test Executions](https://docs.getxray.app/display/XRAY620/Test+Execution). 

## Installation

To install the package, run:

```shell
npm install xray-formatter
```

Add the reporter configuration to your Cucumber config file.

## Usage

For this reporter to work correctly, Cucumber tests need to have their unique Jira IDs saved in the tags.
If the test has several Jira tags, only the first one will be used to save the result.
```gherkin
Feature: Feature

  @PC-12345
  Scenario: Some Test
```

### Save results in a file

By default, only `regexp` and `report` options needs to be provided. The regular expression needs to match the Jira tags and return the ID as the first capturing group.

The results of the test run will be saved in a file, which can be manually imported in a Xray Test Execution (see [docs](https://docs.getxray.app/display/XRAY620/Import+Execution+Results)).

```javascript
module.exports = {
  default: {
    format: [
      'xray-formatter:reports/xray.json',
    ],
    formatOptions: {
      jiraOptions: {
        regexp: /(PC-\d+)/,
        report: './reports/xray.json'
      }
    }
  }
}
```

### Send results to Jira

If you want to send the results to Xray Test Execution automatically, you need to provide `endpoint`, `token` and `execution` options.

```javascript
module.exports = {
  default: {
    format: [
      'xray-formatter:reports/xray.json',
    ],
    formatOptions: {
      jiraOptions: {
        endpoint: 'https://jira.company.com/jira/',
        token: '123456789',
        execution: 'PC-7',
        regexp: /(PC-\d+)/,
        report: './reports/xray.json',
      }
    }
  }
}
```
The results will be updated in real time.

### Note
- This formatter uses default Xray test statuses: 'TODO', 'PASS' and 'FAIL'.
- In order to avoid reporting false positive results for Scenario Outlines, the formatter will not change any test's status from 'FAIL' to 'PASS'. If you need to rerun tests from an execution, set them in 'TODO' status manually or provide `resetTests` option in the config.

## Options

| Name       | Type     | Example                            | Description                                                                                                           | Optional |
|------------|----------|------------------------------------|-----------------------------------------------------------------------------------------------------------------------|----------|
| regexp     | RegExp   | /@jira\\((\w+-\d+)\\)/             | Regular expression for getting a test's Jira ID from its tags. The first capturing group should return the ID.        | No       |
| report     | string   | ./report/xray.json                 | Path to the file where the xray report will be saved.                                                                 | No       |
| endpoint   | string   | [https://jira.company.com/jira/]() | Your Jira endpoint.                                                                                                   | Yes      |
| token      | string   |                                    | Jira API token. See [docs](https://confluence.atlassian.com/enterprise/using-personal-access-tokens-1026032365.html). | Yes      |
| execution  | string   | PC-7                               | The ID of your Xray Test Execution.                                                                                   | Yes      |    
| resetTests | string[] | ['PC-1', 'PC-2', 'PC-3']           | An array of tests which should be reset in 'TODO' status before the run.                                              | Yes      |
| pageLimit  | number   | 100                                | Max number of items returned by Xray API. Default is 200, set to another number if you have custom settings.          | Yes      |

