import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppSlider } from '../components/inputs/AppSlider';
import { colors, fonts, layout } from '../constants/theme';

type FlashlightMode = 'white' | 'red' | 'sos' | 'beacon';

const MODE_LABELS: Record<FlashlightMode, string> = {
  white: 'WHITE MODE',
  red: 'RED MODE',
  sos: 'STROBE MODE',
  beacon: 'BEACON MODE',
};

const MODE_COLORS: Record<FlashlightMode, string> = {
  white: '#FAF8F2',
  red: '#FF2D2D',
  sos: '#FAF8F2',
  beacon: '#FAF8F2',
};

const DARK_PANEL = '#0b0f26';

export function FlashlightScreen() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<FlashlightMode>('white');
  const [brightness, setBrightness] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const stopPulse = useCallback(() => {
    pulseLoop.current?.stop();
    pulseLoop.current = null;
    pulseAnim.setValue(1);
  }, [pulseAnim]);

  const startSos = useCallback(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.step0,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.step0,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.step0,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.step0,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.step0,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.step0,
          useNativeDriver: false,
        }),
      ]),
    );
    pulseLoop.current = anim;
    anim.start();
  }, [pulseAnim]);

  const startBeacon = useCallback(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 450,
          easing: Easing.step0,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1600,
          easing: Easing.step0,
          useNativeDriver: false,
        }),
      ]),
    );
    pulseLoop.current = anim;
    anim.start();
  }, [pulseAnim]);

  useEffect(() => {
    stopPulse();
    if (mode === 'sos') {
      startSos();
    } else if (mode === 'beacon') {
      startBeacon();
    }
    return () => stopPulse();
  }, [mode, startSos, startBeacon, stopPulse]);

  const selectMode = (m: FlashlightMode) => setMode(m);

  const isPulsing = mode === 'sos' || mode === 'beacon';

  const modeSubtitle =
    mode === 'white'
      ? `White mode · ${Math.round(brightness * 100)}% brightness`
      : mode === 'red'
      ? `Red night mode · ${Math.round(brightness * 100)}% brightness`
      : mode === 'sos'
      ? `SOS strobe · ${Math.round(brightness * 100)}% brightness`
      : `Beacon · ${Math.round(brightness * 100)}% brightness`;

  const panelBg = isPulsing
    ? pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [DARK_PANEL, MODE_COLORS[mode]],
      })
    : MODE_COLORS[mode];

  const renderLightPanel = (isFullscreen: boolean) => (
    <Animated.View
      style={[
        styles.FlashlightScreenPanelFacetChassis,
        isFullscreen && styles.FlashlightScreenFullscreenPanel,
        {
          backgroundColor: panelBg,
          opacity: isPulsing ? 1 : brightness,
        },
      ]}
    >
      {!isFullscreen ? (
        <>
          <View style={styles.FlashlightScreenPanelIconEnclave}>
            {mode === 'white' && (
              <Text style={styles.FlashlightScreenPanelBulbSigil}>💡</Text>
            )}
            {mode === 'red' && (
              <View style={styles.FlashlightScreenPanelRedGlowEnclave}>
                <View style={styles.FlashlightScreenPanelRedGlowCore} />
              </View>
            )}
            {mode === 'sos' && (
              <Text style={styles.FlashlightScreenPanelSosSigil}>⚠️</Text>
            )}
            {mode === 'beacon' && (
              <Text style={styles.FlashlightScreenPanelSosSigil}>🔆</Text>
            )}
          </View>
          <View style={styles.FlashlightScreenPanelBadgeEnclave}>
            <Text style={styles.FlashlightScreenPanelBadgeFiligree}>
              {MODE_LABELS[mode]}
            </Text>
          </View>
          <View style={styles.FlashlightScreenPanelHintEnclave}>
            <Text style={styles.FlashlightScreenPanelHintFiligree}>
              Tap for full screen
            </Text>
          </View>
        </>
      ) : null}
    </Animated.View>
  );

  return (
    <View style={styles.FlashlightScreenFacetChassis}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.FlashlightScreenHeaderInset,
            { paddingTop: insets.top + 18 },
          ]}
        >
          <Text style={styles.FlashlightScreenTitleFiligree}>Flashlight</Text>
          <Text style={styles.FlashlightScreenSubtitleFiligree}>
            {modeSubtitle}
          </Text>
        </View>

        <View style={styles.FlashlightScreenPanelEnclave}>
          <Pressable onPress={() => setFullscreen(true)}>
            {renderLightPanel(false)}
          </Pressable>
        </View>

        <View style={styles.FlashlightScreenBrightnessFacetChassis}>
          <View style={styles.FlashlightScreenBrightnessHeaderLintel}>
            <Text style={styles.FlashlightScreenBrightnessLabelFiligree}>
              Brightness
            </Text>
            <Text style={styles.FlashlightScreenBrightnessValueFiligree}>
              {Math.round(brightness * 100)}%
            </Text>
          </View>
          <AppSlider
            style={styles.FlashlightScreenBrightnessSliderControl}
            minimumValue={0.05}
            maximumValue={1}
            value={brightness}
            onValueChange={setBrightness}
            minimumTrackTintColor={colors.button}
            maximumTrackTintColor={colors.cardBorder}
            thumbTintColor={colors.button}
          />
          <View style={styles.FlashlightScreenBrightnessSliderLabelsLintel}>
            <Text style={styles.FlashlightScreenBrightnessSliderLabelFiligree}>
              0%
            </Text>
            <Text style={styles.FlashlightScreenBrightnessSliderLabelFiligree}>
              100%
            </Text>
          </View>
        </View>

        <View style={styles.FlashlightScreenModeEnclave}>
          <Text style={styles.FlashlightScreenModeTitleFiligree}>Mode</Text>

          <ModeOption
            title="White Screen"
            subtitle="Full brightness white light"
            active={mode === 'white'}
            icon={<Text style={styles.FlashlightScreenModeBulbSigil}>💡</Text>}
            onPress={() => selectMode('white')}
          />

          <ModeOption
            title="Red Night Mode"
            subtitle="Preserve night vision"
            active={mode === 'red'}
            titleColor="#C94A4A"
            icon={<View style={styles.FlashlightScreenModeRedDot} />}
            onPress={() => selectMode('red')}
          />

          <ModeOption
            title="SOS Strobe"
            subtitle="Emergency signal · Morse code"
            active={mode === 'sos'}
            titleColor="#C94A4A"
            icon={<Text style={styles.FlashlightScreenModeSosSigil}>⚠️</Text>}
            onPress={() => selectMode('sos')}
          />

          <ModeOption
            title="Beacon"
            subtitle="Slow bright flashes · find me"
            active={mode === 'beacon'}
            titleColor={colors.button}
            icon={<Text style={styles.FlashlightScreenModeSosSigil}>🔆</Text>}
            onPress={() => selectMode('beacon')}
          />
        </View>
      </ScrollView>

      <Modal
        visible={fullscreen}
        animationType="fade"
        presentationStyle="fullScreen"
        onRequestClose={() => setFullscreen(false)}
      >
        <Pressable
          style={styles.FlashlightScreenFullscreenFacetChassis}
          onPress={() => setFullscreen(false)}
        >
          <StatusBar hidden />
          {renderLightPanel(true)}
          <View
            style={[
              styles.FlashlightScreenFullscreenHintEnclave,
              { paddingBottom: insets.bottom + 24 },
            ]}
            pointerEvents="none"
          >
            <Text style={styles.FlashlightScreenFullscreenHintFiligree}>
              Tap to exit
            </Text>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

