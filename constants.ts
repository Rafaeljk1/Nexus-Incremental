
import { Upgrade } from './types';

export const UPGRADES: Upgrade[] = [
  {
    id: 'click_module',
    name: 'Neural Link',
    description: 'Increases manual click power by 1.',
    basePrice: 15,
    baseValue: 1,
    type: 'click',
    icon: '⚡'
  },
  {
    id: 'data_shard',
    name: 'Data Shard',
    description: 'Generates 0.5 credits per second.',
    basePrice: 50,
    baseValue: 0.5,
    type: 'passive',
    icon: '💎'
  },
  {
    id: 'node_basic',
    name: 'Compute Node',
    description: 'A basic cloud server generating 2 credits per second.',
    basePrice: 150,
    baseValue: 2,
    type: 'passive',
    icon: '🖥️'
  },
  {
    id: 'array_quantum',
    name: 'Quantum Array',
    description: 'Advanced processing generating 12 credits per second.',
    basePrice: 1200,
    baseValue: 12,
    type: 'passive',
    icon: '🌀'
  },
  {
    id: 'ai_core',
    name: 'Sentinel AI',
    description: 'High-level synthetic intelligence generating 55 credits per second.',
    basePrice: 8500,
    baseValue: 55,
    type: 'passive',
    icon: '🧠'
  },
  {
    id: 'nexus_relay',
    name: 'Nexus Relay',
    description: 'Intergalactic data hub generating 280 credits per second.',
    basePrice: 45000,
    baseValue: 280,
    type: 'passive',
    icon: '📡'
  },
  {
    id: 'singularity',
    name: 'The Singularity',
    description: 'The peak of evolution. Generates 1,500 credits per second.',
    basePrice: 250000,
    baseValue: 1500,
    type: 'passive',
    icon: '⚛️'
  }
];

export const SAVE_KEY = 'multiclick_save_v1';
export const PRICE_SCALING = 1.15;
