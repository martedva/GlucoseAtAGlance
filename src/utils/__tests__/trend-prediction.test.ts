import { predictGlucoseTrend, getTrendArrowFromPrediction, getTrendDescription } from '../trend-prediction';

describe('Trend Prediction', () => {
  describe('predictGlucoseTrend', () => {
    it('should return null for empty data', () => {
      const result = predictGlucoseTrend([]);
      expect(result).toBeNull();
    });

    it('should return null for single data point', () => {
      const data = [{ time: new Date(), value: 5.5 }];
      const result = predictGlucoseTrend(data);
      expect(result).toBeNull();
    });

    it('should calculate rising trend', () => {
      const now = Date.now();
      const data = [
        { time: new Date(now - 30 * 60 * 1000), value: 5.0 },
        { time: new Date(now - 15 * 60 * 1000), value: 5.5 },
        { time: new Date(now), value: 6.0 },
      ];

      const result = predictGlucoseTrend(data);

      expect(result).not.toBeNull();
      expect(result!.predictedChange).toBeGreaterThan(0);
      expect(result!.predictedChange15min).toBeGreaterThan(0);
    });

    it('should calculate falling trend', () => {
      const now = Date.now();
      const data = [
        { time: new Date(now - 30 * 60 * 1000), value: 8.0 },
        { time: new Date(now - 15 * 60 * 1000), value: 7.0 },
        { time: new Date(now), value: 6.0 },
      ];

      const result = predictGlucoseTrend(data);

      expect(result).not.toBeNull();
      expect(result!.predictedChange).toBeLessThan(0);
      expect(result!.predictedChange15min).toBeLessThan(0);
    });

    it('should calculate stable trend', () => {
      const now = Date.now();
      const data = [
        { time: new Date(now - 30 * 60 * 1000), value: 6.0 },
        { time: new Date(now - 15 * 60 * 1000), value: 6.0 },
        { time: new Date(now), value: 6.0 },
      ];

      const result = predictGlucoseTrend(data);

      expect(result).not.toBeNull();
      expect(Math.abs(result!.predictedChange)).toBeLessThan(0.1);
    });

    it('should provide confidence level', () => {
      const now = Date.now();
      const data = [
        { time: new Date(now - 30 * 60 * 1000), value: 5.0 },
        { time: new Date(now - 15 * 60 * 1000), value: 5.5 },
        { time: new Date(now), value: 6.0 },
      ];

      const result = predictGlucoseTrend(data);

      expect(result).toHaveProperty('confidence');
      expect(['low', 'medium', 'high']).toContain(result!.confidence);
    });
  });

  describe('getTrendArrowFromPrediction', () => {
    it('should return up-right arrow for fast rising', () => {
      expect(getTrendArrowFromPrediction(0.4)).toBe('↗️');
    });

    it('should return up arrow for rising', () => {
      expect(getTrendArrowFromPrediction(0.2)).toBe('↑');
    });

    it('should return right arrow for stable', () => {
      expect(getTrendArrowFromPrediction(0)).toBe('→');
      expect(getTrendArrowFromPrediction(0.05)).toBe('→');
    });

    it('should return down arrow for falling', () => {
      expect(getTrendArrowFromPrediction(-0.2)).toBe('↓');
    });

    it('should return down-right arrow for fast falling', () => {
      expect(getTrendArrowFromPrediction(-0.4)).toBe('↘️');
    });
  });

  describe('getTrendDescription', () => {
    it('should return "Stable" for minimal change', () => {
      const prediction = {
        predictedValue: 6.0,
        predictedChange: 0.01,
        predictedChange15min: 0.15,
        predictedChange30min: 0.3,
        predictedChange60min: 0.6,
        confidence: 'high' as const,
      };

      expect(getTrendDescription(prediction)).toBe('Stable');
    });

    it('should return rising description', () => {
      const prediction = {
        predictedValue: 7.5,
        predictedChange: 0.2,
        predictedChange15min: 3.0,
        predictedChange30min: 6.0,
        predictedChange60min: 12.0,
        confidence: 'high' as const,
      };

      expect(getTrendDescription(prediction)).toContain('rising');
    });

    it('should return falling description', () => {
      const prediction = {
        predictedValue: 4.5,
        predictedChange: -0.2,
        predictedChange15min: -3.0,
        predictedChange30min: -6.0,
        predictedChange60min: -12.0,
        confidence: 'high' as const,
      };

      expect(getTrendDescription(prediction)).toContain('falling');
    });
  });
});