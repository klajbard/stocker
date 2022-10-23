import {
  ArcElement,
  Chart,
  ChartConfiguration,
  DefaultDataPoint,
  DoughnutController,
  Legend,
  Tooltip,
  TooltipItem,
} from "chart.js";
import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { respondTo } from "./utils";

Chart.register(ArcElement, DoughnutController, Legend, Tooltip);

interface Portfolio {
  ticker: string;
  quote: string;
  amount: string;
}

const chartConfig: ChartConfiguration<
  "doughnut",
  DefaultDataPoint<"doughnut">,
  string
> = {
  type: "doughnut",
  data: {
    labels: [],
    datasets: [
      {
        label: "Portfolio",
        data: [],
        backgroundColor: [
          "rgb(255, 99, 132)",
          "rgb(54, 162, 235)",
          "rgb(255, 205, 86)",
          "rgb(60,82,145)",
          "rgb(203, 161, 53)",
          "rgb(134, 38, 51)",
          "rgb(229, 158, 109)",
          "rgb(93, 55, 84)",
        ],
        hoverOffset: 4,
      },
    ],
  },
  options: {
    plugins: {
      tooltip: {
        callbacks: {
          label: ({ dataset, label, parsed }: TooltipItem<"doughnut">) => {
            const value = parsed;
            const sum = dataset.data.reduce((a, b) => a + b, 0);
            const portion = ((value / sum) * 100).toFixed(1);
            const quote = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(parsed);
            return `${label} - ${portion}% - ${quote}`;
          },
        },
      },
    },
  },
};

@customElement("portfolio-overview")
export class PortfolioOverview extends LitElement {
  chart?: Chart;
  data: Portfolio[] = [];
  tickerElem?: HTMLInputElement | null;
  quoteElem?: HTMLInputElement | null;
  amountElem?: HTMLInputElement | null;
  addElem?: HTMLButtonElement | null;
  sum: number;

  @state()
  private alreadyAdded?: boolean;

  constructor() {
    super();
    this.chart;
    this.data = [];
    this.sum = 0;
  }

  static properties = {
    sum: { type: Number },
  };

  static get styles() {
    return css`
      :host {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .input-container {
        margin: 0 auto;
        width: 100%;
        max-width: 18rem;
      }

      .chart-container {
        margin: 0 auto;
        width: 18rem;
      }

      .table-container {
        box-shadow: var(--support-dark) 0px -3px 9px -6px inset;
        overflow-y: auto;
      }

      table {
        min-width: 30rem;
      }

      table tr > td {
        border-top: 1px solid var(--lighter-grey);
      }

      table tr > td:first-of-type {
        display: flex;
      }

      table tr > *:not(:first-of-type) {
        width: 20%;
        padding: 0 0.5rem;
        text-align: end;
      }

      table tr > *:nth-of-type(2) {
        text-align: start;
      }

      .action-button {
        padding: 0.3rem;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1rem;
      }

      .action-button.clear {
        color: var(--support-red);
      }

      .action-button.edit {
        color: var(--support-blue);
      }

      .action-container {
        margin-top: 0.5rem;
        display: flex;
      }

      ${respondTo(
        "tablet",
        css`
          :host {
            display: grid;
            grid-template-areas:
              "input chart"
              "table table";
            grid-template-columns: repeat(2, 1fr);
          }

          .input-container {
            grid-area: input;
            max-width: 20rem;
          }

          .chart-container {
            grid-area: chart;
            max-width: 20rem;
          }

          .table-container {
            box-shadow: none;
            grid-area: table;
          }
        `
      )}

      ${respondTo(
        "desktop",
        css`
          :host {
            grid-template-areas: "input chart table";
            grid-template-columns: repeat(3, 1fr);
          }
        `
      )}
    `;
  }

  addData(label?: string, data?: number) {
    if (!(this.chart?.data.datasets && label && data)) {
      return;
    }
    this.chart?.data.labels?.push(label);
    this.chart?.data.datasets?.[0].data?.push(data);
    this.sum = this.sum + data;
    this.chart?.update();
  }

  firstUpdated() {
    if (!this.shadowRoot) {
      return;
    }
    this.chart = new Chart(
      this.shadowRoot?.getElementById("portfolio") as HTMLCanvasElement,
      chartConfig
    );

    const dataLS = localStorage.getItem("portfolio");
    if (dataLS) {
      const parsedPortfolio: Portfolio[] = JSON.parse(dataLS);
      parsedPortfolio.forEach((portfolioElem) => {
        this.data.push(portfolioElem);
        this.addData(
          portfolioElem.ticker,
          parseFloat(portfolioElem.amount) * parseFloat(portfolioElem.quote)
        );
      });
    }
    this.tickerElem = this.shadowRoot.querySelector("[name='ticker']");
    this.quoteElem = this.shadowRoot.querySelector("[name='quote']");
    this.amountElem = this.shadowRoot.querySelector("[name='amount']");
    this.addElem = this.shadowRoot.querySelector("[name='add']");
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
    if (this.tickerElem) this.tickerElem.value = null as any;
    if (this.quoteElem) this.quoteElem.value = null as any;
    if (this.amountElem) this.amountElem.value = null as any;
  }

  _handleInputUpdate() {
    this.alreadyAdded = false;
    if (this.addElem) {
      this.addElem.disabled = !this._isValid();
    }
  }

