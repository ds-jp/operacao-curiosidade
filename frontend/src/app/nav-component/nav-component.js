class NavD extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <style>
        nav#desktop {
          padding: 15px 15px 35px 8px;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          height: 100%;
          width: 339px;
          position: fixed;
          top: 0;
          left: 0;
          overflow-x: hidden;
          background-color: var(--color-02);
        }

        nav#desktop>div#logo {
          background-color: var(--color-12);
          display: flex;
          align-items: center;
          font-family: 'Inter', sans-serif;
          font-style: normal;
        }

        nav#desktop>div#logo>p {
          font-size: 36px;
          font-weight: 900;
          letter-spacing: -2px;
          margin: 0px 12px;
        }

        nav#desktop>div#logo>h1 {
          font-size: 12px;
          margin-bottom: -3px;
          font-weight: 400;
        }

        nav#desktop>a {
          text-decoration: none;
          color: var(--color-13);
          width: 100%;
          padding-top: 8.5px;
          padding-bottom: 8.5px;
          display: inline-block;
        }

        nav#desktop>a:hover {
          text-decoration: underline;
          color: var(--color5);
          font-size: 18px;
        }

        nav#desktop>a>span {
          padding-right: 3px;
          transform: translate(10%, 18%);
          color: var(--color-13);
        }

        nav#desktop>div#btn-mudar-tema {
          width: 100%;
          padding-top: 8.5px;
          padding-bottom: 8.5px;
          display: inline-flex;
          align-items: center;
          padding-left: 4px;
        }

        nav#desktop>div#btn-mudar-tema>span {
          color: var(--color-13);
        }

        nav#desktop>div#btn-mudar-tema>label {
          color: var(--color-13);
          margin-left: 5px;
        }
      </style>
      <nav id="desktop">
        <div class="user-select" id="logo">
          <p>OC</p>
          <h1>Operação Curiosidade</h1>
        </div>
        <a class="transition" href="../home/home.html"><span class="material-symbols-outlined">home</span>Home</a>
        <a class="transition" href="../cadastro/cadastro.html"><span class="material-symbols-outlined">person_add</span>Cadastro</a>
        <a class="transition" href="../relatorio/relatorio.html"><span class="material-symbols-outlined">insert_chart</span>Relatórios</a>
        <a class="transition" href="../registros/registros.html"><span class="material-symbols-outlined">article</span>Registros</a>
        <div id="btn-mudar-tema">
          <span class="material-symbols-outlined">
          dark_mode</span>
          <span>Mudar Tema:</span>
          <label class="switch">
            <input type="checkbox" id='mudar-tema-desktop'>
            <span class="slider round"></span>
          </label>
        </div>
      </nav>
    `;
  }
}

customElements.define('nav-component', NavD);
