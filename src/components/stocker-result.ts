import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("stocker-result")
export class StockerResult extends LitElement {
  @property({ type: String, reflect: true })
  unit?: string;
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
      }

      .unit {
        font-size: 1.2rem;
        width: 1rem;
      }
    `;
  }

  render() {
    const result = `${this.label}: ${this.value}${this.unit || ""}`;
    return html` <div class="">${result}</div> `;
  }
}
