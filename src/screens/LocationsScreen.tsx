import React, {useMemo, useState} from 'react';
import {ScrollView, StatusBar, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  CategoryChips,
  type LocationFilter,
} from '../components/locations/CategoryChips';
import {LocationCard} from '../components/locations/LocationCard';
import {colors, fonts, layout} from '../constants/theme';
import {getLocationsByCategory, LOCATIONS} from '../data/locations';
import {useFavorites} from '../hooks/useFavorites';
import {useAppNavigation} from '../navigation/NavigationContext';
import {shareLocation} from '../utils/locationActions';

export function LocationsScreen() {
  const insets = useSafeAreaInsets();
  const {openLocationDetail} = useAppNavigation();
  const {isFavorite, toggleFavorite} = useFavorites();
  const [filter, setFilter] = useState<LocationFilter>('mountains');

  const locations = useMemo(() => {
    if (filter === 'favorites') {
      return LOCATIONS.filter(location => isFavorite(location.id));
    }
    if (filter === 'all') {
      return LOCATIONS;
    }
    return getLocationsByCategory(filter);
  }, [filter, isFavorite]);

  return (
    <View style={styles.LocationsScreenFacetChassis}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={[
          styles.LocationsScreenScrollContent,
          {paddingTop: insets.top + 18},
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.LocationsScreenTitleFiligree}>Locations</Text>

        <View style={styles.LocationsScreenChipsEnclave}>
          <CategoryChips activeFilter={filter} onSelect={setFilter} />
        </View>

        <View style={styles.LocationsScreenListLintel}>
          {locations.length === 0 ? (
            <Text style={styles.LocationsScreenEmptyFiligree}>
              {filter === 'favorites'
                ? 'No favorites yet. Tap ★ on a location to save it here.'
                : 'No locations in this category.'}
            </Text>
          ) : (
            locations.map(location => (
              <LocationCard
                key={location.id}
                location={location}
                isFavorite={isFavorite(location.id)}
                onToggleFavorite={() => toggleFavorite(location.id)}
                onShare={() => {
                  shareLocation(location).catch(() => undefined);
                }}
                onOpen={() => openLocationDetail(location.id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  LocationsScreenFacetChassis: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  LocationsScreenScrollContent: {
    gap: 0,
    paddingBottom: 24,
    paddingHorizontal: layout.screenPadding,
  },
  LocationsScreenTitleFiligree: {
    color: colors.title,
    fontFamily: fonts.sansExtraBold,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 33,
    marginBottom: 16,
  },
  LocationsScreenChipsEnclave: {
    marginBottom: 18,
  },
  LocationsScreenListLintel: {
    gap: 12,
  },
  LocationsScreenEmptyFiligree: {
    color: colors.bodyMuted,
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    lineHeight: 20,
    paddingVertical: 24,
    textAlign: 'center',
  },
});
