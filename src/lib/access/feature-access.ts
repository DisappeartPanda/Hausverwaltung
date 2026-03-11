import type { ModuleKey } from "../constants/module-keys";
import {
  getAllFeaturesForModules,
  type FeatureKey,
} from "../billing/modules";

export function getEnabledFeatures(activeModules: ModuleKey[]): FeatureKey[] {
  return getAllFeaturesForModules(activeModules);
}

export function hasFeature(
  activeModules: ModuleKey[],
  feature: FeatureKey,
): boolean {
  const enabledFeatures = getEnabledFeatures(activeModules);
  return enabledFeatures.includes(feature);
}

export function hasAnyFeature(
  activeModules: ModuleKey[],
  features: FeatureKey[],
): boolean {
  const enabledFeatures = getEnabledFeatures(activeModules);
  return features.some((feature) => enabledFeatures.includes(feature));
}

export function hasAllFeatures(
  activeModules: ModuleKey[],
  features: FeatureKey[],
): boolean {
  const enabledFeatures = getEnabledFeatures(activeModules);
  return features.every((feature) => enabledFeatures.includes(feature));
}