import { ZipcodePipe } from './zipcode.pipe';

describe('ZipcodePipe', () => {
  it('create an instance', () => {
    const pipe = new ZipcodePipe();
    expect(pipe).toBeTruthy();
  });
});
