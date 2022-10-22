import { LitElement, html, css, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("stocker-button")
export class StockerButton extends LitElement {
  @property({ type: Boolean })
  disabled?: boolean;

  private buttonElement?: HTMLButtonElement | null;

  static get styles() {
    return css`
      :host {
        flex: 1;
      }

      button {
        width: 100%;
        padding: 0.5rem;
        font-size: 1rem;
        border: none;
      }

      button:not(:disabled) {
        background: var(--support-dark);
        color: var(--lighter-grey);
        cursor: pointer;
      }
    `;
  }

  _handleDisabledCheck() {
    if (this.buttonElement) {
      this.buttonElement.disabled = !!this.disabled;
    }
  }

  willUpdate(changedProperties: PropertyValues<StockerButton>) {
    changedProperties.forEach((_, propName) => {
      if (propName === "disabled") this._handleDisabledCheck();
    });
  }

  firstUpdated() {
    this.buttonElement = this.shadowRoot?.querySelector("button");
    this._handleDisabledCheck();
  }

  render() {
    return html`
      <button>
        <slot></slot>
      </button>
    `;
  }
}
