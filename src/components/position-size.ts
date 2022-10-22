import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import { StockerInput } from "./stocker-input";
import { respondTo } from "./utils";

interface Position {
  balance: number;
  maxloss: number;
  entry: number;
  stoploss: number;
  maxRiskAmount: number;
  positionSize: number;
}

@customElement("position-size")
export class PositionSize extends LitElement {
  data: Position = {
    balance: 0,
    maxloss: 0,
    entry: 0,
    stoploss: 0,
    maxRiskAmount: 0,
    positionSize: 0,
  };
  balanceElem?: StockerInput | null;
  maxlossElem?: StockerInput | null;
  entryElem?: StockerInput | null;
  stoplossElem?: StockerInput | null;
  maxRiskAmountElem?: HTMLButtonElement | null;
  positionSizeElem?: HTMLButtonElement | null;
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

      .results-container {
        max-width: 18rem;
        width: 100%;
        margin: 1rem auto;
      }

      .results-container h3 {
        margin-top: 0;
        margin-bottom: 0.5rem;
        border-bottom: 1px solid var(--support-dark);
      }

      .results-container dl {
        margin: 0;
      }

      .action-container {
        margin-top: 0.5rem;
      }

      .definitions dd {
        position: relative;
      }

      .definitions dd:before {
        content: "↳";
        position: absolute;
        top: 0;
        font-weight: bold;
        left: -1.5rem;
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
              "result .";
            grid-template-columns: 1fr 1fr;
          }

          .definitions {
            grid-area: defs;
            padding: 0.5rem 1rem;
          }

          .description {
            grid-area: descr;
          }

          .input-container {
            grid-area: input;
            max-width: 20rem;
          }

          .results-container {
            grid-area: result;
            max-width: 20rem;
            padding: 0 1rem;
          }
        `
      )}
    `;
  }

  _calculateMaxRiskAmount() {
    this.data.balance = parseFloat(this.balanceElem?.value || "0");
    this.data.maxloss = parseFloat(this.maxlossElem?.value || "0") / 100;
    this.data.maxRiskAmount = Math.ceil(this.data.balance * this.data.maxloss);
    if (this.maxRiskAmountElem) {
      this.maxRiskAmountElem.value = String(this.data.maxRiskAmount);
    }
  }

  _calculatePositionSize() {
    this.data.entry = parseFloat(this.entryElem?.value || "0");
    this.data.stoploss = parseFloat(this.stoplossElem?.value || "0");
    if (
      this.data.stoploss &&
      this.data.entry &&
      this.data.entry !== this.data.stoploss
    ) {
      this.data.positionSize =
        Math.floor(
          this.data.maxRiskAmount /
            Math.abs(this.data.stoploss - this.data.entry)
        ) || 0;
    } else {
      this.data.positionSize = 0;
    }

    if (this.positionSizeElem) {
      this.positionSizeElem.value = String(this.data.positionSize);
    }
  }

  firstUpdated() {
    if (!this.shadowRoot) {
      return;
    }
    this.balanceElem = this.shadowRoot.querySelector("[name='balance']");
    this.maxlossElem = this.shadowRoot.querySelector("[name='maxloss']");
    this.maxRiskAmountElem = this.shadowRoot.querySelector(
      "[name='maxRiskAmount']"
    );
    this.entryElem = this.shadowRoot.querySelector("[name='entry']");
    this.stoplossElem = this.shadowRoot.querySelector("[name='stoploss']");
    this.positionSizeElem = this.shadowRoot.querySelector(
      "[name='positionSize']"
    );

    this.clearElem = this.shadowRoot.querySelector("[name='clear']");

    this._calculateMaxRiskAmount();
    this._calculatePositionSize();
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
    this._calculatePositionSize();
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
        <dt><strong>Account Balance</strong></dt>
        <dd><em>The size of the account</em></dd>
        <dt><strong>Max Loss</strong></dt>
        <dd><em>The percentage of the account to risk</em></dd>
        <dt><strong>Entry Price</strong></dt>
        <dd><em>Current price of the stock to buy</em></dd>
        <dt><strong>Stop Loss Price</strong></dt>
        <dd><em>The price limit to exit the trade (short/long)</em></dd>
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
      <div class="results-container">
        <h3>Results</h3>
        <dl>
          <stocker-result
            label="Money in Risk ($)"
            name="maxRiskAmount"
          ></stocker-result>
          <stocker-result
            label="Position Size"
            name="positionSize"
          ></stocker-result>
        </dl>
      </div>
    `;
  }
}
