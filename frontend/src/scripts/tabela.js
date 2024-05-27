const handleTdClick = (event) => {
  if (event.target.id) {
    window.location.assign(event.target.id);
  }
};

const fetchClients = async (page = 1, pageSize = 20, clientName = "") => {
  const endpoint = 'Client';
  const params = { page, pageSize, clientName };
  return fetchData(endpoint, params);
};

const fetchReports = async (page = 1, pageSize = 20, reportName = "") => {
  const endpoint = reportName === "" ? 'Report' : 'Report/search';
  const params = { page, pageSize, reportName };
  return fetchData(endpoint, params);
};

const fetchLogs = async (page = 1, pageSize = 20, search = "") => {
  const endpoint = 'Log';
  const params = { page, pageSize, search };
  return fetchData(endpoint, params);
};

const fetchMonthlyClientCount = async () => {
  return fetchData('Client/monthlyCount');
};

const fetchInactiveClientCount = async () => {
  return fetchData('Client/inactiveCount');
};

const deleteClient = async (id) => {
  const endpoint = `Client/${id}`;
  const method = 'DELETE';
  return fetchData(endpoint, {}, method);
};

const tables = async () => {
  const tableElement = document.querySelector('table');
  if (!tableElement) {
    return;
  }

  const tableId = tableElement.id;

  const fieldLabels = {
    'name': 'NOME',
    'email': 'E-MAIL',
    'status': 'STATUS',
    'action': 'AÇÃO',
    'timestamp': 'DATA E HORA',
    'client': 'CLIENTE'
  };

  const fieldMap = {
    'tabela-cadastro': ['name', 'email', 'status'],
    'tabela-relatorio': ['name'],
    'tabela-registro': ['action', 'client', 'timestamp']
  };

  const fields = fieldMap[tableId];
  if (!fields) {
    return;
  }

  const getNextPageElement = () => document.getElementById('proxima');
  const getPreviousPageElement = () => document.getElementById('anterior');
  let rowCount = 20;
  const allowedLineValues = [5, 10, 20, 50, 100];
  const rowCountLocalStorage = Number(localStorage.getItem('rowCount'));

  rowCount = allowedLineValues.includes(rowCountLocalStorage) ? rowCountLocalStorage : rowCount;
  localStorage.setItem('rowCount', rowCount.toString());

  const selectLinesElement = document.querySelector('select#ilinha');
  if (selectLinesElement instanceof HTMLSelectElement) {
    selectLinesElement.value = rowCount.toString();
  }

  selectLinesElement?.addEventListener('change', (event) => {
    if (event.target instanceof HTMLSelectElement) {
      const selectedValue = parseInt(event.target.value);

      if (allowedLineValues.includes(selectedValue)) {
        page = 1;
        rowCount = selectedValue;
        fetchAndShowData();
        localStorage.setItem('rowCount', rowCount.toString());
      }
    }
  });

  let count;
  let type;

  const updatePageElements = () => {
    const paginaElement = document.getElementById('pagina');
    if (!paginaElement) return;

    if (count === 0) {
      paginaElement.textContent = `Nenhum ${type} foi encontrado`;
    } else {
      const totalPages = Math.ceil(count / rowCount);
      paginaElement.textContent = `${page} de ${totalPages}`;
    }

    const nextPageElement = getNextPageElement();
    const previousPageElement = getPreviousPageElement();
    if (nextPageElement instanceof HTMLButtonElement) {
      nextPageElement.disabled = page * rowCount >= count;
    }
    if (previousPageElement instanceof HTMLButtonElement) {
      previousPageElement.disabled = (page - 1) * rowCount <= 0;
    }
  };

  const showTable = (list) => {
    if (!tableElement) return;

    if (list === undefined) {
      tableElement.innerHTML = `<p>Erro de rede, tente novamente mais tarde.</p>`;
      return;
    }

    if (list.length === 0) {
      tableElement.innerHTML = `<p>Nenhum ${type} disponível.</p>`;
      return;
    }

    const tableRows = list.map((record, index) => {
      let tdProperty;
      switch (tableId) {
        case 'tabela-relatorio':
          tdProperty = `onclick="handleTdClick(event);" id="../lista-usuario/lista-usuario.html?id=${index}"`;
          break;
        case 'tabela-registro':
          tdProperty = `id="log-${logs[index].id}"`;
          break;
        default:
          tdProperty = `id="client-${clients[index].id}"`;
          break;
      }
      return `
        <tr>
          ${fields.map(field => `<td ${tdProperty}>${record[field]}</td>`).join('')}
        </tr>
      `;
    }).join('');

    tableElement.innerHTML = `
      <thead>
        <tr>
          ${fields.map(field => `<th scope="col">${fieldLabels[field]}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    `;

    updatePageElements();
  };

  let page = 1;
  let searchValue = "";

  let clients = [];
  let clientCount = 0;

  let reports = [];
  let reportCount = 0;

  let logs = [];
  let logCount = 0;

  const handlePageChange = async (increment) => {
    page += increment;
    fetchAndShowData();
  };

  let totalDashboard = document.querySelector('#total-cad');
  let monthlyDashboard = document.querySelector('#monthly-total-cad');
  let inactiveDashboard = document.querySelector('#inactive-total-cad');

  const updateDashboard = async (element, dataOrFetchDataFunc) => {
    if (element instanceof HTMLParagraphElement) {
      try {
        const data = typeof dataOrFetchDataFunc === 'function'
          ? await dataOrFetchDataFunc()
          : dataOrFetchDataFunc;
        if (data.monthlyClientCount !== undefined && data.monthlyClientCount !== null) {
          element.innerText = data.monthlyClientCount;
        } else if (data.inactiveClientCount !== undefined && data.inactiveClientCount !== null) {
          element.innerText = data.inactiveClientCount;
        } else {
          element.innerText = data;
        }
      } catch (error) {
      }
    }
  };

  function createClientMessage(client) {
    return `Status: ${client.status}
      Nome: ${client.name}
      Idade: ${client.age}
      Email: ${client.email}
      Endereço: ${client.address}
      Outras Informações: ${client.otherInformation}
      Interesses: ${client.interests}
      Sentimentos: ${client.feelings}
      Valores: ${client.values}`;
  }

  function handleClientClick(id) {
    const client = clients.find(client => `client-${client.id}` === id);

    if (client) {
      const title = `Cliente ${client.id}`;
      const message = createClientMessage(client);
      const popupElement = createPopup(true);
      showPopup(title, message, popupElement, true);

      const buttonEdit = popupElement.querySelector('#popup-alterar');
      const buttonDelete = popupElement.querySelector('#popup-excluir');

      buttonEdit?.addEventListener('click', async function () {
        localStorage.setItem('client', JSON.stringify(client));
        window.location.assign('../novo-cadastro/novo-cadastro.html');
      });

      buttonDelete?.addEventListener('click', async function () {
        const popupElement = createPopup();
        showPopup('Aviso!', 'Deseja excluir o usuário?', popupElement, true, async function () {
          const success = await deleteClient(client.id);
          if (success === null) {
            localStorage.setItem('del-user', 'true');
            window.location.reload();
          }
        });
      });
    }
  }

  function formatClientFields(client) {
    return {
      status: client.Status,
      name: client.Name,
      age: client.Age,
      email: client.Email,
      address: client.Address,
      otherInformation: client.OtherInformation,
      interests: client.Interests,
      feelings: client.Feelings,
      values: client.Values
    };
  }

  function createLogMessage(log) {
    const details = JSON.parse(log.details);

    const clientId = log.clientId ? `\nID do Cliente: ${log.clientId}` : "";
    const oldClientMessage = details.OldClient ? `\nDados Antigos:\n${createClientMessage(formatClientFields(details.OldClient))}\n` : "";
    const newClientMessage = details.NewClient ? `\nDados Novos:\n${createClientMessage(formatClientFields(details.NewClient))}\n` : "";

    return `Data e Hora: ${log.timestamp}${clientId}\n ${oldClientMessage} ${newClientMessage}`;
  }

  function handleLogClick(id) {
    const log = logs.find(log => `log-${log.id}` === id);
    const details = JSON.parse(log.details);

    if (log) {
      const title = `Registro ${log.id} - ${details.ActionDetails}`;
      const message = createLogMessage(log);
      const popupElement = createPopup(true);
      showPopup(title, message, popupElement);
    }
  }

  let listenerAdded = false;

  const addTableClickListener = () => {
    if (listenerAdded) return;
    tableElement.addEventListener('click', function (event) {
      if (event.target instanceof HTMLElement && event.target.tagName === 'TD') {
        let id = event.target.id;
        if (type === 'registro') {
          handleLogClick(id);
        } else if (type === 'cliente') {
          handleClientClick(id);
        }
      }
    });
    listenerAdded = true;
  };

  const fetchAndShowData = async () => {
    let data;

    switch (tableId) {
      case 'tabela-relatorio':
        data = await fetchReports(page, rowCount, searchValue);
        processReportsData(data);
        break;

      case 'tabela-registro':
        data = await fetchLogs(page, rowCount, searchValue);
        processLogsData(data);
        break;

      default:
        data = await fetchClients(page, rowCount, searchValue);
        processClientsData(data);
        break;
    }

    addTableClickListener();
  };

  const processReportsData = (data) => {
    reports = data.reports;
    reportCount = data.reportCount;
    count = reportCount;
    type = 'relatório';
    showTable(reports);
  };

  const processLogsData = (data) => {
    logs = data.logs.map(log => {
      if (log.client === null) {
        log.client = 'Não aplicável';
      }
      const date = new Date(log.timestamp);
      log.timestamp = date.toLocaleString();
      return log;
    });

    logCount = data.logCount;
    count = logCount;
    type = 'registro';
    showTable(logs);
  };

  const processClientsData = (data) => {
    clients = data.clients;
    clientCount = data.clientCount;
    count = clientCount;
    type = 'cliente';
    showTable(clients);

    if (searchValue === "") {
      updateDashboard(totalDashboard, clientCount);
      updateDashboard(monthlyDashboard, fetchMonthlyClientCount);
      updateDashboard(inactiveDashboard, fetchInactiveClientCount);
    }
  };

  const previousPageElement = getPreviousPageElement();
  previousPageElement?.addEventListener('click', () => handlePageChange(-1));

  const nextPageElement = getNextPageElement();
  nextPageElement?.addEventListener('click', () => handlePageChange(1));

  document.querySelectorAll('form.pesquisa').forEach((element) => {
    element.addEventListener('submit', function (event) {
      event.preventDefault();
      const eventInput = new Event('input', {
        bubbles: true,
        cancelable: true,
      });

      const activeInput = document.activeElement;
      if (activeInput instanceof HTMLInputElement) {
        activeInput.dispatchEvent(eventInput);
      }
    });
  });

  const search = (event) => {
    page = 1;
    searchValue = event.target.value;
    fetchAndShowData();
  };

  const debounce = (func, delay) => {
    let debounceTimer;
    return function (...args) {
      const context = this;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
  };

  const printTable = async () => {
    const oldRowCount = rowCount;
    const oldPage = page;

    page = 1;
    rowCount = clientCount;
    const data = await fetchClients(page, rowCount, "");
    clients = data.clients;
    showTable(clients);
    window.print();
    page = oldPage;
    rowCount = oldRowCount;
    const data2 = await fetchClients(page, rowCount, "");
    clients = data2.clients;
    showTable(clients);
  };
  document.querySelector('#imprimir')?.addEventListener('click', () => {
    printTable();
  });

  const debouncedSearch = debounce(search, 250);

  ['ipesq-mobile', 'ipesq-desktop'].forEach((id) => {
    const element = document.querySelector(`#${id}`);
    element?.addEventListener('input', (event) => {
      debouncedSearch(event);
    });
  });

  fetchAndShowData();
};
