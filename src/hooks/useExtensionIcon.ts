import { useEffect } from 'react';
import type { GlucoseMeasurementExtended } from '@/types/api';

/**
 * Hook to update extension icon based on glucose reading
 * Sends message to background script to update badge icon
 */
export function useExtensionIcon(glucoseItem: GlucoseMeasurementExtended | undefined) {
  useEffect(() => {
    if (!glucoseItem) return;

    const colorMap: Record<number, string> = { 1: 'green', 2: 'yellow', 3: 'orange', 4: 'red' };
    const arrowMap: Record<number, string> = { 1: 'down', 2: 'right-down', 3: 'right', 4: 'right-up', 5: 'up' };

    const color = colorMap[glucoseItem.MeasurementColor];
    const arrow = arrowMap[glucoseItem.TrendArrow];

    if (color && arrow) {
      chrome.runtime.sendMessage({
        action: 'UpdateIcon',
        color,
        arrow,
      });
    }
  }, [glucoseItem]);
}