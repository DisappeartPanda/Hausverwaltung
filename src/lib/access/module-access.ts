import type { ModuleKey } from "../../lib/constants/module-keys";

export type ModuleAccessContext = {
  activeModules: ModuleKey[];
};

export function hasModule(
  context: ModuleAccessContext,
  moduleKey: ModuleKey,
): boolean {
  return context.activeModules.includes(moduleKey);
}

export function hasAnyModule(
  context: ModuleAccessContext,
  moduleKeys: ModuleKey[],
): boolean {
  return moduleKeys.some((moduleKey) => context.activeModules.includes(moduleKey));
}

export function hasAllModules(
  context: ModuleAccessContext,
  moduleKeys: ModuleKey[],
): boolean {
    return moduleKeys.every((moduleKey) => context.activeModules.includes(moduleKey));
}

export function getMissingModules(
  context: ModuleAccessContext,
  requiredModules: ModuleKey[],
): ModuleKey[] {
  return requiredModules.filter(
    (moduleKey) => !context.activeModules.includes(moduleKey),
  );
}