import { LitElement, html, css } from "lit";

export class StockerInput extends LitElement {
  constructor() {
    super();
    this.label;
    this.name;
    this.required;
    this.value;
    this.input;
    this.labelElem;
  }

  static get properties() {
    return {
      label: { type: String },
      name: { type: String, reflect: true },
      required: { type: Boolean, reflect: true },
      value: { type: String },
      type: { type: String },
      right: { type: Boolean, reflect: true },
      unit: { type: String, reflect: true },
      showUnit: { type: Boolean },
    };
  }

  static get styles() {
    return css`
      :host {
        position: relative;
        display: flex;
        flex-direction: column;
      }
      .form {
        padding: 0 1.5rem 1.5rem;
      }
      :host([right]) input {
        text-align: right;
      }
      :host([unit]) input {
        padding-right: 2rem;
      }
      input {
        box-sizing: border-box;
        font-size: 1.2rem;
        font-family: inherit;
        color: inherit;
        border-radius: 2px;
        background-color: transparent;
        border: none;
        width: 100%;
        display: block;
        padding-right: 0.5rem;
      }
      input:focus {
        outline: none;
      }
      input::placeholder {
        opacity: 0;
        transition: all 0.2s ease-in-out;
      }

      .label {
        font-size: 1.2rem;
        cursor: text;
        display: block;
        transition: all 0.2s ease-in-out;
        color: var(--support-dark);
        position: absolute;
        bottom: 2.25rem;
        transform: translateY(2rem) scale(1);
        user-select: none;
      }

      :host(:not([right])) .label {
        left: 0.5rem;
        transform-origin: top left;
      }

      :host([right]) .label {
        right: 0.5rem;
        transform-origin: top right;
      }

      .label-show {
        transform: translateY(1.5px) scale(0.75);
        color: var(--light-brand);
        user-select: initial;
      }

      .input-container {
        background-color: #eee;
        position: relative;
        padding: 0.5rem 0px;
        border-bottom: 3px solid var(--dark-brand);
        margin-top: 2rem;
      }

      .input-focused {
        border-bottom: 3px solid var(--light-brand);
      }

      .input-focused input::placeholder {
        opacity: 1;
      }

      .overflew {
        position: absolute;
        width: 100%;
        height: 2rem;
        box-shadow: inset 0 1px 0 var(--lighter-grey);
      }

      .unit {
        position: absolute;
        right: 0.5rem;
        bottom: 0.5rem;
        font-size: 0.8rem;
        width: 1rem;
      }
    `;
  }

  willUpdate(changedProperties) {
    changedProperties.forEach((_, propName) => {
      if (propName === "value" && this.value === null) this._valueReset();
    });
  }

  firstUpdated() {
    this.labelElem = this.shadowRoot.querySelector("label");
    this.input = this.shadowRoot.querySelector("input");
    if (this.input && this.labelElem && this.input.value) {
      this.labelElem.classList.add("label-show");
    }
  }

  renderInput() {
    return html`
      <input
        name=${this.name}
        pattern=${this.pattern}
        id=${`input-${this.name}`}
        type="text"
        ?required=${this.required}
        @input=${this._inputHandler}
        @focus=${this._handleFocus}
        @change=${this._handleChange}
        @blur=${this._handleBlur}
        @beforeinput=${this._handleBeforeInput}
      />
    `;
  }

  renderUnit() {
    if (this.showUnit) {
      return html` <span class="unit">${this.unit}</span> `;
    }
  }

  _valueReset() {
    this.input.value = null;
    this.labelElem.classList.remove("label-show");
    this.showUnit = false;
  }

  _handleBeforeInput(event) {
    const newData = event.target.value + event.data;
    const isDelete = ["deleteContentBackward", "deleteContentForward"].includes(
      event.inputType
    );

    switch (this.type) {
      case "number":
        if (isNaN(newData) && !isDelete) {
          event.preventDefault();
        }
        break;
      default:
        return;
    }
  }

  _handleChange() {
    if (this.labelElem && !this.labelElem.classList.contains("label-show")) {
      this._handleFocus();
    }
  }

  _handleFocus() {
    const inputContainer = this.shadowRoot.querySelector(".input-container");
    if (this.labelElem) {
      this.labelElem.classList.add("label-show");
    }
    if (inputContainer) {
      inputContainer.classList.add("input-focused");
      this.showUnit = !!this.unit;
    }
  }

  _handleBlur() {
    const inputContainer = this.shadowRoot.querySelector(".input-container");
    if (this.labelElem && this.input && !this.input.value) {
      this.labelElem.classList.remove("label-show");
      this.showUnit = false;
    }
    if (inputContainer) {
      inputContainer.classList.remove("input-focused");
    }
  }

  _inputHandler(event) {
    let value = event.composedPath()[0].value;

    if (this.type === "uppercase") {
      value = value.toUpperCase();
      this.input.value = value;
    }

    this.value = value;

    const customEv = new CustomEvent("input-update", {
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(customEv);
  }

  render() {
    return html`
      <div class="input-container">
        ${this.renderInput()} ${this.renderUnit()}
      </div>
      <label class="label" for=${`input-${this.name}`}>${this.label}</label>
    `;
  }
}

window.customElements.define("stocker-input", StockerInput);
