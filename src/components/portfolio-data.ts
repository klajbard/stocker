import { ArcElement, Chart, ChartConfiguration, DefaultDataPoint, DoughnutController, Legend, Tooltip, TooltipItem } from "chart.js";
import { LitElement, html, css } from "lit";
import {customElement} from 'lit/decorators.js';

Chart.register(ArcElement, DoughnutController, Legend, Tooltip)

interface Portfolio {
  ticker: string
  price: string
  amount: string
}

const chartConfig: ChartConfiguration<"doughnut", DefaultDataPoint<"doughnut">, string> = {
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

@customElement('portfolio-data')
export class PortfolioData extends LitElement {
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
        grid-template-areas: "input chart table";
        grid-template-columns: 1fr 1fr 1fr;
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
        grid-area: table;
      }
    `;
  }

  addData(label: string, data: number) {
    this.chart?.data.labels?.push(label);
    this.chart?.data.datasets?.forEach((dataset) => {
      dataset.data?.push(data);
    });
    this.sum = this.sum + data;
    this.chart?.update();
  }

  clearData() {
    if (this.chart){
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
      return
    }
    this.chart = new Chart(
      this.shadowRoot?.getElementById("portfolio") as HTMLCanvasElement,
      chartConfig
    );

    const dataLS = localStorage.getItem("portfolio");
    if (dataLS) {
      const parsedPortfolio: Portfolio[] = JSON.parse(dataLS)
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
    if (this.tickerElem) this.tickerElem.value = "";
    if (this.priceElem) this.priceElem.value = "";
    if (this.amountElem) this.amountElem.value = "";
  }

  _handleInputUpdate() {
    if (this.addElem) this.addElem.disabled = !(
      this.tickerElem?.value &&
      this.priceElem?.value &&
      this.amountElem?.value
    );
  }

  _handleClickAdd() {
    this.data.push({
      ticker: this.tickerElem?.value || "",
      price: this.priceElem?.value || "",
      amount: this.amountElem?.value || "",
    });
    this.addData(
      this.tickerElem?.value || "",
      parseFloat(this.amountElem?.value || "0") * parseFloat(this.priceElem?.value || "0")
    );
    this._handleResetInputs();
    this.saveDataToLS();
  }

  saveDataToLS() {
    localStorage.setItem("portfolio", JSON.stringify(this.data));
  }

  _handleClickClearLS() {
    localStorage.removeItem("portfolio");
    this.clearData();
  }

  _handleRemoveClick = (ticker: string) => () => {
    const indexRemove = this.data.findIndex((elem) => elem.ticker === ticker);
    this.data.splice(indexRemove, 1);
    this.saveDataToLS();
    this.sum = this.data.reduce(
      (acc, elem) => acc + parseFloat(elem.amount) * parseFloat(elem.price),
      0
    );
    this.chart?.data.labels?.splice(indexRemove, 1);
    this.chart?.data.datasets?.forEach((dataset) => {
      dataset.data?.splice(indexRemove, 1);
    });
    this.chart?.update();
  };

  renderTableRow({ ticker, amount, price }: Portfolio) {
    return html`
      <tr>
        <td>${ticker}</td>
        <td>${amount}</td>
        <td>${price}</td>
        <td>${(((parseFloat(amount) * parseFloat(price)) / this.sum) * 100).toFixed(2)} %</td>
        <td>
          <button @click=${this._handleRemoveClick(ticker)}>Remove</button>
        </td>
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
          <th>Ticker</th>
          <th>Price</th>
          <th>Amount</th>
          <th>Total</th>
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
        <button name="add" disabled @click=${this._handleClickAdd}>Add</button>
        <button name="clear" @click=${this._handleClickClearLS}>
          Clear storage
        </button>
      </div>
      <div class="chart-container">
        <canvas id="portfolio"></canvas>
      </div>
      <div class="table-container">${this.renderTable()}</div>
    `;
  }
}
