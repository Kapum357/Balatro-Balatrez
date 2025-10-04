// The function 'useTabBadge' is currently unused in the project. Consider removing it or integrating it where necessary.
// hooks/useTabBadge.ts
import * as Haptics from 'expo-haptics';
import { useState } from 'react';

export function useTabBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  const updateBadge = (count: number) => {
    setUnreadCount(count);
    if (count > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return {
    unreadCount,
    updateBadge,
    tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
  };
}