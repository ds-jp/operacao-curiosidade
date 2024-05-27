class Nav extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <style>
        nav.dropdown {
          position: absolute;
          padding: 15px 15px 35px 8px;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          width: 100%;
          background-color: var(--color-02);
          display: none;
          height: auto;

          transition: opacity 0.35s ease-in-out, transform 0.35s ease-in-out;
          opacity: 0;
          transform: translateY(-100%);

          z-index: 1;
        }

        nav.visivel {
          opacity: 1;
          transform: scale(1);
          transform: translateY(0);
        }

        nav.dropdown>div#logo {
          background-color: var(--color-03);
          display: flex;
          align-items: center;
          font-family: 'Inter', sans-serif;
          font-style: normal;
        }

        nav.dropdown>div#logo>p {
          font-size: 36px;
          font-weight: 900;
          letter-spacing: -2px;
          margin: 0px 12px;
        }

        nav.dropdown>div#logo>h1 {
          font-size: 12px;
          margin-bottom: -3px;
          font-weight: 400;
        }

        nav.dropdown>a {
          text-decoration: none;
          color: var(--color-13);
          width: 100%;
          padding-top: 8.5px;
          padding-bottom: 8.5px;
          display: inline-block;
        }

        nav.dropdown>a:hover {
          text-decoration: underline;
          color: var(--color5);
          font-size: 18px;
        }

        nav.dropdown>a>span {
          padding-right: 3px;
          transform: translate(10%, 18%);
          color: var(--color-13);
        }

        nav.dropdown>div#btn-mudar {
          width: 100%;
          padding-top: 8.5px;
          padding-bottom: 8.5px;
          display: inline-flex;
          align-items: center;
          padding-left: 4px;
        }

        nav.dropdown>div#btn-mudar>span {
          color: var(--color-13);
        }

        nav.dropdown>div#btn-mudar>label {
          margin-left: 5px;
        }
      </style>
      <nav class="dropdown">
        <div class="user-select" id="logo">
          <p>OC</p>
          <h1>Operação Curiosidade</h1>
        </div>
        <a class="transition" href="../home/home.html"><span class="material-symbols-outlined">home</span>Home</a>
        <a class="transition" href="../cadastro/cadastro.html"><span class="material-symbols-outlined">person_add</span>Cadastro</a>
        <a class="transition" href="../relatorio/relatorio.html"><span class="material-symbols-outlined">insert_chart</span>Relatórios</a>
        <a class="transition" href="../registros/registros.html"><span class="material-symbols-outlined">insert_chart</span>Registros</a>
        <div id="btn-mudar">
          <span class="material-symbols-outlined">
          dark_mode</span>
          <span>Mudar Tema:</span>
          <label class="switch">
            <input type="checkbox" id='mudar-tema'>
            <span class="slider round"></span>
          </label>
        </div>
      </nav>
    `;
  }
}

customElements.define('nav-mobile-component', Nav);
