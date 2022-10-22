import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import { StockerInput } from "./stocker-input";
import { respondTo } from "./utils";

interface Position {
  balance: number;
  maxloss: number;
  entry: number;
  stoploss: number;
  maxdollarloss: number;
  stocktobuy: number;
}

@customElement("position-size")
export class PositionSize extends LitElement {
  data: Position = {
    balance: 0,
    maxloss: 0,
    entry: 0,
    stoploss: 0,
    maxdollarloss: 0,
    stocktobuy: 0,
  };
  balanceElem?: StockerInput | null;
  maxlossElem?: StockerInput | null;
  entryElem?: StockerInput | null;
  stoplossElem?: StockerInput | null;
  maxdollarlossElem?: HTMLButtonElement | null;
  stocktobuyElem?: HTMLButtonElement | null;
  clearElem?: HTMLButtonElement | null;

  static get styles() {
    return css`
      :host {
      }

      .input-container {
        max-width: 18rem;
        width: 100%;
        margin: auto;
      }

      .result-container {
      }

      .action-container {
        margin-top: 0.5rem;
      }

      ${respondTo(
        "tablet",
        css`
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
            padding: 1rem;
          }
        `
      )}
    `;
  }

  _calculateMaxDollarLoss() {
    this.data.balance = parseFloat(this.balanceElem?.value || "0");
    this.data.maxloss = parseFloat(this.maxlossElem?.value || "0") / 100;
    this.data.maxdollarloss = Math.ceil(this.data.balance * this.data.maxloss);
    if (this.maxdollarlossElem) {
      this.maxdollarlossElem.value = String(this.data.maxdollarloss);
    }
  }

  _calculateStockToBuy() {
    this.data.entry = parseFloat(this.entryElem?.value || "0");
    this.data.stoploss = parseFloat(this.stoplossElem?.value || "0");
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

    if (this.stocktobuyElem) {
      this.stocktobuyElem.value = String(this.data.stocktobuy);
    }
  }

  firstUpdated() {
    if (!this.shadowRoot) {
      return;
    }
    this.balanceElem = this.shadowRoot.querySelector("[name='balance']");
    this.maxlossElem = this.shadowRoot.querySelector("[name='maxloss']");
    this.maxdollarlossElem = this.shadowRoot.querySelector(
      "[name='maxdollarloss']"
    );
    this.entryElem = this.shadowRoot.querySelector("[name='entry']");
    this.stoplossElem = this.shadowRoot.querySelector("[name='stoploss']");
    this.stocktobuyElem = this.shadowRoot.querySelector("[name='stocktobuy']");

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
    if (this.balanceElem) this.balanceElem.value = null;
    if (this.maxlossElem) this.maxlossElem.value = null;
    if (this.stoplossElem) this.stoplossElem.value = null;
    if (this.entryElem) this.entryElem.value = null;
    this._handleInputUpdate();
  }

  _handleInputUpdate() {
    this._calculateMaxDollarLoss();
    this._calculateStockToBuy();
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
        <div class="action-container">
          <stocker-button name="clear" @click=${this._handleResetInputs}>
            Clear inputs
          </stocker-button>
        </div>
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
