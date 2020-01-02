import { ActionConfig } from 'custom-card-helpers';

export interface OpenMensaPanelCardConfig {
  type: string;
  entity: string;
  name?: string;
  show_icons?: boolean;
  test_gui?: boolean;
  tap_aciton?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}
