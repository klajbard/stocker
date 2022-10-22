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
import { customElement } from "lit/decorators.js";
import { respondTo } from "./utils";

Chart.register(ArcElement, DoughnutController, Legend, Tooltip);

interface Portfolio {
  ticker: string;
  price: string;
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
            const price = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(parsed);
            return `${label} - ${portion}% - ${price}`;
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
  priceElem?: HTMLInputElement | null;
  amountElem?: HTMLInputElement | null;
  addElem?: HTMLButtonElement | null;
  sum: number;

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

      table tr > *:not(:first-of-type) {
        width: 20%;
        padding: 0 0.5rem;
        text-align: end;
      }

      table tr > *:nth-of-type(2) {
        text-align: start;
      }

      .remove {
        padding: 0.3rem;
        background: none;
        border: none;
        cursor: pointer;
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

  addData(label: string, data: number) {
    if (!this.chart?.data.datasets) {
      return;
    }
    const labelIndex =
      this.chart?.data.labels?.findIndex((dataLabel) => dataLabel === label) ??
      -1;
    if (labelIndex > -1) {
      (this.chart.data.datasets[0].data[labelIndex] as number) += data;
    } else {
      this.chart?.data.labels?.push(label);
      this.chart?.data.datasets?.[0].data?.push(data);
    }
    this.sum = this.sum + data;
    this.chart?.update();
  }

  clearData() {
    if (this.chart) {
      this.chart.data.labels = [];
      this.chart.data.datasets?.forEach((dataset) => {
        dataset.data = [];
      });
      this.chart.update();
    }
    this.sum = 0;
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
          parseFloat(portfolioElem.amount) * parseFloat(portfolioElem.price)
        );
      });
    }
    this.tickerElem = this.shadowRoot.querySelector("[name='ticker']");
    this.priceElem = this.shadowRoot.querySelector("[name='price']");
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
    if (this.priceElem) this.priceElem.value = null as any;
    if (this.amountElem) this.amountElem.value = null as any;
  }

  _handleInputUpdate() {
    if (this.addElem) {
      this.addElem.disabled = !(
        this.tickerElem?.value &&
        this.priceElem?.value &&
        this.amountElem?.value
      );
    }
  }

  _handleClickAdd() {
    if (
      !this.tickerElem?.value ||
      !this.priceElem?.value ||
      !this.amountElem?.value
    ) {
      return;
    }
    this.data.push({
      ticker: this.tickerElem.value,
      price: this.priceElem.value,
      amount: this.amountElem.value,
    });
    this.addData(
      this.tickerElem.value,
      parseFloat(this.amountElem?.value || "0") *
        parseFloat(this.priceElem?.value || "0")
    );
    this._handleResetInputs();
    this.saveDataToLS();
  }

  saveDataToLS() {
    localStorage.setItem("portfolio", JSON.stringify(this.data));
  }

  _handleClickClearLS() {
    const dialogResult = confirm(`Remove all previously added data?`);
    if (!dialogResult) {
      return;
    }
    localStorage.removeItem("portfolio");
    this.clearData();
    this.shadowRoot?.querySelector(".table-container > table")?.remove();
  }

  _handleRemoveClick =
    (ticker: string, amount: string, price: string) => () => {
      const dialogResult = confirm(
        `Remove ${ticker} from list (quote: $${price}, amount: ${amount})?`
      );
      if (!dialogResult) {
        return;
      }
      const indexToRemoveLS = this.data.findIndex(
        (elem) =>
          elem.ticker === ticker &&
          elem.price === price &&
          elem.amount === amount
      );
      if (indexToRemoveLS > -1) {
        this.data.splice(indexToRemoveLS, 1);
        this.saveDataToLS();
      }
      this.sum = this.data.reduce(
        (acc, elem) => acc + parseFloat(elem.amount) * parseFloat(elem.price),
        0
      );

      const indexToRemoveChart =
        this.chart?.data.labels?.findIndex((label) => label === ticker) ?? -1;

      if (indexToRemoveChart > -1) {
        const totalPrice = parseFloat(amount) * parseFloat(price);
        const elemTotalPrice = this.chart?.data.datasets[0].data[
          indexToRemoveChart
        ] as number;

        if (elemTotalPrice > totalPrice && this.chart?.data.datasets) {
          (this.chart.data.datasets[0].data[indexToRemoveChart] as number) -=
            totalPrice;
        } else {
          this.chart?.data.labels?.splice(indexToRemoveChart, 1);
          this.chart?.data.datasets?.[0].data?.splice(indexToRemoveChart, 1);
        }
        this.chart?.update();
      }
    };

  renderTableRow({ ticker, amount, price }: Portfolio) {
    const totalPrice = parseFloat(amount) * parseFloat(price);
    return html`
      <tr>
        <td>
          <button
            class="remove"
            @click=${this._handleRemoveClick(ticker, amount, price)}
          >
            &#x274c;
          </button>
        </td>
        <td>${ticker}</td>
        <td><em>${price}</em></td>
        <td><em>${amount}</em></td>
        <td><em>${totalPrice}</em></td>
        <td><strong>${((totalPrice / this.sum) * 100).toFixed(2)}</strong></td>
      </tr>
    `;
  }

  renderTable() {
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
        ${this.data.map((elem) => this.renderTableRow(elem))}
      </table>
    `;
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
          label="Price"
          name="price"
          unit="$"
          type="number"
          right
        ></stocker-input>
        <div class="action-container">
          <stocker-button name="add" disabled @click=${this._handleClickAdd}
            >Add</stocker-button
          >
          <stocker-button name="clear" @click=${this._handleClickClearLS}>
            Clear storage
          </stocker-button>
        </div>
      </div>
      <div class="chart-container">
        <canvas id="portfolio"></canvas>
      </div>
      <div class="table-container">${this.renderTable()}</div>
    `;
  }
}
