import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {
  LOCATION_CATEGORIES,
  type LocationCategory,
} from '../../data/locations';
import {colors, fonts, radius} from '../../constants/theme';

export type LocationFilter = LocationCategory | 'favorites' | 'all';

type CategoryChipsProps = {
  activeFilter: LocationFilter;
  onSelect: (filter: LocationFilter) => void;
  showAll?: boolean;
};

const FILTERS: {id: LocationFilter; label: string}[] = [
  ...LOCATION_CATEGORIES,
  {id: 'favorites', label: 'Favorites'},
];

export function CategoryChips({
  activeFilter,
  onSelect,
  showAll = false,
}: CategoryChipsProps) {
  const filters = showAll
    ? [{id: 'all' as const, label: 'All'}, ...FILTERS]
    : FILTERS;

  return (
    <View style={styles.CategoryChipsFacetChassis}>
      {filters.map(filter => {
        const isActive = filter.id === activeFilter;

        return (
          <Pressable
            key={filter.id}
            onPress={() => onSelect(filter.id)}
            style={[
              styles.CategoryChipsChip,
              isActive
                ? styles.CategoryChipsChipActive
                : styles.CategoryChipsChipInactive,
            ]}
          >
            <Text
              style={[
                styles.CategoryChipsLabelFiligree,
                isActive
                  ? styles.CategoryChipsLabelActive
                  : styles.CategoryChipsLabelInactive,
              ]}
            >
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  CategoryChipsFacetChassis: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  CategoryChipsChip: {
    borderRadius: radius.chip,
    borderWidth: 1,
    paddingHorizontal: 17,
    paddingVertical: 8,
  },
  CategoryChipsChipActive: {
    backgroundColor: colors.button,
    borderColor: colors.button,
  },
  CategoryChipsChipInactive: {
    backgroundColor: colors.chip,
    borderColor: colors.chipBorder,
  },
  CategoryChipsLabelFiligree: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  CategoryChipsLabelActive: {
    color: colors.buttonText,
  },
  CategoryChipsLabelInactive: {
    color: colors.chipText,
  },
});
