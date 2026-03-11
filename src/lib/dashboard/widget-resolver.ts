import type { ModuleKey } from "../constants/module-keys";
import { hasFeature } from "../access/feature-access";
import {
  DASHBOARD_WIDGETS,
  type DashboardWidgetDefinition,
} from "./widget-registry";

export function getVisibleDashboardWidgets(
  activeModules: ModuleKey[],
): DashboardWidgetDefinition[] {
  return DASHBOARD_WIDGETS.filter((widget) => {
    const hasRequiredModule = activeModules.includes(widget.module);
    if (!hasRequiredModule) return false;

    return hasFeature(activeModules, widget.requiredFeature);
  });
}

export function groupDashboardWidgets(
  activeModules: ModuleKey[],
): Record<ModuleKey, DashboardWidgetDefinition[]> {
  const visibleWidgets = getVisibleDashboardWidgets(activeModules);

  return visibleWidgets.reduce(
    (groups, widget) => {
      groups[widget.module] ??= [];
      groups[widget.module].push(widget);
      return groups;
    },
    {} as Record<ModuleKey, DashboardWidgetDefinition[]>,
  );
}