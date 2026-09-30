import AsyncStorage from '@react-native-async-storage/async-storage';

import type {ChecklistPreset} from '../data/checklists';

const STORAGE_KEY = 'viknergo.safety.checklists.v1';

export type ChecklistStoragePayload = {
  customChecklists: ChecklistPreset[];
  checkedByPreset: Record<string, Record<string, boolean>>;
  activeChecklistId: string;
};

export async function loadChecklistStorage(): Promise<ChecklistStoragePayload | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as ChecklistStoragePayload;
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    return {
      customChecklists: Array.isArray(parsed.customChecklists)
        ? parsed.customChecklists.filter(
            item => item && typeof item.id === 'string' && item.isCustom,
          )
        : [],
      checkedByPreset:
        parsed.checkedByPreset && typeof parsed.checkedByPreset === 'object'
          ? parsed.checkedByPreset
          : {},
      activeChecklistId:
        typeof parsed.activeChecklistId === 'string'
          ? parsed.activeChecklistId
          : '',
    };
  } catch (error) {
    console.warn('Failed to load checklist storage:', error);
    return null;
  }
}

export async function saveChecklistStorage(
  payload: ChecklistStoragePayload,
): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('Failed to save checklist storage:', error);
  }
}
