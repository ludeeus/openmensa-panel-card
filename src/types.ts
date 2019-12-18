import { ActionConfig } from 'custom-card-helpers';

// TODO Add your configuration elements here for type-checking
export interface OpenMensaCardConfig {
  type: string;
  entity: string;
  name?: string;
  show_warning?: boolean;
  show_error?: boolean;
  test_gui?: boolean;
  tap_aciton?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}
