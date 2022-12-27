const {When} = require('@cucumber/cucumber');
let fail = true;

When('passed step', () => {
});

When('failed step', () => {
	throw new Error('failed step')
});

When('step passed after retry', () => {
	if (fail) {
		fail = false;
		throw new Error('failed step')
	}
})
