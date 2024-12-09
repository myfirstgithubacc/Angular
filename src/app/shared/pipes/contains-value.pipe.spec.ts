import { ContainsValuePipe } from './contains-value.pipe';

describe('ContainsValuePipe', () => {
	it('create an instance', () => {
		const pipe = new ContainsValuePipe();
		expect(pipe).toBeTruthy();
	});
});
