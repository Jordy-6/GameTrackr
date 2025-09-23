import { TimeSincePipe } from './time-since.pipe';

describe('TimeSincePipe', () => {
  let pipe: TimeSincePipe;

  beforeEach(() => {
    pipe = new TimeSincePipe();
  });

  it('should return empty string for null or undefined values', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should return "Just now" for very recent times', () => {
    const now = new Date();
    const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
    expect(pipe.transform(thirtySecondsAgo)).toBe('Just now');
  });

  it('should return correct format for minutes', () => {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 1 * 60 * 1000);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    expect(pipe.transform(oneMinuteAgo)).toBe('1 minute ago');
    expect(pipe.transform(fiveMinutesAgo)).toBe('5 minutes ago');
  });

  it('should return correct format for hours', () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

    expect(pipe.transform(oneHourAgo)).toBe('1 hour ago');
    expect(pipe.transform(threeHoursAgo)).toBe('3 hours ago');
  });

  it('should return correct format for days', () => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    expect(pipe.transform(oneDayAgo)).toBe('1 day ago');
    expect(pipe.transform(threeDaysAgo)).toBe('3 days ago');
  });

  it('should return correct format for weeks', () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    expect(pipe.transform(oneWeekAgo)).toBe('1 week ago');
    expect(pipe.transform(twoWeeksAgo)).toBe('2 weeks ago');
  });

  it('should return correct format for months', () => {
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    expect(pipe.transform(oneMonthAgo)).toBe('1 month ago');
    expect(pipe.transform(sixMonthsAgo)).toBe('6 months ago');
  });

  it('should return correct format for years', () => {
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const twoYearsAgo = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);

    expect(pipe.transform(oneYearAgo)).toBe('1 year ago');
    expect(pipe.transform(twoYearsAgo)).toBe('2 years ago');
  });

  it('should handle string dates', () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);

    expect(pipe.transform(oneHourAgo.toISOString())).toBe('1 hour ago');
  });

  it('should handle number timestamps', () => {
    const now = new Date();
    const oneHourAgo = now.getTime() - 1 * 60 * 60 * 1000;

    expect(pipe.transform(oneHourAgo)).toBe('1 hour ago');
  });
});
