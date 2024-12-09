import { ContainsNullPipe } from './contains-null.pipe';

describe('ContainsNullPipe', () => {
	it('create an instance', () => {
		const pipe = new ContainsNullPipe();
		expect(pipe).toBeTruthy();
	});
});
