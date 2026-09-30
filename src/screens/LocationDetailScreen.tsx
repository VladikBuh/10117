import React, { useMemo } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { icons } from '../data/assets';
import { formatCoordinates, getLocationById } from '../data/locations';
import { useFavorites } from '../hooks/useFavorites';
import { useAppNavigation } from '../navigation/NavigationContext';
import { colors, fonts, layout, radius } from '../constants/theme';

type LocationDetailScreenProps = {
  locationId: string;
};

export function LocationDetailScreen({
  locationId,
}: LocationDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { goBack, openLocationOnMap } = useAppNavigation();
  const { isFavorite, toggleFavorite } = useFavorites();

  const location = useMemo(() => getLocationById(locationId), [locationId]);
  const favorite = location ? isFavorite(location.id) : false;

  if (!location) {
    return (
      <View style={styles.LocationDetailScreenFacetChassis}>
        <Text style={styles.LocationDetailScreenBodyFiligree}>
          Location not found.
        </Text>
      </View>
    );
  }

  const coords = formatCoordinates(location.latitude, location.longitude);

  return (
    <View style={styles.LocationDetailScreenFacetChassis}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={[
          styles.LocationDetailScreenScrollContent,
          {
            paddingBottom: 32,
            paddingTop: insets.top + 18,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.LocationDetailScreenHeaderLintel}>
          <Pressable
            onPress={goBack}
            hitSlop={12}
            style={({ pressed }) => [
              styles.LocationDetailScreenBackPortico,
              pressed && styles.LocationDetailScreenPressedDim,
            ]}
          >
            <Image
              source={icons.back}
              style={styles.LocationDetailScreenBackSigil}
              resizeMode="contain"
            />
          </Pressable>
          <Text
            style={styles.LocationDetailScreenTitleFiligree}
            numberOfLines={1}
          >
            {location.name}
          </Text>
          <Pressable
            onPress={() => toggleFavorite(location.id)}
            hitSlop={12}
            style={({ pressed }) => [
              styles.LocationDetailScreenFavoritePortico,
              pressed && styles.LocationDetailScreenPressedDim,
            ]}
          >
            <Text
              style={[
                styles.LocationDetailScreenFavoriteFiligree,
                favorite && styles.LocationDetailScreenFavoriteActiveFiligree,
              ]}
            >
              {favorite ? '★' : '☆'}
            </Text>
          </Pressable>
        </View>

        <Image
          source={location.image}
          style={styles.LocationDetailScreenHeroImage}
          resizeMode="cover"
        />

        <View style={styles.LocationDetailScreenContent}>
          <View style={styles.LocationDetailScreenCoordsLintel}>
            <Image
              source={icons.pinDetail}
              style={styles.LocationDetailScreenPinSigil}
              resizeMode="contain"
            />
            <Text style={styles.LocationDetailScreenCoordsFiligree}>
              {coords}
            </Text>
          </View>

          <Text style={styles.LocationDetailScreenLeadFiligree}>
            {location.paragraphs[0]}
          </Text>
          <Text style={styles.LocationDetailScreenBodyFiligree}>
            {location.paragraphs[1]}
          </Text>

          <Pressable
            onPress={() => {
              openLocationOnMap(location.id);
            }}
            style={({ pressed }) => [
              styles.LocationDetailScreenMapsPortico,
              pressed && styles.LocationDetailScreenPressedDim,
            ]}
          >
            <Image
              source={icons.maps}
              style={styles.LocationDetailScreenMapsSigil}
              resizeMode="contain"
            />
            <Text style={styles.LocationDetailScreenMapsFiligree}>
              Open in Maps
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  LocationDetailScreenFacetChassis: {
    backgroundColor: colors.surface,
    flex: 1,
  },

  LocationDetailScreenScrollContent: {
    flexGrow: 1,
  },
  LocationDetailScreenHeaderLintel: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: layout.screenPadding,
  },

  LocationDetailScreenBackPortico: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    marginRight: 6,
    width: 32,
  },

  LocationDetailScreenBackSigil: {
    height: 18,
    tintColor: colors.title,
    transform: [{ rotate: '-90deg' }],
    width: 18,
  },
  LocationDetailScreenTitleFiligree: {
    color: colors.title,
    flex: 1,
    fontFamily: fonts.sansExtraBold,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 33,
  },
  LocationDetailScreenFavoritePortico: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    marginLeft: 6,
    width: 32,
  },
  LocationDetailScreenFavoriteFiligree: {
    color: colors.bodyMuted,
    fontSize: 22,
    lineHeight: 26,
  },
  LocationDetailScreenFavoriteActiveFiligree: {
    color: colors.button,
  },
  LocationDetailScreenHeroImage: {
    backgroundColor: '#1e2a50',
    height: layout.detailImageHeight,
    width: '100%',
  },
  LocationDetailScreenContent: {
    paddingHorizontal: 21,
    paddingTop: 20,
  },
  LocationDetailScreenCoordsLintel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginBottom: 14,
  },

  LocationDetailScreenPinSigil: {
    height: 11,
    tintColor: colors.button,
    width: 11,
  },
  LocationDetailScreenCoordsFiligree: {
    color: colors.bodyMuted,
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
  },
  LocationDetailScreenLeadFiligree: {
    color: colors.bodyBright,
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 22.75,
    marginBottom: 10,
  },

  LocationDetailScreenBodyFiligree: {
    color: colors.bodyMuted,
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 22.75,
  },
  LocationDetailScreenMapsPortico: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.button,
    borderRadius: radius.maps,
    flexDirection: 'row',
    gap: 8,
    height: 47,
    justifyContent: 'center',
    marginTop: 20,
    width: 295,
  },

  LocationDetailScreenMapsSigil: {
    height: 15,
    tintColor: colors.buttonText,
    width: 15,
  },
  LocationDetailScreenMapsFiligree: {
    color: colors.buttonText,
    fontFamily: fonts.sansBold,
    fontSize: 14,
    fontWeight: '700',
  },

  LocationDetailScreenPressedDim: {
    opacity: 0.85,
  },
});
