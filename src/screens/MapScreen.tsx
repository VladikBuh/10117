import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CategoryChips,
  type LocationFilter,
} from '../components/locations/CategoryChips';
import { icons } from '../data/assets';
import {
  formatCoordinates,
  getLocationsByCategory,
  LOCATIONS,
  type LocationItem,
} from '../data/locations';
import { useFavorites } from '../hooks/useFavorites';
import { useAppNavigation } from '../navigation/NavigationContext';
import { colors, fonts, layout, radius } from '../constants/theme';

const INITIAL_REGION: Region = {
  latitude: 63.5,
  longitude: 12.0,
  latitudeDelta: 18,
  longitudeDelta: 18,
};

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0b0f26' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6a7ca0' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0b0f26' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#1a2248' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#131a3c' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1a2248' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0b0f26' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#c9a427' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0b0f26' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#131a3c' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#131a3c' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#0d1228' }],
  },
];

export function MapScreen() {
  const insets = useSafeAreaInsets();
  const { openLocationDetail, focusedLocationId, clearFocusedLocation } =
    useAppNavigation();
  const { isFavorite } = useFavorites();
  const mapRef = useRef<MapView>(null);

  const [filter, setFilter] = useState<LocationFilter>('all');
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(
    null,
  );

  const ignoreNextMapPress = useRef(false);

  const filteredLocations = useMemo(() => {
    if (filter === 'all') {
      return LOCATIONS;
    }
    if (filter === 'favorites') {
      return LOCATIONS.filter(location => isFavorite(location.id));
    }
    return getLocationsByCategory(filter);
  }, [filter, isFavorite]);

  const handleMarkerPress = useCallback((location: LocationItem) => {
    ignoreNextMapPress.current = true;
    setSelectedLocation(location);
    mapRef.current?.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 4,
        longitudeDelta: 4,
      },
      300,
    );
  }, []);

  const handleFilterSelect = useCallback((next: LocationFilter) => {
    setFilter(next);
    setSelectedLocation(null);
  }, []);

  useEffect(() => {
    if (!focusedLocationId) {
      return;
    }
    const location = LOCATIONS.find(l => l.id === focusedLocationId);
    if (location) {
      setFilter('all');
      handleMarkerPress(location);
    }
    clearFocusedLocation();
  }, [focusedLocationId, clearFocusedLocation, handleMarkerPress]);

  const handleDismissCallout = useCallback(() => {
    if (ignoreNextMapPress.current) {
      ignoreNextMapPress.current = false;
      return;
    }
    setSelectedLocation(null);
  }, []);

  const handleOpenDetail = useCallback(() => {
    if (selectedLocation) {
      openLocationDetail(selectedLocation.id);
    }
  }, [selectedLocation, openLocationDetail]);

  const markers = useMemo(
    () =>
      filteredLocations.map(location => (
        <Marker
          key={location.id}
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          onPress={() => handleMarkerPress(location)}
          pinColor={colors.button}
          tracksViewChanges={false}
        />
      )),
    [filteredLocations, handleMarkerPress],
  );

  return (
    <View style={styles.MapScreenFacetChassis}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.MapScreenHeader, { paddingTop: insets.top + 18 }]}>
          <Text style={styles.MapScreenTitleFiligree}>Map</Text>
          <View style={styles.MapScreenFilters}>
            <CategoryChips
              activeFilter={filter}
              onSelect={handleFilterSelect}
              showAll
            />
          </View>
        </View>

        <View style={styles.MapScreenMapEnclave}>
          <MapView
            ref={mapRef}
            style={styles.MapScreenMap}
            initialRegion={INITIAL_REGION}
            customMapStyle={DARK_MAP_STYLE}
            onPress={handleDismissCallout}
          >
            {markers}
          </MapView>
        </View>

        {selectedLocation ? (
          <View
            style={[
              styles.MapScreenOverlay,
              {
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              },
            ]}
          >
            <Pressable
              style={styles.MapScreenBackdrop}
              onPress={handleDismissCallout}
            />
            <View style={styles.MapScreenCardWrapper} pointerEvents="box-none">
              <MapCalloutCard
                location={selectedLocation}
                onClose={handleDismissCallout}
                onOpen={handleOpenDetail}
              />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

type MapCalloutCardProps = {
  location: LocationItem;
  onClose: () => void;
  onOpen: () => void;
};

function MapCalloutCard({ location, onClose, onOpen }: MapCalloutCardProps) {
  const coords = formatCoordinates(location.latitude, location.longitude);

  return (
    <View style={styles.CalloutFacetChassis}>
      <Image
        source={location.image}
        style={styles.CalloutImage}
        resizeMode="cover"
      />
      <View style={styles.CalloutBody}>
        <View style={styles.CalloutHeaderLintel}>
          <Text style={styles.CalloutTitleFiligree} numberOfLines={1}>
            {location.name}
          </Text>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={styles.CalloutClosePortico}
          >
            <Text style={styles.CalloutCloseSigil}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.CalloutTag}>
          <Text style={styles.CalloutTagFiligree}>
            {location.tag} ·{' '}
            {location.category === 'mountains'
              ? 'Mountain'
              : location.category === 'water'
              ? 'Water'
              : 'Forest'}
          </Text>
        </View>

        <View style={styles.CalloutCoordsLintel}>
          <Image
            source={icons.pin}
            style={styles.CalloutPinSigil}
            resizeMode="contain"
          />
          <Text style={styles.CalloutCoordsFiligree}>{coords}</Text>
        </View>

        <Pressable
          onPress={onOpen}
          style={({ pressed }) => [
            styles.CalloutOpenPortico,
            pressed && styles.CalloutPressedDim,
          ]}
        >
          <Text style={styles.CalloutOpenFiligree}>Open</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  MapScreenFacetChassis: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  MapScreenHeader: {
    paddingBottom: 12,
    paddingHorizontal: layout.screenPadding,
  },

  MapScreenTitleFiligree: {
    color: colors.title,
    fontFamily: fonts.sansExtraBold,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 33,
  },

  MapScreenFilters: {
    marginTop: 12,
  },

  MapScreenMapEnclave: {
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: layout.screenPadding,
    overflow: 'hidden',
    marginBottom: 20,
  },
  MapScreenMap: {
    flex: 1,
  },

  MapScreenOverlay: {
    position: 'absolute',
    zIndex: 10,
  },
  MapScreenBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,11,11,0.5)',
  },
  MapScreenCardWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  CalloutFacetChassis: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    borderWidth: 1,
    elevation: 8,
    flexDirection: 'row',
    height: 137,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    width: '100%',
  },

  CalloutImage: {
    height: '100%',
    width: 90,
  },
  CalloutBody: {
    flex: 1,
    paddingLeft: 14,
    paddingRight: 12,
    paddingVertical: 12,
  },
  CalloutHeaderLintel: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  CalloutTitleFiligree: {
    color: colors.title,
    flex: 1,
    fontFamily: fonts.sansBold,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16.8,
    marginRight: 8,
  },
  CalloutClosePortico: {
    alignItems: 'center',
    height: 15,
    justifyContent: 'center',
    width: 15,
  },

  CalloutCloseSigil: {
    color: colors.bodyMuted,
    fontSize: 12,
  },
  CalloutTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.tagBg,
    borderRadius: 5,
    marginTop: 5,
    paddingHorizontal: 8,
    paddingVertical: 6.5,
  },
  CalloutTagFiligree: {
    color: colors.button,
    fontFamily: fonts.sansSemiBold,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 15,
  },

  CalloutCoordsLintel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },

  CalloutPinSigil: {
    height: 10,
    tintColor: colors.button,
    width: 10,
  },
  CalloutCoordsFiligree: {
    color: colors.bodyMuted,
    fontFamily: fonts.sansRegular,
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 15,
  },

  CalloutOpenPortico: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.button,
    borderRadius: 8,
    height: 30,
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },

  CalloutOpenFiligree: {
    color: colors.buttonText,
    fontFamily: fonts.sansBold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },

  CalloutPressedDim: {
    opacity: 0.85,
  },
});
