class HeaderD extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <style>
        header#desktop {
          width: 100%;
          padding: 15px 16px 6px 355px;
        }

        header#desktop>div {
          background-color: var(--color-09);
          display: flex;
          margin: auto;
          width: 100%;
          height: 51px;
          padding: 5px;
          align-items: center;
          justify-content: space-between;
        }

        header#desktop>div>div#pesquisa {
          display: flex;
          align-items: center;
          width: 45%;
        }

        header#desktop>div>div#pesquisa>span {
          cursor: pointer;
        }

        header#desktop>div>div#pesquisa>form {
          float: left;
          margin-left: 5px;
          width: 90%;
        }

        header#desktop>div>div#pesquisa>form>input {
          width: 100%;
          height: 30px;
          padding: 5px;
          font-size: 13px;
          background-color: var(--color-03);
          border: 0px;
        }

        header#desktop>div>div#pesquisa>form>input:focus {
          height: 36px;
          width: 105%;
        }

        header#desktop>div>div#usuario {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          float: right;
          text-align: center;
          height: 100%;
          padding: 0px 9px 0px 3px;
          font-size: 14px;
        }

        header#desktop>div>div#usuario>img {
          display: inline-block;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-right: 17px;
        }

        header#desktop>div>div#usuario>span {
          margin-right: 15px;
        }

        header#desktop>div>div#usuario>span#divisor {
          border: 1px solid var(--color-11);
          height: 25px;
        }

        header#desktop>div>div#usuario>span#logout {
          cursor: pointer;
        }

        header#desktop>div>div#usuario>span#logout:hover {
          text-decoration: underline;
          color: var(--color-10);
        }
      </style>
      <header id="desktop">
        <div>
          <div id="pesquisa">
            <form class="pesquisa" autocomplete="off">
              <input class="transition" type="search" name="pesq" id="ipesq-desktop" title="Digite aqui sua pesquisa pelo nome do usuário" placeholder="Pesquisar pelo nome...">
              </form>
            </div>
            <div id="usuario">
              <img src="../../assets/images/foto-usuario.jpeg" alt="Foto do usuário"></img>
              <span>João Pedro</span>
              <span id="divisor"></span>
              <span id="logout" class="logout">SAIR</span>
            </div>
          </div>
      </header>
    `;
  }
}

customElements.define("header-component", HeaderD);
