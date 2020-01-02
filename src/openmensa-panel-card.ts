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

import { OpenMensaPanelCardConfig } from './types';
import { actionHandler } from './action-handler-directive';

import { localize } from './localize/localize';

/* eslint-disable */
import logo_vegan from './vegan.png';
import logo_vegetarian from './vegetarian.png';

@customElement('openmensa-panel-card')
export class OpenMensaPanelCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('openmensa-panel-card-editor') as LovelaceCardEditor;
  }

  public static getStubConfig(): object {
    return {};
  }

  // TODO Add any properities that should cause your element to re-render here
  @property() public hass?: HomeAssistant;
  @property() private _config?: OpenMensaPanelCardConfig;

  public setConfig(config: OpenMensaPanelCardConfig): void {
    // TODO Check for required fields and that they are of the proper format
    if (!config || !config.entity) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this._config = {
      name: 'OpenMensa Panel',
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

    let error = 'common.show_warning';
    let show_error = false;
    const stateObj = this.hass.states[this._config.entity];

    if (!this._config.entity) {
      error = 'common.invalid_configuration';
      show_error = true;
    } else if (!stateObj) {
      error = 'common.invalid_entity';
      show_error = true;
    }

    // Check for stateObj or other necessary things and render a warning if missing
    if (show_error) {
      return html`
        <ha-card>
          <div class="warning">${localize(error)}</div>
        </ha-card>
      `;
    }

    const entries: TemplateResult[] = [];
    let noentries: TemplateResult = html``;

    for (const category of stateObj.attributes.categories) {
      const name: string = category.name;
      const meals: TemplateResult[] = [];
      const vegan: boolean = name.toLowerCase().indexOf(localize('common.vegan')) > -1;
      const vegetarian: boolean = name.toLowerCase().indexOf(localize('common.vegetarian')) > -1;

      for (const meal of category.meals) {
        meals.push(html`
          <div class="mealname">
            ${meal.name}
          </div>
        `);
      }

      const show_vegan = this._config.show_icons && (vegan ? html`<img width="16px" alt="${localize('common.vegan')}" src=${logo_vegan}>` : '')
      const show_vegetarian = this._config.show_icons && (vegetarian ? html`<img width="16px" alt="${localize('common.vegetarian')}" src=${logo_vegetarian}>` : '')

      entries.push(html`
        <ha-card class="category">
          <div class="menuname">${name}</div>
          ${show_vegan}
          ${show_vegetarian}
          <div class="meallist">${meals}</div>
        </ha-card>
      `);
    }

    if (entries.length == 0)
    {
      noentries = html`<div class="noentries">${localize('common.noentries')}</div>`;
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
        ${noentries}
        <div class="menu">
          ${entries}
        </div>
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
      .menu {
        display: flex;
        flex-wrap: wrap;
        align-content: space-between;
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
        padding-top: 8px;
      }
      .category {
        padding: 0px 16px 16px;
        margin: 0px 0px 16px 16px;
        width: 15.7%;
      }
      .noentries {
        margin: 0px 0px 16px 16px;
      }
    `;
  }
}
