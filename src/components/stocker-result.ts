import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("stocker-result")
export class StockerResult extends LitElement {
  @property({ type: String, reflect: true })
  name?: string;
  @property({ type: String })
  value?: string;
  @property({ type: String })
  label?: string;

  static get styles() {
    return css`
      :host {
        position: relative;
        display: flex;
        flex-direction: column;
        font-weight: bold;
      }

      dd {
        margin-left: 1rem;
        line-height: 1.1;
        font-size: 2rem;
      }
    `;
  }

  render() {
    return html`
      <dt>${this.label}</dt>
      <dd>${this.value}</dd>
    `;
  }
}
