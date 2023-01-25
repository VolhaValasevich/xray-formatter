declare module 'gherkin-parse';

declare interface JiraConfig {
    endpoint: string,
    token: string,
    customFields?: CustomFields
}

declare interface CustomFields {
    testTypeField: string,
    cucumberTypeId: string,
    scenarioTypeField: string,
    scenarioTypeId: string,
    scenarioOutlineTypeId: string,
    stepsField: string
}

declare interface TestResult {
    testKey: string,
    status: string,
    examples?: string[]
}
