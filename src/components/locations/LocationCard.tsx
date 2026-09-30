import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { icons } from '../../data/assets';
import { formatCoordinates, type LocationItem } from '../../data/locations';

import { colors, fonts, radius } from '../../constants/theme';

type LocationCardProps = {
  location: LocationItem;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onShare: () => void;
  onOpen: () => void;
};

export function LocationCard({
  location,
  isFavorite = false,
  onToggleFavorite,
  onShare,
  onOpen,
}: LocationCardProps) {
  const coords = formatCoordinates(location.latitude, location.longitude);

  return (
    <View style={styles.LocationCardFacetChassis}>
      <View style={styles.LocationCardImageEnclave}>
        <Image
          source={location.image}
          style={styles.LocationCardImage}
          resizeMode="cover"
        />
        {onToggleFavorite ? (
          <Pressable
            onPress={onToggleFavorite}
            hitSlop={8}
            style={({pressed}) => [
              styles.LocationCardFavoritePortico,
              pressed && styles.LocationCardButtonPressedDim,
            ]}
          >
            <Text
              style={[
                styles.LocationCardFavoriteFiligree,
                isFavorite && styles.LocationCardFavoriteActiveFiligree,
              ]}
            >
              {isFavorite ? '★' : '☆'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.LocationCardBody}>
        <View style={styles.LocationCardTopLintel}>
          <View style={styles.LocationCardTextEnclave}>
            <Text style={styles.LocationCardTitleFiligree} numberOfLines={1}>
              {location.name}
            </Text>
            <View style={styles.LocationCardCoordsLintel}>
              <Image
                source={icons.pin}
                style={styles.LocationCardPinSigil}
                resizeMode="contain"
              />
              <Text style={styles.LocationCardCoordsFiligree}>{coords}</Text>
            </View>
          </View>

          <View style={styles.LocationCardTag}>
            <Text style={styles.LocationCardTagFiligree}>{location.tag}</Text>
          </View>
        </View>

        <View style={styles.LocationCardActionPortico}>
          <Pressable
            onPress={onShare}
            style={({ pressed }) => [
              styles.LocationCardShareButton,
              pressed && styles.LocationCardButtonPressedDim,
            ]}
          >
            <Image
              source={icons.share}
              style={styles.LocationCardShareSigil}
              resizeMode="contain"
            />
            <Text style={styles.LocationCardShareFiligree}>Share</Text>
          </Pressable>

          <Pressable
            onPress={onOpen}
            style={({ pressed }) => [
              styles.LocationCardOpenButton,
              pressed && styles.LocationCardButtonPressedDim,
            ]}
          >
            <Image
              source={icons.external}
              style={styles.LocationCardOpenSigil}
              resizeMode="contain"
            />
            <Text style={styles.LocationCardOpenFiligree}>Open</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  LocationCardFacetChassis: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
  },

  LocationCardImageEnclave: {
    position: 'relative',
  },
  LocationCardImage: {
    backgroundColor: '#1e2a50',
    height: 114,
    width: '100%',
  },
  LocationCardFavoritePortico: {
    alignItems: 'center',
    backgroundColor: 'rgba(6, 9, 26, 0.72)',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: 10,
    top: 10,
    width: 32,
  },
  LocationCardFavoriteFiligree: {
    color: colors.bodyMuted,
    fontSize: 18,
    lineHeight: 20,
  },
  LocationCardFavoriteActiveFiligree: {
    color: colors.button,
  },
  LocationCardBody: {
    gap: 0,
    paddingBottom: 14,
    paddingHorizontal: 14,
    paddingTop: 12,
  },

  LocationCardTopLintel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  LocationCardTextEnclave: {
    flex: 1,
    paddingRight: 8,
  },
  LocationCardTitleFiligree: {
    color: colors.title,
    fontFamily: fonts.sansBold,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22.5,
  },

  LocationCardCoordsLintel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 5,
  },

  LocationCardPinSigil: {
    height: 10,
    tintColor: colors.button,
    width: 10,
  },
  LocationCardCoordsFiligree: {
    color: colors.bodyMuted,
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 16.5,
  },
  LocationCardTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.tagBg,
    borderRadius: radius.tag,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  LocationCardTagFiligree: {
    color: colors.button,
    fontFamily: fonts.sansSemiBold,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 15,
  },

  LocationCardActionPortico: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },

  LocationCardShareButton: {
    alignItems: 'center',
    borderColor: colors.cardBorder,
    borderRadius: radius.action,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    height: 36,
    justifyContent: 'center',
  },
  LocationCardOpenButton: {
    alignItems: 'center',
    backgroundColor: colors.button,
    borderRadius: radius.action,
    flex: 2,
    flexDirection: 'row',
    gap: 5,
    height: 36,
    justifyContent: 'center',
  },

  LocationCardButtonPressedDim: {
    opacity: 0.85,
  },

  LocationCardShareSigil: {
    height: 12,
    tintColor: colors.bodyMuted,
    width: 12,
  },
  LocationCardShareFiligree: {
    color: colors.bodyMuted,
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    fontWeight: '600',
  },

  LocationCardOpenSigil: {
    height: 12,
    tintColor: colors.buttonText,
    width: 12,
  },

  LocationCardOpenFiligree: {
    color: colors.buttonText,
    fontFamily: fonts.sansBold,
    fontSize: 12,
    fontWeight: '700',
  },
});