  _isValid() {
    return (
      this.tickerElem?.value &&
      this.quoteElem?.value &&
      parseFloat(this.quoteElem?.value) &&
      this.amountElem?.value &&
      parseFloat(this.amountElem?.value)
    );
  }

  _handleClickAdd() {
    if (!this._isValid()) {
      return;
    }
    const item = this.data.find(
      (elem) => elem.ticker === this.tickerElem?.value
    );

    if (item) {
      this.alreadyAdded = true;
    } else {
      this.data.push({
        ticker: this.tickerElem?.value || "",
        quote: this.quoteElem?.value || "",
        amount: this.amountElem?.value || "",
      });
      this.addData(
        this.tickerElem?.value,
        parseFloat(this.amountElem?.value || "0") *
          parseFloat(this.quoteElem?.value || "0")
      );
      this._handleResetInputs();
      this.saveDataToLS();
    }
  }

  saveDataToLS() {
    localStorage.setItem("portfolio", JSON.stringify(this.data));
  }

  _handleRemoveClick =
    (ticker: string, amount: string, quote: string) => () => {
      this.alreadyAdded = false;
      const dialogResult = confirm(
        `Remove ${ticker} from list (quote: $${quote}, amount: ${amount})?`
      );
      if (!dialogResult) {
        return;
      }
      const indexToRemoveLS = this.data.findIndex(
        (elem) => elem.ticker === ticker
      );
      if (indexToRemoveLS > -1) {
        this.data.splice(indexToRemoveLS, 1);
        this.saveDataToLS();
      }
      this.sum = this.data.reduce(
        (acc, elem) => acc + parseFloat(elem.amount) * parseFloat(elem.quote),
        0
      );

      const indexToRemoveChart =
        this.chart?.data.labels?.findIndex((label) => label === ticker) ?? -1;
      if (indexToRemoveChart > -1) {
        this.chart?.data.labels?.splice(indexToRemoveChart, 1);
        this.chart?.data.datasets?.[0].data?.splice(indexToRemoveChart, 1);
        this.chart?.update();
      }
    };

  _handleEditValue =
    (ticker: string, type: "amount" | "quote", defaultValue: string) => () => {
      const value = prompt(
        `Edit ${type.toUpperCase()} of ${ticker}:`,
        defaultValue
      );
      const newValue = parseFloat(value || "");

      if (!newValue) {
        return;
      }

      const elemToChangeLS = this.data.find((elem) => elem.ticker === ticker);
      const delta = newValue - parseFloat(elemToChangeLS?.[type] || "0");
      const deltaSum =
        delta *
        parseFloat(
          elemToChangeLS?.[type === "amount" ? "quote" : "amount"] || "0"
        );

      if (elemToChangeLS) {
        elemToChangeLS[type] = String(newValue);
        this.saveDataToLS();
        this.sum += deltaSum;
      }

      const elemIndexChart =
        this.chart?.data.labels?.findIndex((label) => label === ticker) ?? -1;
      if (elemIndexChart > -1 && this.chart?.data.datasets?.[0].data) {
        const newData = this.chart.data.datasets[0].data.map((value, index) => {
          if (index === elemIndexChart && typeof value === "number") {
            return value + deltaSum;
          }
          return value;
        });
        this.chart.data.datasets[0].data = newData;
        this.chart?.update();
      }
    };

  _renderTableRow({ ticker, amount, quote }: Portfolio) {
    const totalQuote = parseFloat(amount) * parseFloat(quote);
    return html`
      <tr>
        <td>
          <button
            class="action-button clear"
            @click=${this._handleRemoveClick(ticker, amount, quote)}
          >
            &#x2718;
          </button>
        </td>
        <td>${ticker}</td>
        <td>
          <em>
            ${quote}<button
              class="action-button edit"
              @click=${this._handleEditValue(ticker, "quote", quote)}
            >
              &#x270E;
            </button></em
          >
        </td>
        <td>
          <em>
            ${amount}<button
              class="action-button edit"
              @click=${this._handleEditValue(ticker, "amount", amount)}
            >
              &#x270E;
            </button></em
          >
        </td>
        <td><em>${totalQuote.toFixed(2)}</em></td>
        <td><strong>${((totalQuote / this.sum) * 100).toFixed(2)}</strong></td>
      </tr>
    `;
  }

  _renderTable() {
    if (!this.data?.length) {
      return html``;
    }
    return html`
      <table>
        <tr>
          <th></th>
          <th>Ticker</th>
          <th>Quote ($)</th>
          <th>Amount</th>
          <th>Total ($)</th>
          <th>Weight (%)</th>
        </tr>
        ${this.data.map((elem) => this._renderTableRow(elem))}
      </table>
    `;
  }

  _renderError() {
    if (this.alreadyAdded) {
      return html` Item already added! Please use edit to modify parameters! `;
    }

    return html``;
  }

  render() {
    return html`
      <div class="input-container">
        <stocker-input
          label="Ticker"
          name="ticker"
          type="uppercase"
          right
        ></stocker-input>
        <stocker-input
          label="Amount"
          name="amount"
          type="number"
          right
        ></stocker-input>
        <stocker-input
          label="Quote"
          name="quote"
          unit="$"
          type="number"
          right
        ></stocker-input>
        <div class="action-container">
          <stocker-button name="add" disabled @click=${this._handleClickAdd}
            >Add</stocker-button
          >
        </div>
        ${this._renderError()}
      </div>
      <div class="chart-container">
        <canvas id="portfolio"></canvas>
      </div>
      <div class="table-container">${this._renderTable()}</div>
    `;
  }
}