type ModeOptionProps = {
  title: string;
  subtitle: string;
  active: boolean;
  icon: React.ReactNode;
  titleColor?: string;
  onPress: () => void;
};

function ModeOption({
  title,
  subtitle,
  active,
  icon,
  titleColor,
  onPress,
}: ModeOptionProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.FlashlightModeOptionFacetChassis,
        active && styles.FlashlightModeOptionFacetChassisActive,
      ]}
    >
      <View style={styles.FlashlightModeOptionTextEnclave}>
        <Text
          style={[
            styles.FlashlightModeOptionTitleFiligree,
            active
              ? { color: colors.surface }
              : titleColor
              ? { color: titleColor }
              : null,
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.FlashlightModeOptionSubtitleFiligree,
            active && { color: '#6a7070' },
          ]}
        >
          {subtitle}
        </Text>
      </View>
      {active ? (
        <View style={styles.FlashlightModeOptionBadgeEnclave}>
          <Text style={styles.FlashlightModeOptionBadgeFiligree}>ACTIVE</Text>
        </View>
      ) : (
        <View style={styles.FlashlightModeOptionIconEnclave}>{icon}</View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  FlashlightScreenFacetChassis: {
    backgroundColor: colors.surface,
    flex: 1,
  },

  FlashlightScreenHeaderInset: {
    paddingBottom: 8,
    paddingHorizontal: layout.screenPadding,
  },

  FlashlightScreenTitleFiligree: {
    color: colors.title,
    fontFamily: fonts.sansExtraBold,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 33,
  },

  FlashlightScreenSubtitleFiligree: {
    color: colors.bodyMuted,
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
  },
  FlashlightScreenPanelEnclave: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 12,
  },
  FlashlightScreenPanelFacetChassis: {
    borderRadius: 16,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  FlashlightScreenFullscreenPanel: {
    borderRadius: 0,
    flex: 1,
    height: '100%',
  },

  FlashlightScreenFullscreenFacetChassis: {
    backgroundColor: colors.surface,
    flex: 1,
  },

  FlashlightScreenFullscreenHintEnclave: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    alignItems: 'center',
  },

  FlashlightScreenFullscreenHintFiligree: {
    backgroundColor: 'rgba(11, 15, 38, 0.45)',
    borderRadius: 12,
    color: '#FAF8F2',
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  FlashlightScreenPanelIconEnclave: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },

  FlashlightScreenPanelBulbSigil: {
    fontSize: 48,
  },

  FlashlightScreenPanelRedGlowEnclave: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 45, 45, 0.3)',
    borderRadius: 50,
    height: 100,
    justifyContent: 'center',
    width: 100,
  },
  FlashlightScreenPanelRedGlowCore: {
    backgroundColor: '#8B0000',
    borderRadius: 25,
    height: 50,
    width: 50,
  },
  FlashlightScreenPanelSosSigil: {
    fontSize: 48,
  },

  FlashlightScreenPanelBadgeEnclave: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 12,
    bottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    position: 'absolute',
    right: 14,
  },

  FlashlightScreenPanelBadgeFiligree: {
    color: colors.title,
    fontFamily: fonts.sansSemiBold,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
  },

  FlashlightScreenPanelHintEnclave: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 12,
    bottom: 14,
    left: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    position: 'absolute',
  },

  FlashlightScreenPanelHintFiligree: {
    color: colors.title,
    fontFamily: fonts.sansSemiBold,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
  },

  FlashlightScreenBrightnessFacetChassis: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: layout.screenPadding,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  FlashlightScreenBrightnessHeaderLintel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  FlashlightScreenBrightnessLabelFiligree: {
    color: colors.title,
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    fontWeight: '600',
  },

  FlashlightScreenBrightnessValueFiligree: {
    color: colors.button,
    fontFamily: fonts.sansExtraBold,
    fontSize: 16,
    fontWeight: '800',
  },

  FlashlightScreenBrightnessSliderControl: {
    height: 40,
    marginTop: 4,
  },
  FlashlightScreenBrightnessSliderLabelsLintel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  FlashlightScreenBrightnessSliderLabelFiligree: {
    color: colors.bodyMuted,
    fontFamily: fonts.sansRegular,
    fontSize: 10,
  },
  FlashlightScreenModeEnclave: {
    marginTop: 16,
    paddingBottom: 20,
    paddingHorizontal: layout.screenPadding,
  },

  FlashlightScreenModeTitleFiligree: {
    color: colors.title,
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },

  FlashlightModeOptionFacetChassis: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  FlashlightModeOptionFacetChassisActive: {
    backgroundColor: '#FAF8F2',
    borderColor: '#FAF8F2',
  },
  FlashlightModeOptionTextEnclave: {
    flex: 1,
  },
  FlashlightModeOptionTitleFiligree: {
    color: colors.title,
    fontFamily: fonts.sansBold,
    fontSize: 14,
    fontWeight: '700',
  },

  FlashlightModeOptionSubtitleFiligree: {
    color: colors.bodyMuted,
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    marginTop: 2,
  },
  FlashlightScreenModeBulbSigil: {
    fontSize: 22,
  },

  FlashlightModeOptionIconEnclave: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
  },
  FlashlightScreenModeRedDot: {
    backgroundColor: '#C94A4A',
    borderRadius: 10,
    height: 20,
    width: 20,
  },
  FlashlightScreenModeSosSigil: {
    fontSize: 22,
  },

  FlashlightModeOptionBadgeEnclave: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },

  FlashlightModeOptionBadgeFiligree: {
    color: colors.title,
    fontFamily: fonts.sansSemiBold,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
});
