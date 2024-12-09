import { CountryPhonePipe } from './country-phone.pipe';

describe('CountryPhonePipe', () => {
	it('create an instance', () => {
		const pipe = new CountryPhonePipe();
		expect(pipe).toBeTruthy();
	});
});
