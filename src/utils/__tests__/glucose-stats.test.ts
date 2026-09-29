import { describe, it, expect } from '@jest/globals';
import { calculateGlucoseStats, filterDataByPeriod, getTirBadge } from '../glucose-stats';

describe('glucose-stats', () => {
  const mockData = [
    { time: new Date(Date.now() - 1000 * 60 * 15), value: 6.0 },
    { time: new Date(Date.now() - 1000 * 60 * 30), value: 7.5 },
    { time: new Date(Date.now() - 1000 * 60 * 45), value: 8.2 },
    { time: new Date(Date.now() - 1000 * 60 * 60), value: 5.5 },
    { time: new Date(Date.now() - 1000 * 60 * 75), value: 12.0 },
  ];

  describe('calculateGlucoseStats', () => {
    it('returns null for insufficient data', () => {
      const result = calculateGlucoseStats(
        [{ time: new Date(), value: 7.0 }],
        70,
        180,
        'Test'
      );
      expect(result).toBeNull();
    });

    it('returns null for empty data', () => {
      const result = calculateGlucoseStats([], 70, 180, 'Test');
      expect(result).toBeNull();
    });

    it('returns null for 2 readings', () => {
      const result = calculateGlucoseStats(
        [
          { time: new Date(), value: 7.0 },
          { time: new Date(), value: 8.0 },
        ],
        70,
        180,
        'Test'
      );
      expect(result).toBeNull();
    });

    it('calculates correct average', () => {
      const result = calculateGlucoseStats(mockData, 70, 180, 'Test');
      expect(result).not.toBeNull();
      // Average: (6.0 + 7.5 + 8.2 + 5.5 + 12.0) / 5 = 7.84
      expect(result?.averageGlucose).toBeCloseTo(7.84, 2);
    });

    it('calculates time in range correctly', () => {
      const result = calculateGlucoseStats(mockData, 70, 180, 'Test');
      expect(result).not.toBeNull();
      // Target range: 70-180 mg/dL = 3.88-9.99 mmol/L
      // In range: 6.0, 7.5, 8.2, 5.5 (4 out of 5)
      // Out of range: 12.0 (1 out of 5)
      expect(result?.timeInRange).toBe(80);
    });

    it('calculates min and max correctly', () => {
      const result = calculateGlucoseStats(mockData, 70, 180, 'Test');
      expect(result).not.toBeNull();
      expect(result?.minGlucose).toBe(5.5);
      expect(result?.maxGlucose).toBe(12.0);
    });

    it('calculates standard deviation', () => {
      const result = calculateGlucoseStats(mockData, 70, 180, 'Test');
      expect(result).not.toBeNull();
      expect(result?.standardDeviation).toBeGreaterThan(0);
    });

    it('includes period label', () => {
      const result = calculateGlucoseStats(mockData, 70, 180, 'Last 12 Hours');
      expect(result).not.toBeNull();
      expect(result?.periodLabel).toBe('Last 12 Hours');
    });

    it('calculates time below range', () => {
      const result = calculateGlucoseStats(mockData, 70, 180, 'Test');
      expect(result).not.toBeNull();
      // All readings are above 3.88 mmol/L (70 mg/dL), so 0% below
      expect(result?.timeBelowRange).toBe(0);
    });

    it('calculates time above range', () => {
      const result = calculateGlucoseStats(mockData, 70, 180, 'Test');
      expect(result).not.toBeNull();
      // 12.0 is above 9.99 mmol/L (180 mg/dL), so 20% above
      expect(result?.timeAboveRange).toBe(20);
    });
  });

  describe('filterDataByPeriod', () => {
    it('filters data by hours', () => {
      const now = Date.now();
      const data = [
        { time: new Date(now - 1000 * 60 * 30), value: 6.0 },   // 30 min ago
        { time: new Date(now - 1000 * 60 * 90), value: 7.0 },   // 90 min ago
        { time: new Date(now - 1000 * 60 * 150), value: 8.0 },  // 150 min ago
        { time: new Date(now - 1000 * 60 * 300), value: 9.0 },  // 300 min ago (5 hours)
      ];

      // Filter to last 2 hours (120 minutes)
      const filtered = filterDataByPeriod(data, 2);
      expect(filtered.length).toBe(2);
      expect(filtered[0].value).toBe(6.0);
      expect(filtered[1].value).toBe(7.0);
    });

    it('returns empty array for very short period', () => {
      const now = Date.now();
      const data = [
        { time: new Date(now - 1000 * 60 * 30), value: 6.0 },
        { time: new Date(now - 1000 * 60 * 60), value: 7.0 },
      ];

      const filtered = filterDataByPeriod(data, 0.1); // 6 minutes
      expect(filtered.length).toBe(0);
    });

    it('returns all data for long period', () => {
      const now = Date.now();
      const data = [
        { time: new Date(now - 1000 * 60 * 30), value: 6.0 },
        { time: new Date(now - 1000 * 60 * 60), value: 7.0 },
      ];

      const filtered = filterDataByPeriod(data, 24); // 24 hours
      expect(filtered.length).toBe(2);
    });
  });

  describe('getTirBadge', () => {
    it('returns green for excellent TIR (>=70%)', () => {
      expect(getTirBadge(75)).toEqual({ color: '#4caf50', label: 'Excellent' });
      expect(getTirBadge(70)).toEqual({ color: '#4caf50', label: 'Excellent' });
      expect(getTirBadge(100)).toEqual({ color: '#4caf50', label: 'Excellent' });
    });

    it('returns yellow for good TIR (50-70%)', () => {
      expect(getTirBadge(60)).toEqual({ color: '#ff9800', label: 'Good' });
      expect(getTirBadge(50)).toEqual({ color: '#ff9800', label: 'Good' });
      expect(getTirBadge(69.9)).toEqual({ color: '#ff9800', label: 'Good' });
    });

    it('returns red for needs attention (<50%)', () => {
      expect(getTirBadge(40)).toEqual({ color: '#f44336', label: 'Needs Attention' });
      expect(getTirBadge(0)).toEqual({ color: '#f44336', label: 'Needs Attention' });
      expect(getTirBadge(49.9)).toEqual({ color: '#f44336', label: 'Needs Attention' });
    });
  });
});