import path from 'path';
import yargs from "yargs";

const config : yargs.Options = {
    alias: 'c',
    demandOption: true,
    default: './xrayConfig.json',
    type: 'string',
    desc: 'Path to your Jira config',
    coerce: (arg: string) => {
        const config: JiraConfig = require(path.resolve(arg));
        if (!config.endpoint || !config.token) {
            throw new Error('Config file must contain your Jira endpoint and access token.');
        }
        return config;
    }
};

export default config;
