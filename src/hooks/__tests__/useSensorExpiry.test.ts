import { renderHook } from '@testing-library/react';
import type { SensorData } from '@/types/api';
import { useSensorExpiry } from '../useSensorExpiry';

describe('useSensorExpiry', () => {
  it('should return unknown status when no sensor data', () => {
    const { result } = renderHook(() => useSensorExpiry(undefined));

    expect(result.current.daysToExpire).toBeNull();
    expect(result.current.expiryDate).toBeNull();
    expect(result.current.sensorStatus).toBe('unknown');
  });

  it('should return unknown status when sensor has no activation date', () => {
    const sensor = {
      sn: 'SN123456',
      a: undefined,
      e: 1234567890,
    } as unknown as SensorData;

    const { result } = renderHook(() => useSensorExpiry(sensor));

    expect(result.current.daysToExpire).toBeNull();
    expect(result.current.expiryDate).toBeNull();
    expect(result.current.sensorStatus).toBe('unknown');
  });

  it('should calculate days to expire correctly', () => {
    const sevenDaysAgo = Math.floor(Date.now() / 1000 - 7 * 24 * 60 * 60);
    const sensor = {
      sn: 'SN123456',
      a: sevenDaysAgo,
      e: sevenDaysAgo + 14 * 24 * 60 * 60,
    } as SensorData;

    const { result } = renderHook(() => useSensorExpiry(sensor));

    // Sensor activated 7 days ago, lasts 14 days, so should have ~7 days left
    expect(result.current.daysToExpire).toBeGreaterThan(6);
    expect(result.current.daysToExpire).toBeLessThanOrEqual(8);
    expect(result.current.expiryDate).toBeInstanceOf(Date);
  });

  it('should return normal status when sensor has many days left', () => {
    const twoDaysAgo = Math.floor(Date.now() / 1000 - 2 * 24 * 60 * 60);
    const sensor = {
      sn: 'SN123456',
      a: twoDaysAgo,
      e: twoDaysAgo + 14 * 24 * 60 * 60,
    } as SensorData;

    const { result } = renderHook(() => useSensorExpiry(sensor));

    expect(result.current.sensorStatus).toBe('normal');
    expect(result.current.daysToExpire).toBeGreaterThan(3);
  });

  it('should return warning status when sensor has 2-3 days left', () => {
    const elevenDaysAgo = Math.floor(Date.now() / 1000 - 11 * 24 * 60 * 60);
    const sensor = {
      sn: 'SN123456',
      a: elevenDaysAgo,
      e: elevenDaysAgo + 14 * 24 * 60 * 60,
    } as SensorData;

    const { result } = renderHook(() => useSensorExpiry(sensor));

    expect(result.current.sensorStatus).toBe('warning');
    expect(result.current.daysToExpire).toBeLessThanOrEqual(3);
    expect(result.current.daysToExpire).toBeGreaterThan(1);
  });

  it('should return critical status when sensor has 1 day or less left', () => {
    const thirteenDaysAgo = Math.floor(Date.now() / 1000 - 13 * 24 * 60 * 60);
    const sensor = {
      sn: 'SN123456',
      a: thirteenDaysAgo,
      e: thirteenDaysAgo + 14 * 24 * 60 * 60,
    } as SensorData;

    const { result } = renderHook(() => useSensorExpiry(sensor));

    expect(result.current.sensorStatus).toBe('critical');
    expect(result.current.daysToExpire).toBeLessThanOrEqual(1);
  });

  it('should return negative days when sensor is expired', () => {
    const fifteenDaysAgo = Math.floor(Date.now() / 1000 - 15 * 24 * 60 * 60);
    const sensor = {
      sn: 'SN123456',
      a: fifteenDaysAgo,
      e: fifteenDaysAgo + 14 * 24 * 60 * 60,
    } as SensorData;

    const { result } = renderHook(() => useSensorExpiry(sensor));

    expect(result.current.daysToExpire).toBeLessThan(0);
    expect(result.current.sensorStatus).toBe('critical');
  });

  it('should recalculate when sensor changes', () => {
    const sevenDaysAgo = Math.floor(Date.now() / 1000 - 7 * 24 * 60 * 60);
    const sensor1 = {
      sn: 'SN123456',
      a: sevenDaysAgo,
      e: sevenDaysAgo + 14 * 24 * 60 * 60,
    } as SensorData;

    const { result, rerender } = renderHook(({ sensor }) => useSensorExpiry(sensor), {
      initialProps: { sensor: sensor1 },
    });

    const initialDays = result.current.daysToExpire;

    const twoDaysAgo = Math.floor(Date.now() / 1000 - 2 * 24 * 60 * 60);
    const sensor2 = {
      sn: 'SN789012',
      a: twoDaysAgo,
      e: twoDaysAgo + 14 * 24 * 60 * 60,
    } as SensorData;

    rerender({ sensor: sensor2 });

    expect(result.current.daysToExpire).not.toBe(initialDays);
  });
});
