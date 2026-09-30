import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppSlider } from '../components/inputs/AppSlider';
import { colors, fonts, layout } from '../constants/theme';
import {
  CHECKLIST_PRESETS,
  createChecklistItem,
  type ChecklistPreset,
} from '../data/checklists';
import { createAppSound, type AppSound } from '../utils/appSound';
import {
  loadChecklistStorage,
  saveChecklistStorage,
} from '../utils/checklistStorage';

const VOLUME_BAR_HEIGHTS = [
  4, 7, 10, 14, 18, 22, 26, 30, 28, 24, 20, 16, 20, 24, 28, 30, 26, 22, 18, 14,
];

const FREQ_MIN = 15000;
const FREQ_MAX = 20000;

const REPELLER_SOUND = require('../assets/freesound_community_generic_censor_tone_104518.mp3');

const ALARM_SOUND = require('../assets/dragon_studio_animal_grunt_382728.mp3');

export function SafetyScreen() {
  const insets = useSafeAreaInsets();
  const [repellerOn, setRepellerOn] = useState(false);
  const [frequency, setFrequency] = useState(17500);

  const [alarmPlaying, setAlarmPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [customChecklists, setCustomChecklists] = useState<ChecklistPreset[]>(
    [],
  );
  const [activeChecklistId, setActiveChecklistId] = useState(
    CHECKLIST_PRESETS[0].id,
  );
  const [checkedByPreset, setCheckedByPreset] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [newItemLabel, setNewItemLabel] = useState('');
  const [checklistsHydrated, setChecklistsHydrated] = useState(false);

  const repellerSoundRef = useRef<AppSound | null>(null);
  const alarmSoundRef = useRef<AppSound | null>(null);

  const alarmPlayingRef = useRef(false);

  const allChecklists = useMemo(
    () => [...CHECKLIST_PRESETS, ...customChecklists],
    [customChecklists],
  );

  useEffect(() => {
    let cancelled = false;

    loadChecklistStorage().then(stored => {
      if (cancelled) {
        return;
      }
      if (stored) {
        setCustomChecklists(stored.customChecklists);
        setCheckedByPreset(stored.checkedByPreset);
        const knownIds = new Set([
          ...CHECKLIST_PRESETS.map(item => item.id),
          ...stored.customChecklists.map(item => item.id),
        ]);
        if (
          stored.activeChecklistId &&
          knownIds.has(stored.activeChecklistId)
        ) {
          setActiveChecklistId(stored.activeChecklistId);
        }
      }
      setChecklistsHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!checklistsHydrated) {
      return;
    }
    saveChecklistStorage({
      customChecklists,
      checkedByPreset,
      activeChecklistId,
    });
  }, [
    activeChecklistId,
    checkedByPreset,
    checklistsHydrated,
    customChecklists,
  ]);

  const activeChecklist =
    allChecklists.find(preset => preset.id === activeChecklistId) ??
    CHECKLIST_PRESETS[0];
  const checkedItems = checkedByPreset[activeChecklist.id] ?? {};
  const checkedCount = activeChecklist.items.filter(
    item => checkedItems[item.id],
  ).length;
  const totalCount = activeChecklist.items.length;
  const progress = totalCount === 0 ? 0 : checkedCount / totalCount;
  const isCustomActive = Boolean(activeChecklist.isCustom);

  const toggleChecklistItem = useCallback(
    (itemId: string) => {
      setCheckedByPreset(prev => {
        const current = prev[activeChecklist.id] ?? {};
        return {
          ...prev,
          [activeChecklist.id]: {
            ...current,
            [itemId]: !current[itemId],
          },
        };
      });
    },
    [activeChecklist.id],
  );

  const resetChecklist = useCallback(() => {
    setCheckedByPreset(prev => ({
      ...prev,
      [activeChecklist.id]: {},
    }));
  }, [activeChecklist.id]);

  const handleAddItem = useCallback(() => {
    const label = newItemLabel.trim();
    if (!label) {
      return;
    }
    const item = createChecklistItem(label);

    if (activeChecklist.isCustom) {
      setCustomChecklists(prev =>
        prev.map(checklist =>
          checklist.id === activeChecklist.id
            ? {...checklist, items: [...checklist.items, item]}
            : checklist,
        ),
      );
      setNewItemLabel('');
      return;
    }

    const cloned = {
      ...activeChecklist,
      id: `custom-${Date.now()}`,
      title: activeChecklist.title,
      subtitle: 'Your custom prep list',
      isCustom: true,
      items: [...activeChecklist.items, item],
    };
    setCustomChecklists(prev => [...prev, cloned]);
    setCheckedByPreset(prev => ({
      ...prev,
      [cloned.id]: {...(prev[activeChecklist.id] ?? {})},
    }));
    setActiveChecklistId(cloned.id);
    setNewItemLabel('');
  }, [activeChecklist, newItemLabel]);

  const handleDeleteItem = useCallback(
    (itemId: string) => {
      if (!activeChecklist.isCustom) {
        return;
      }
      setCustomChecklists(prev =>
        prev.map(checklist =>
          checklist.id === activeChecklist.id
            ? {
                ...checklist,
                items: checklist.items.filter(item => item.id !== itemId),
              }
            : checklist,
        ),
      );
      setCheckedByPreset(prev => {
        const current = {...(prev[activeChecklist.id] ?? {})};
        delete current[itemId];
        return {...prev, [activeChecklist.id]: current};
      });
    },
    [activeChecklist.id, activeChecklist.isCustom],
  );

  const handleDeleteChecklist = useCallback(() => {
    if (!activeChecklist.isCustom) {
      return;
    }
    const deletingId = activeChecklist.id;
    setCustomChecklists(prev => prev.filter(item => item.id !== deletingId));
    setCheckedByPreset(prev => {
      const next = {...prev};
      delete next[deletingId];
      return next;
    });
    setActiveChecklistId(CHECKLIST_PRESETS[0].id);
  }, [activeChecklist.id, activeChecklist.isCustom]);

  useEffect(() => {
    repellerSoundRef.current = createAppSound(REPELLER_SOUND, err => {
      if (err) {
        console.warn('Failed to load repeller sound:', err);
      }
    });
    alarmSoundRef.current = createAppSound(ALARM_SOUND, err => {
      if (err) {
        console.warn('Failed to load alarm sound:', err);
      }
    });
    return () => {
      repellerSoundRef.current?.stop();
      alarmSoundRef.current?.stop();
      repellerSoundRef.current?.release();
      alarmSoundRef.current?.release();
      repellerSoundRef.current = null;
      alarmSoundRef.current = null;
    };
  }, []);

  useEffect(() => {
    const s = repellerSoundRef.current;
    if (!s) {
      return;
    }
    if (repellerOn) {
      s.setNumberOfLoops(-1);
      s.play();
    } else {
      s.stop();
    }
  }, [repellerOn]);

  const handleVolumeChange = useCallback((val: number) => {
    setVolume(val);
    alarmSoundRef.current?.setVolume(val);
  }, []);

  const toggleAlarm = useCallback(() => {
    const s = alarmSoundRef.current;
    if (!s) {
      return;
    }
    if (alarmPlayingRef.current) {
      s.stop();
      alarmPlayingRef.current = false;
      setAlarmPlaying(false);
      return;
    }

    s.setVolume(volume);
    s.setNumberOfLoops(-1);
    alarmPlayingRef.current = true;
    setAlarmPlaying(true);
    s.play(() => {
      alarmPlayingRef.current = false;
      setAlarmPlaying(false);
    });
  }, [volume]);

  const formattedFreq = frequency.toLocaleString('en-US');

  return (
    <View style={[styles.SafetyScreenFacetChassis, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.SafetyScreenHeaderInset}>
        <Text style={styles.SafetyScreenTitleFiligree}>Safety</Text>
        <Text style={styles.SafetyScreenSubtitleFiligree}>
          Wildlife tools & trip prep checklists
        </Text>
      </View>

      <ScrollView
        style={styles.SafetyScreenScrollEnclave}
        contentContainerStyle={styles.SafetyScreenScrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.SafetyScreenCardFacetChassis}>
          <View style={styles.SafetyScreenChecklistHeaderLintel}>
            <View style={styles.SafetyScreenChecklistTitleCol}>
              <Text style={styles.SafetyScreenCardTitleFiligree}>
                Prep Checklists
              </Text>
              <Text style={styles.SafetyScreenCardSubtitleFiligree}>
                {activeChecklist.subtitle}
              </Text>
            </View>
            <View style={styles.SafetyScreenChecklistActionsLintel}>
              {isCustomActive ? (
                <TouchableOpacity
                  onPress={handleDeleteChecklist}
                  hitSlop={8}
                  activeOpacity={0.7}
                >
                  <Text style={styles.SafetyScreenChecklistDeleteFiligree}>
                    Delete
                  </Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                onPress={resetChecklist}
                hitSlop={8}
                activeOpacity={0.7}
              >
                <Text style={styles.SafetyScreenChecklistResetFiligree}>
                  Reset
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.SafetyScreenChecklistChipsLintel}
          >
            {allChecklists.map(preset => {
              const selected = preset.id === activeChecklist.id;
              return (
                <TouchableOpacity
                  key={preset.id}
                  style={[
                    styles.SafetyScreenChecklistChipPortico,
                    selected && styles.SafetyScreenChecklistChipActive,
                  ]}
                  onPress={() => setActiveChecklistId(preset.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.SafetyScreenChecklistChipFiligree,
                      selected &&
                        styles.SafetyScreenChecklistChipActiveFiligree,
                    ]}
                  >
                    {preset.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.SafetyScreenChecklistProgressEnclave}>
            <View style={styles.SafetyScreenChecklistProgressTrack}>
              <View
                style={[
                  styles.SafetyScreenChecklistProgressFill,
                  {width: `${Math.round(progress * 100)}%`},
                ]}
              />
            </View>
            <Text style={styles.SafetyScreenChecklistProgressFiligree}>
              {checkedCount}/{totalCount} ready
            </Text>
          </View>

          <View style={styles.SafetyScreenChecklistItemsEnclave}>
            {activeChecklist.items.length === 0 ? (
              <Text style={styles.SafetyScreenChecklistEmptyFiligree}>
                Add your first item below
              </Text>
            ) : (
              activeChecklist.items.map(item => {
                const checked = Boolean(checkedItems[item.id]);
                return (
                  <View
                    key={item.id}
                    style={styles.SafetyScreenChecklistItemLintel}
                  >
                    <TouchableOpacity
                      style={styles.SafetyScreenChecklistItemMain}
                      onPress={() => toggleChecklistItem(item.id)}
                      activeOpacity={0.75}
                    >
                      <View
                        style={[
                          styles.SafetyScreenChecklistBox,
                          checked && styles.SafetyScreenChecklistBoxChecked,
                        ]}
                      >
                        {checked ? (
                          <Text
                            style={styles.SafetyScreenChecklistCheckFiligree}
                          >
                            ✓
                          </Text>
                        ) : null}
                      </View>
                      <Text
                        style={[
                          styles.SafetyScreenChecklistItemFiligree,
                          checked &&
                            styles.SafetyScreenChecklistItemDoneFiligree,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                    {isCustomActive ? (
                      <TouchableOpacity
                        onPress={() => handleDeleteItem(item.id)}
                        hitSlop={8}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={styles.SafetyScreenChecklistItemRemoveFiligree}
                        >
                          ×
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                );
              })
            )}
          </View>

          <View style={styles.SafetyScreenChecklistComposerEnclave}>
            <TextInput
              style={styles.SafetyScreenChecklistInput}
              value={newItemLabel}
              onChangeText={setNewItemLabel}
              placeholder="Add item…"
              placeholderTextColor={colors.bodyMuted}
              maxLength={80}
              returnKeyType="done"
              onSubmitEditing={handleAddItem}
            />
            <TouchableOpacity
              style={[
                styles.SafetyScreenChecklistAddPortico,
                !newItemLabel.trim() &&
                  styles.SafetyScreenChecklistAddDisabled,
              ]}
              onPress={handleAddItem}
              activeOpacity={0.8}
              disabled={!newItemLabel.trim()}
            >
              <Text style={styles.SafetyScreenChecklistAddFiligree}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.SafetyScreenCardFacetChassis}>
          <View style={styles.SafetyScreenCardHeaderLintel}>
            <View style={styles.SafetyScreenCardHeaderLeftLintel}>
              <View style={styles.SafetyScreenCardIconEnclave}>
                <Image
                  source={require('../assets/viknergo_safety_repeller.png')}
                  style={styles.SafetyScreenCardIconSigil}
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text style={styles.SafetyScreenCardTitleFiligree}>
                  Mosquito Repeller
                </Text>
                <Text style={styles.SafetyScreenCardSubtitleFiligree}>
                  Ultrasonic frequency
                </Text>
              </View>
            </View>
            <Switch
              value={repellerOn}
              onValueChange={setRepellerOn}
              trackColor={{ false: '#1a2248', true: colors.button }}
              thumbColor={repellerOn ? colors.buttonText : '#6a7ca0'}
            />
          </View>

          <View style={styles.SafetyScreenFreqEnclave}>
            <Text style={styles.SafetyScreenFreqValueFiligree}>
              {formattedFreq}
            </Text>
            <Text style={styles.SafetyScreenFreqUnitFiligree}>
              Hz · Ultrasonic
            </Text>
          </View>

          <View style={styles.SafetyScreenFreqSliderEnclave}>
            <View style={styles.SafetyScreenFreqSliderLabelsLintel}>
              <Text style={styles.SafetyScreenFreqSliderLabelFiligree}>
                15,000 Hz
              </Text>
              <Text style={styles.SafetyScreenFreqSliderLabelFiligree}>
                20,000 Hz
              </Text>
            </View>
            <AppSlider
              style={styles.SafetyScreenFreqSliderControl}
              minimumValue={FREQ_MIN}
              maximumValue={FREQ_MAX}
              step={100}
              value={frequency}
              onValueChange={setFrequency}
              minimumTrackTintColor={colors.button}
              maximumTrackTintColor="#1a2248"
              thumbTintColor={colors.button}
            />
          </View>

          {repellerOn ? (
            <View style={styles.SafetyScreenStatusEnclave}>
              <View style={styles.SafetyScreenStatusDot} />
              <Text style={styles.SafetyScreenStatusFiligree}>
                Active · Repelling mosquitoes
              </Text>
            </View>
          ) : null}
        </View>

        <View
          style={[
            styles.SafetyScreenCardFacetChassis,
            styles.SafetyScreenAlarmCardFacetChassis,
          ]}
        >
          <View style={styles.SafetyScreenCardHeaderLintel}>
            <View style={styles.SafetyScreenCardHeaderLeftLintel}>
              <View style={styles.SafetyScreenCardIconEnclave}>
                <Image
                  source={require('../assets/viknergo_safety_alarm.png')}
                  style={styles.SafetyScreenCardIconSigil}
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text style={styles.SafetyScreenCardTitleFiligree}>
                  Wild Animal Alarm
                </Text>
                <Text style={styles.SafetyScreenCardSubtitleFiligree}>
                  High-frequency deterrent
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.SafetyScreenPlayLintel}>
            <TouchableOpacity
              style={styles.SafetyScreenPlayPortico}
              onPress={toggleAlarm}
              activeOpacity={0.8}
            >
              {alarmPlaying ? (
                <Image
                  source={require('../assets/pause.png')}
                  style={styles.SafetyScreenPlayIconSigil}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.SafetyScreenPlayIconFiligree}>▶</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.SafetyScreenVolumeLabelLintel}>
            <Text style={styles.SafetyScreenVolumeLabelFiligree}>
              Volume Level
            </Text>
          </View>

          <View style={styles.SafetyScreenVolumeBarsLintel}>
            {VOLUME_BAR_HEIGHTS.map((h, i) => {
              const barThreshold = (i + 1) / VOLUME_BAR_HEIGHTS.length;
              return (
                <View
                  key={i}
                  style={[
                    styles.SafetyScreenVolumeBar,
                    {
                      height: h,
                      backgroundColor:
                        volume >= barThreshold ? colors.button : '#1a2248',
                    },
                  ]}
                />
              );
            })}
          </View>

          <AppSlider
            style={styles.SafetyScreenVolumeSliderControl}
            minimumValue={0}
            maximumValue={1}
            step={0.05}
            value={volume}
            onValueChange={handleVolumeChange}
            minimumTrackTintColor={colors.button}
            maximumTrackTintColor="#1a2248"
            thumbTintColor={colors.button}
          />

          <View style={styles.SafetyScreenWarningEnclave}>
            <Text style={styles.SafetyScreenWarningIconFiligree}>⚠</Text>
            <Text style={styles.SafetyScreenWarningFiligree}>
              Use only when wildlife is detected nearby. May disturb other
              hikers or campers in the area.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  SafetyScreenFacetChassis: {
    backgroundColor: colors.surface,
    flex: 1,
  },

  SafetyScreenHeaderInset: {
    paddingBottom: 8,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 18,
  },

  SafetyScreenTitleFiligree: {
    color: colors.title,
    fontFamily: fonts.sansExtraBold,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 33,
  },
  SafetyScreenSubtitleFiligree: {
    color: colors.bodyMuted,
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    lineHeight: 18,
  },
  SafetyScreenScrollEnclave: {
    flex: 1,
  },
  SafetyScreenScrollContent: {
    gap: 14,
    paddingBottom: 40,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 8,
  },

  SafetyScreenCardFacetChassis: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderRadius: 18,
    borderWidth: 1,
    elevation: 5,
    padding: 21,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 11,
  },
  SafetyScreenAlarmCardFacetChassis: {
    backgroundColor: '#191540',
  },
  SafetyScreenCardHeaderLintel: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  SafetyScreenCardHeaderLeftLintel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  SafetyScreenCardIconEnclave: {
    alignItems: 'center',
    backgroundColor: 'rgba(201,164,39,0.1)',
    borderColor: 'rgba(201,164,39,0.2)',
    borderRadius: 13,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },

  SafetyScreenCardIconSigil: {
    height: 24,
    tintColor: colors.button,
    width: 24,
  },

  SafetyScreenCardTitleFiligree: {
    color: colors.title,
    fontFamily: fonts.sansBold,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22.5,
  },
  SafetyScreenCardSubtitleFiligree: {
    color: colors.bodyMuted,
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    lineHeight: 16.5,
  },
  SafetyScreenFreqEnclave: {
    alignItems: 'center',
    marginTop: 20,
  },

  SafetyScreenFreqValueFiligree: {
    color: colors.button,
    fontFamily: fonts.sansExtraBold,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.72,
    lineHeight: 54,
  },

  SafetyScreenFreqUnitFiligree: {
    color: colors.bodyMuted,
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    lineHeight: 18,
  },
  SafetyScreenFreqSliderEnclave: {
    marginTop: 18,
  },
  SafetyScreenFreqSliderLabelsLintel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  SafetyScreenFreqSliderLabelFiligree: {
    color: colors.bodyMuted,
    fontFamily: fonts.sansRegular,
    fontSize: 10,
    lineHeight: 15,
  },

  SafetyScreenFreqSliderControl: {
    height: 34,
    marginHorizontal: -8,
    marginTop: 4,
  },

  SafetyScreenStatusEnclave: {
    alignItems: 'center',
    backgroundColor: 'rgba(201,164,39,0.08)',
    borderColor: 'rgba(201,164,39,0.18)',
    borderRadius: 9,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  SafetyScreenStatusDot: {
    backgroundColor: colors.button,
    borderRadius: 3.5,
    height: 7,
    width: 7,
  },
  SafetyScreenStatusFiligree: {
    color: colors.button,
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },

  SafetyScreenPlayLintel: {
    alignItems: 'center',
    marginTop: 22,
  },

  SafetyScreenPlayPortico: {
    alignItems: 'center',
    backgroundColor: colors.button,
    borderRadius: 38,
    elevation: 6,
    height: 76,
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    width: 76,
  },
  SafetyScreenPlayIconFiligree: {
    color: colors.buttonText,
    fontSize: 28,
  },

  SafetyScreenPlayIconSigil: {
    height: 32,
    tintColor: colors.buttonText,
    width: 32,
  },

  SafetyScreenVolumeLabelLintel: {
    marginTop: 22,
  },
  SafetyScreenVolumeLabelFiligree: {
    color: colors.bodyMuted,
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16.5,
  },
  SafetyScreenVolumeBarsLintel: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 3,
    marginTop: 9,
  },

  SafetyScreenVolumeBar: {
    borderRadius: 2,
    flex: 1,
  },

  SafetyScreenVolumeSliderControl: {
    height: 34,
    marginHorizontal: -8,
    marginTop: 4,
  },
  SafetyScreenWarningEnclave: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(192,64,64,0.1)',
    borderColor: 'rgba(192,64,64,0.25)',
    borderRadius: 9,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },

  SafetyScreenWarningIconFiligree: {
    color: '#c04040',
    fontSize: 13,
    marginTop: 1,
  },

  SafetyScreenWarningFiligree: {
    color: '#c04040',
    flex: 1,
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    lineHeight: 17,
  },

  SafetyScreenChecklistHeaderLintel: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  SafetyScreenChecklistTitleCol: {
    flex: 1,
    paddingRight: 12,
  },
  SafetyScreenChecklistActionsLintel: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-end',
    maxWidth: 140,
  },
  SafetyScreenChecklistResetFiligree: {
    color: colors.button,
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  SafetyScreenChecklistDeleteFiligree: {
    color: '#c04040',
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  SafetyScreenChecklistChipsLintel: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 2,
  },
  SafetyScreenChecklistChipPortico: {
    backgroundColor: colors.chip,
    borderColor: colors.chipBorder,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  SafetyScreenChecklistChipNew: {
    borderStyle: 'dashed',
  },
  SafetyScreenChecklistChipActive: {
    backgroundColor: 'rgba(201,164,39,0.14)',
    borderColor: 'rgba(201,164,39,0.45)',
  },
  SafetyScreenChecklistChipFiligree: {
    color: colors.chipText,
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    fontWeight: '600',
  },
  SafetyScreenChecklistChipNewFiligree: {
    color: colors.button,
  },
  SafetyScreenChecklistChipActiveFiligree: {
    color: colors.button,
  },
  SafetyScreenChecklistComposerEnclave: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  SafetyScreenChecklistInput: {
    backgroundColor: '#0f1533',
    borderColor: colors.cardBorder,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.title,
    flex: 1,
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  SafetyScreenChecklistAddPortico: {
    alignItems: 'center',
    backgroundColor: colors.button,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  SafetyScreenChecklistAddDisabled: {
    opacity: 0.45,
  },
  SafetyScreenChecklistAddFiligree: {
    color: colors.buttonText,
    fontFamily: fonts.sansBold,
    fontSize: 12,
    fontWeight: '700',
  },
  SafetyScreenChecklistProgressEnclave: {
    gap: 8,
    marginTop: 16,
  },
  SafetyScreenChecklistProgressTrack: {
    backgroundColor: '#1a2248',
    borderRadius: 4,
    height: 6,
    overflow: 'hidden',
  },
  SafetyScreenChecklistProgressFill: {
    backgroundColor: colors.button,
    borderRadius: 4,
    height: '100%',
  },
  SafetyScreenChecklistProgressFiligree: {
    color: colors.bodyMuted,
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    fontWeight: '600',
  },
  SafetyScreenChecklistItemsEnclave: {
    gap: 4,
    marginTop: 12,
  },
  SafetyScreenChecklistEmptyFiligree: {
    color: colors.bodyMuted,
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    lineHeight: 18,
    paddingVertical: 8,
  },
  SafetyScreenChecklistItemLintel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 9,
  },
  SafetyScreenChecklistItemMain: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  SafetyScreenChecklistBox: {
    alignItems: 'center',
    borderColor: colors.cardBorder,
    borderRadius: 7,
    borderWidth: 1.5,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  SafetyScreenChecklistBoxChecked: {
    backgroundColor: colors.button,
    borderColor: colors.button,
  },
  SafetyScreenChecklistCheckFiligree: {
    color: colors.buttonText,
    fontFamily: fonts.sansBold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  SafetyScreenChecklistItemFiligree: {
    color: colors.title,
    flex: 1,
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    lineHeight: 19,
  },
  SafetyScreenChecklistItemDoneFiligree: {
    color: colors.bodyMuted,
    textDecorationLine: 'line-through',
  },
  SafetyScreenChecklistItemRemoveFiligree: {
    color: colors.bodyMuted,
    fontFamily: fonts.sansBold,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
    paddingHorizontal: 4,
  },
});
