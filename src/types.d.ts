declare module 'gherkin-parse';
declare module 'cli-progress';

declare interface JiraConfig {
    endpoint: string,
    token: string
}

declare interface TestResult {
    testKey: string,
    status: string,
    examples?: string[]
}
