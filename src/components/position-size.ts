import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import { StockerInput } from "./stocker-input";
import { respondTo } from "./utils";

interface Position {
  balance: number;
  maxloss: number;
  entry: number;
  stoploss: number;
  maxriskamount: number;
  stocktobuy: number;
}

@customElement("position-size")
export class PositionSize extends LitElement {
  data: Position = {
    balance: 0,
    maxloss: 0,
    entry: 0,
    stoploss: 0,
    maxriskamount: 0,
    stocktobuy: 0,
  };
  balanceElem?: StockerInput | null;
  maxlossElem?: StockerInput | null;
  entryElem?: StockerInput | null;
  stoplossElem?: StockerInput | null;
  maxriskamountElem?: HTMLButtonElement | null;
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
        margin-top: 0.5rem;
      }

      .action-container {
        margin-top: 0.5rem;
      }

      ${respondTo(
        "tablet",
        css`
          :host {
            display: grid;
            grid-template-areas:
              "descr descr"
              "input defs"
              "input defs"
              "result result";
            grid-template-columns: 1fr 1fr;
          }

          .definitions {
            grid-area: defs;
            padding: 1rem;
          }

          .description {
            grid-area: descr;
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

  _calculateMaxRiskAmount() {
    this.data.balance = parseFloat(this.balanceElem?.value || "0");
    this.data.maxloss = parseFloat(this.maxlossElem?.value || "0") / 100;
    this.data.maxriskamount = Math.ceil(this.data.balance * this.data.maxloss);
    if (this.maxriskamountElem) {
      this.maxriskamountElem.value = String(this.data.maxriskamount);
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
          this.data.maxriskamount /
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
    this.maxriskamountElem = this.shadowRoot.querySelector(
      "[name='maxriskamount']"
    );
    this.entryElem = this.shadowRoot.querySelector("[name='entry']");
    this.stoplossElem = this.shadowRoot.querySelector("[name='stoploss']");
    this.stocktobuyElem = this.shadowRoot.querySelector("[name='stocktobuy']");

    this.clearElem = this.shadowRoot.querySelector("[name='clear']");

    this._calculateMaxRiskAmount();
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
    this._calculateMaxRiskAmount();
    this._calculateStockToBuy();
  }

  render() {
    const inputs = [
      { label: "Account Balance", name: "balance", unit: "$" },
      { label: "Max Loss", name: "maxloss", unit: "%" },
      { label: "Entry price", name: "entry", unit: "$" },
      { label: "Stop Loss Price", name: "stoploss", unit: "$" },
    ];
    return html`
      <p class="description">
        Proper position sizing helps managing risk in trading. The following
        calculator will find the amount of stocks to buy considering the account
        size, Max Loss, entry price and Stop Loss Price.
      </p>
      <dl class="definitions">
        <dt>Account Balance</dt>
        <dd>The size of the account</dd>
        <dt>Max Loss</dt>
        <dd>The percentage of the account to risk</dd>
        <dt>Entry Price</dt>
        <dd>Current price of the stock to buy</dd>
        <dt>Stop Loss Price</dt>
        <dd>The price limit to exit the trade (short/long)</dd>
      </dl>
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
          label="Max Risk Amount"
          name="maxriskamount"
          unit="$"
        ></stocker-result>
        <stocker-result
          label="Stock Quantity"
          name="stocktobuy"
        ></stocker-result>
      </div>
    `;
  }
}
