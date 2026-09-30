export type ChecklistItem = {
  id: string;
  label: string;
};

export type ChecklistPreset = {
  id: string;
  title: string;
  subtitle: string;
  items: ChecklistItem[];
  isCustom?: boolean;
};

export const CHECKLIST_PRESETS: ChecklistPreset[] = [
  {
    id: 'day-hike',
    title: 'Day Hike',
    subtitle: 'Essentials before you hit the trail',
    items: [
      {id: 'dh1', label: 'Water bottle filled'},
      {id: 'dh2', label: 'Snacks / energy bar'},
      {id: 'dh3', label: 'Layered clothing'},
      {id: 'dh4', label: 'Rain shell packed'},
      {id: 'dh5', label: 'Phone fully charged'},
      {id: 'dh6', label: 'Power bank'},
      {id: 'dh7', label: 'Offline map saved'},
      {id: 'dh8', label: 'Tell someone your plan'},
    ],
  },
  {
    id: 'winter',
    title: 'Winter',
    subtitle: 'Cold-weather Nordic prep',
    items: [
      {id: 'w1', label: 'Insulated base layers'},
      {id: 'w2', label: 'Extra gloves & socks'},
      {id: 'w3', label: 'Thermos with warm drink'},
      {id: 'w4', label: 'Headlamp / flashlight'},
      {id: 'w5', label: 'Traction spikes / microspikes'},
      {id: 'w6', label: 'Emergency blanket'},
      {id: 'w7', label: 'Check daylight hours'},
      {id: 'w8', label: 'Weather & wind forecast'},
    ],
  },
  {
    id: 'aurora',
    title: 'Night / Aurora',
    subtitle: 'Ready for dark northern skies',
    items: [
      {id: 'a1', label: 'Warm standing layers'},
      {id: 'a2', label: 'Spare battery / power bank'},
      {id: 'a3', label: 'Red-light mode ready'},
      {id: 'a4', label: 'Clear northern horizon spot'},
      {id: 'a5', label: 'Hot drink packed'},
      {id: 'a6', label: 'Return route planned'},
      {id: 'a7', label: 'Share location with a contact'},
    ],
  },
  {
    id: 'emergency',
    title: 'Emergency Ready',
    subtitle: 'Safety kit before you leave',
    items: [
      {id: 'e1', label: 'First-aid basics'},
      {id: 'e2', label: 'Whistle or alarm ready'},
      {id: 'e3', label: 'Emergency contacts saved'},
      {id: 'e4', label: 'Mosquito protection (season)'},
      {id: 'e5', label: 'Navigation backup (map/compass)'},
      {id: 'e6', label: 'Know local emergency number'},
      {id: 'e7', label: 'Cash / ID in waterproof pouch'},
    ],
  },
];

export function createCustomChecklist(title: string): ChecklistPreset {
  const trimmed = title.trim();
  const id = `custom-${Date.now()}`;
  return {
    id,
    title: trimmed || 'My Checklist',
    subtitle: 'Your custom prep list',
    items: [],
    isCustom: true,
  };
}

export function createChecklistItem(label: string): ChecklistItem {
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: label.trim(),
  };
}
