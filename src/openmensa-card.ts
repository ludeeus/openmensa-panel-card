import { LitElement, html, customElement, property, CSSResult, TemplateResult, css, PropertyValues } from 'lit-element';
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  hasAction,
  ActionHandlerEvent,
  handleAction,
  LovelaceCardEditor,
  getLovelace,
} from 'custom-card-helpers';

import './editor';

import { OpenMensaCardConfig } from './types';
import { actionHandler } from './action-handler-directive';
import { CARD_VERSION } from './const';

import { localize } from './localize/localize';

/* eslint no-console: 0 */
console.info(
  `%c  OPENMENSA-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

@customElement('openmensa-card')
export class OpenMensaCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('openmensa-card-editor') as LovelaceCardEditor;
  }

  public static getStubConfig(): object {
    return {};
  }

  // TODO Add any properities that should cause your element to re-render here
  @property() public hass?: HomeAssistant;
  @property() private _config?: OpenMensaCardConfig;

  public setConfig(config: OpenMensaCardConfig): void {
    // TODO Check for required fields and that they are of the proper format
    if (!config || !config.entity || config.show_error) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this._config = {
      name: 'OpenMensa',
      ...config,
    };
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  protected render(): TemplateResult | void {
    if (!this._config || !this.hass) {
      return html``;
    }

    // TODO Check for stateObj or other necessary things and render a warning if missing
    if (this._config.show_warning) {
      return html`
        <ha-card>
          <div class="warning">${localize('common.show_warning')}</div>
        </ha-card>
      `;
    }

    const stateObj = this.hass.states[this._config.entity];
    const entries: TemplateResult[] = [];

    for (const category of stateObj.attributes.categories) {
      const name: string = category.name;
      const meals: TemplateResult[] = [];

      for (const meal of category.meals) {
        meals.push(html`
          <div class="mealname">
            ${meal.name}
          </div>
        `);
      }

      entries.push(html`
        <div class="row">
          <div class="menuname">${name}</div>
          <div class="meallist">${meals}</div>
        </div>
      `);
    }

    return html`
      <ha-card
        .header=${this._config.name}
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this._config.hold_action),
          hasDoubleTap: hasAction(this._config.double_tap_action),
          repeat: this._config.hold_action ? this._config.hold_action.repeat : undefined,
        })}
        tabindex="0"
        aria-label=${`OpenMensa: ${this._config.entity}`}
      >
        ${entries}
      </ha-card>
    `;
  }

  private _handleAction(ev: ActionHandlerEvent): void {
    if (this.hass && this._config && ev.detail.action) {
      handleAction(this, this.hass, this._config, ev.detail.action);
    }
  }

  static get styles(): CSSResult {
    return css`
      .warning {
        display: block;
        color: black;
        background-color: #fce588;
        padding: 8px;
      }
      .menuname {
        font-size: 1.2em;
        font-weight: var(--mcg-title-font-weight, 500);
        max-height: 1.4em;
        min-height: 1.4em;
        opacity: 0.65;
        padding-top: 8px;
      }
      .meallist {
      }
      .mealname {
      }
      .row {
        padding: 0px 16px 16px;
      }
    `;
  }
}
