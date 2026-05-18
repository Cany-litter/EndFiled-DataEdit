export type EquipSlot = 'armor' | 'glove' | 'accessory';

export interface EquipAttr {
  name: string;
  type: string;
  refine: number;
  baseValue: number;
  valueAtRefine: [number, number, number, number];
}

export interface Equipment {
  id: string;
  name: string;
  icon: string;
  slot: EquipSlot;
  level: number;
  baseDef: number;
  setName: string;
  attr1: EquipAttr;
  attr2: EquipAttr;
  attr3: EquipAttr;
  setEffect1: { name: string; type: 'permanent' | 'limited'; value: number; description: string } | null;
  setEffect2: { name: string; type: 'permanent' | 'limited'; condition: string; duration: number; value: number; description: string } | null;
}
