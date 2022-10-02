import { LitElement, html, css } from "lit";

export class PositionSize extends LitElement {
  constructor() {
    super();
    this.data = {
      balance: 0,
      maxloss: 0,
      entry: 0,
      stoploss: 0,
      maxdollarloss: 0,
      stocktobuy: 0,
    };
  }

  static get styles() {
    return css`
      :host {
        display: grid;
        grid-template-areas: "input result";
        grid-template-columns: 1fr 1fr;
      }

      .input-container {
        grid-area: input;
        max-width: 20rem;
      }

      .result-container {
        grid-area: result;
        max-width: 20rem;
      }
    `;
  }

  _calculateMaxDollarLoss() {
    this.data.balance = parseFloat(this.balanceElem.value) || 0;
    this.data.maxloss = (parseFloat(this.maxlossElem.value) || 0) / 100;
    this.data.maxdollarloss = Math.ceil(this.data.balance * this.data.maxloss);
    this.maxdollarlossElem.value = this.data.maxdollarloss;
  }

  _calculateStockToBuy() {
    this.data.entry = parseFloat(this.entryElem.value) || 0;
    this.data.stoploss = parseFloat(this.stoplossElem.value) || 0;
    if (
      this.data.stoploss &&
      this.data.entry &&
      this.data.entry !== this.data.stoploss
    ) {
      this.data.stocktobuy =
        Math.floor(
          this.data.maxdollarloss /
            Math.abs(this.data.stoploss - this.data.entry)
        ) || 0;
    } else {
      this.data.stocktobuy = 0;
    }

    this.stocktobuyElem.value = this.data.stocktobuy;
  }

  firstUpdated() {
    this.balanceElem = this.shadowRoot.querySelector("[name='balance']");
    this.maxlossElem = this.shadowRoot.querySelector("[name='maxloss']");
    this.maxdollarlossElem = this.shadowRoot.querySelector(
      "[name='maxdollarloss']"
    );
    this.entryElem = this.shadowRoot.querySelector("[name='entry']");
    this.stoplossElem = this.shadowRoot.querySelector("[name='stoploss']");
    this.stocktobuyElem = this.shadowRoot.querySelector("[name='stocktobuy']");

    this.saveElem = this.shadowRoot.querySelector("[name='save']");
    this.clearElem = this.shadowRoot.querySelector("[name='clear']");

    this._calculateMaxDollarLoss();
    this._calculateStockToBuy();
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("input-update", this._handleInputUpdate);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("input-update", this._handleInputUpdate);
  }

  _handleResetInputs() {
    this.balanceElem.value = null;
    this.maxlossElem.value = null;
    this.stoplossElem.value = null;
    this.entryElem.value = null;
  }

  _handleInputUpdate() {
    this._calculateMaxDollarLoss();
    this._calculateStockToBuy();
    this.saveElem.disabled = !this.data.stocktobuy;
  }

  render() {
    const inputs = [
      { label: "Account balance", name: "balance", unit: "$" },
      { label: "Max loss", name: "maxloss", unit: "%" },
      { label: "Entry price", name: "entry", unit: "$" },
      { label: "Stop loss price", name: "stoploss", unit: "$" },
    ];
    return html`
      <div class="input-container">
        ${inputs.map(
          ({ label, name, unit }) => html`
            <stocker-input
              label=${label}
              name=${name}
              unit=${unit}
              type="number"
              right
            ></stocker-input>
          `
        )}
        <button name="clear" @click=${this._handleResetInputs}>
          Clear inputs
        </button>
      </div>
      <div class="result-container">
        <stocker-result
          label="Max $ loss"
          name="maxdollarloss"
          unit="$"
        ></stocker-result>
        <stocker-result
          label="Stock quantity"
          name="stocktobuy"
        ></stocker-result>
      </div>
    `;
  }
}

window.customElements.define("position-size", PositionSize);
