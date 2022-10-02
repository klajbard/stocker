import { LitElement, html, css } from "lit";

export class StockerResult extends LitElement {
  constructor() {
    super();
    this.name;
    this.value;
  }

  static get properties() {
    return {
      name: { type: String, reflect: true },
      value: { type: String },
      unit: { type: String, reflect: true },
      label: { type: String },
    };
  }

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

window.customElements.define("stocker-result", StockerResult);
