class Popup extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
    <style>
    .popup {
      position: fixed;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.85);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 2;
    }

    .popup-content {
      background-color: var(--color-02);
      padding: 20px;
      width: 80%;
      max-width: 552px;
      border-radius: 10px;
    }

    .popup-content > h2 {
      border-bottom: 1px solid var(--color-01);
      margin-bottom: 15px;
    }

    .popup-content > h2,
    .popup-content > p {
      color: var(--color-01)
    }

    .buttons {
      display: flex;
      align-items: center;
      width: 55%;
      justify-content: space-between;
    }

    .popup-button {
      margin-top: 20px;
      color: var(--color-02);
      font-weight: bold;
      border-radius: 5px;
      width: 80px;
      border: none;
      padding: 5px;
      cursor: pointer;
    }

    .popup-close, .popup-alterar {
      background-color: var(--color-07);
    }

    .popup-close:hover, .popup-alterar:hover {
      color: var(--color-08);
      background-color: var(--color-13);
    }

    .popup-alterar, .popup-excluir {
      display: none;
    }

    .popup-excluir {
      background-color: var(--color-05);
    }

    .popup-excluir:hover {
      background-color: #ff4444;
    }
    </style>
    <div class="popup">
      <div class="popup-content">
        <h2 class="popup-title"></h2>
        <p class="popup-message"></p>
        <div class="buttons">
          <button class="popup-button popup-close">FECHAR</button>
          <button class="popup-button popup-alterar" id="popup-alterar">ALTERAR</button>
          <button class="popup-button popup-excluir" id="popup-excluir">EXCLUIR</button>
        </div>
      </div>
    </div>
    `;
  }
}

customElements.define('popup-component', Popup);
