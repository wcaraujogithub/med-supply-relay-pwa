/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Wesley Cordeiro de Araujo
 * See NOTICE for additional attribution and origin notices.
 */
export type HelpScreenshot = {
  titleKey: string;
  textKey: string;
  fileName: string;
  imageSrc: string;
};

export const helpScreenshots: HelpScreenshot[] = [
  {
    titleKey: 'help.tipHomeTitle',
    textKey: 'help.tipHomeText',
    fileName: 'home.png',
    imageSrc: '/help/home.png'
  },
  {
    titleKey: 'help.tipSupplyTitle',
    textKey: 'help.tipSupplyText',
    fileName: 'supply.png',
    imageSrc: '/help/supply.png'
  },
  {
    titleKey: 'help.tipDemandTitle',
    textKey: 'help.tipDemandText',
    fileName: 'demand.png',
    imageSrc: '/help/demand.png'
  },
  {
    titleKey: 'help.tipMatchesTitle',
    textKey: 'help.tipMatchesText',
    fileName: 'matches.png',
    imageSrc: '/help/matches.png'
  },
  {
    titleKey: 'help.tipReservationsTitle',
    textKey: 'help.tipReservationsText',
    fileName: 'reservations.png',
    imageSrc: '/help/reservations.png'
  },
  {
    titleKey: 'help.tipSyncTitle',
    textKey: 'help.tipSyncText',
    fileName: 'sync.png',
    imageSrc: '/help/sync.png'
  }
];

export const businessRuleKeys = [
  'help.rule1',
  'help.rule2',
  'help.rule3',
  'help.rule4',
  'help.rule5',
  'help.rule6',
  'help.rule7',
  'help.rule8',
  'help.rule9',
  'help.rule10'
];

export const emergencyRuleKeys = [
  'help.emergency1',
  'help.emergency2',
  'help.emergency3',
  'help.emergency4'
];

export const flowCards = [
  {
    titleKey: 'help.flow1Title',
    textKey: 'help.flow1Text'
  },
  {
    titleKey: 'help.flow2Title',
    textKey: 'help.flow2Text'
  },
  {
    titleKey: 'help.flow3Title',
    textKey: 'help.flow3Text'
  },
  {
    titleKey: 'help.flow4Title',
    textKey: 'help.flow4Text'
  },
  {
    titleKey: 'help.flow5Title',
    textKey: 'help.flow5Text'
  }
];