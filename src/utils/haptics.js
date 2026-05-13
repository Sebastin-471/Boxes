import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export const haptics = {
  impact: async (style = ImpactStyle.Medium) => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.impact({ style });
      } catch (e) {
        console.warn('Haptics not available', e);
      }
    }
  },
  success: async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.notification({ type: 'SUCCESS' });
      } catch (e) {
        console.warn('Haptics not available', e);
      }
    }
  },
  error: async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.notification({ type: 'ERROR' });
      } catch (e) {
        console.warn('Haptics not available', e);
      }
    }
  }
};
