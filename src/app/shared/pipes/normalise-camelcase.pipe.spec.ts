import { NormaliseCamelcasePipe } from './normalise-camelcase.pipe';

describe('NormaliseCamelcasePipe', () => {
	it('create an instance', () => {
		const pipe = new NormaliseCamelcasePipe();
		expect(pipe).toBeTruthy();
	});
});
