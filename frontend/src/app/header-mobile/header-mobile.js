class Header extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <style>
        header#mobile {
          background-color: var(--color-09);
          display: flex;
          margin: auto;
          width: 100%;
          height: 50px;
          padding: 5px;
          align-items: center;
          justify-content: space-between;

          z-index: 2;
        }

        header#mobile>div#pesquisa {
          display: flex;
          align-items: center;
          width: 45%;
        }

        header#mobile>div#pesquisa>span {
          cursor: pointer;
          z-index: 2;
        }

        header#mobile>div#pesquisa>div#logo-mobile {
          display: flex;
          align-items: center;
          font-family: 'Inter', sans-serif;
          font-style: normal;
        }

        header#mobile>div#pesquisa>div#logo-mobile>p {
          font-size: 36px;
          font-weight: 900;
          letter-spacing: -2px;
          margin: 0px 12px;
        }

        header#mobile>div#pesquisa>div#logo-mobile>h1 {
          font-size: 12px;
          margin-bottom: -3px;
          font-weight: 400;
        }

        header#mobile>div#pesquisa>span#search {
          margin-left: 10px;
          border: 1px solid var(--color-08);
        }

        header#mobile>div#pesquisa>form {
          margin-left: 5px;
          display: none;
          width: 90%;

          transition: opacity 0.35s ease-in-out, transform 0.35s ease-in-out;
          opacity: 0;
          transform: translateX(-100%);

          z-index: 1;
        }

        header#mobile>div#pesquisa>form.visivel {
          opacity: 1;
          transform: translateX(0);
        }

        header#mobile>div#pesquisa>form>input {
          width: 100%;
          height: 30px;
          padding: 5px;
          font-size: 12px;
          background-color: var(--color-03);
          border: 0px;
        }

        header#mobile>div#pesquisa>form>input:focus {
          height: 36px;
        }

        header#mobile>div#usuario {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          float: right;
          text-align: center;
          height: 100%;
          padding: 0px 9px 0px 3px;
          font-size: 13px;
        }

        header#mobile>div#usuario>img {
          display: inline-block;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-right: 6px;
        }

        header#mobile>div#usuario>span {
          margin-right: 6px;
        }

        header#mobile>div#usuario>span#divisor {
          border: 1px solid var(--color-11);
          height: 25px;
        }

        header#mobile>div#usuario>span#logout {
          cursor: pointer;
        }

        header#mobile>div#usuario>span#logout:hover {
          text-decoration: underline;
          color: var(--color-10);
        }

        @media screen and (max-width: 445px) {
          header#mobile>div#pesquisa>div#logo-mobile>h1 {
            display: none;
          }
        }

        @media screen and (max-width: 594px) {
          header#mobile>div#usuario>span {
            max-width: 120px;
          }
        }
      </style>
      <header id="mobile">
        <div id="pesquisa">
          <span class="material-symbols-outlined" id="toggle-menu">menu</span>
          <div class="user-select" id="logo-mobile">
            <p>OC</p>
            <h1>Operação Curiosidade</h1>
          </div>
          <form class="pesquisa" autocomplete="off" id="search-bar">
            <input class="transition" type="search" name="pesq" id="ipesq-mobile" title="Digite aqui sua pesquisa pelo nome do usuário" placeholder="Pesquisar pelo nome...">
          </form>
          <span class="material-symbols-outlined" id="search">search</span>
        </div>
        <div id="usuario">
          <img src="../../assets/images/foto-usuario.jpeg" alt="Foto do usuário"></img>
          <span>João Pedro</span>
          <span id="divisor"></span>
          <span id="logout" class="logout">SAIR</span>
        </div>
    </header>
    `;
  }
}

customElements.define("header-mobile-component", Header);
