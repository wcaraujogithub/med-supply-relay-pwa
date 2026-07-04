/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Wesley Cordeiro de Araujo
 * See NOTICE for additional attribution and origin notices.
 */
import type {
  DemandPriority,
  ReliefLocationType
} from '../../db/localTypes';

export type SelectOption<TValue extends string = string> = {
  value: TValue;
  labelKey: string;
};

export type PriorityOption = {
  value: DemandPriority;
  labelKey: string;
  descriptionKey: string;
};

export const supplyLocationTypes: Array<SelectOption<ReliefLocationType>> = [
  { value: 'Shelter', labelKey: 'locationType.Shelter' },
  { value: 'Warehouse', labelKey: 'locationType.Warehouse' },
  { value: 'CollectionPoint', labelKey: 'locationType.CollectionPoint' },
  { value: 'MedicalPost', labelKey: 'locationType.MedicalPost' },
  { value: 'Ngo', labelKey: 'locationType.Ngo' },
  { value: 'MobileUnit', labelKey: 'locationType.MobileUnit' },
  { value: 'Other', labelKey: 'locationType.Other' }
];

export const demandLocationTypes: Array<SelectOption<ReliefLocationType>> = [
  { value: 'Hospital', labelKey: 'locationType.Hospital' },
  { value: 'MedicalPost', labelKey: 'locationType.MedicalPost' },
  { value: 'Shelter', labelKey: 'locationType.Shelter' },
  { value: 'MobileUnit', labelKey: 'locationType.MobileUnit' },
  { value: 'Ngo', labelKey: 'locationType.Ngo' },
  { value: 'Other', labelKey: 'locationType.Other' }
];

export const unitOptions: Array<SelectOption> = [
  { value: 'caixas', labelKey: 'unit.caixas' },
  { value: 'comprimidos', labelKey: 'unit.comprimidos' },
  { value: 'frascos', labelKey: 'unit.frascos' },
  { value: 'ampolas', labelKey: 'unit.ampolas' },
  { value: 'unidades', labelKey: 'unit.unidades' },
  { value: 'kits', labelKey: 'unit.kits' },
  { value: 'litros', labelKey: 'unit.litros' },
  { value: 'ml', labelKey: 'unit.ml' },
  { value: 'pacotes', labelKey: 'unit.pacotes' }
];

export const demandPriorityOptions: PriorityOption[] = [
  {
    value: 'Critical',
    labelKey: 'priority.Critical',
    descriptionKey: 'demand.priority.CriticalDesc'
  },
  {
    value: 'High',
    labelKey: 'priority.High',
    descriptionKey: 'demand.priority.HighDesc'
  },
  {
    value: 'Medium',
    labelKey: 'priority.Medium',
    descriptionKey: 'demand.priority.MediumDesc'
  },
  {
    value: 'Low',
    labelKey: 'priority.Low',
    descriptionKey: 'demand.priority.LowDesc'
  }
];