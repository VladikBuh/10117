import React from 'react';

import {FavoritesProvider} from '../hooks/useFavorites';
import {AppShell} from './AppShell';
import {NavigationProvider} from './NavigationContext';

export function AppNavigator() {
  return (
    <NavigationProvider>
      <FavoritesProvider>
        <AppShell />
      </FavoritesProvider>
    </NavigationProvider>
  );
}
