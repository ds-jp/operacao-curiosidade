const fieldMap = {
  'ativo': 'status',
  'nome': 'name',
  'idade': 'age',
  'email': 'email',
  'end': 'address',
  'info': 'otherInformation',
  'int': 'interests',
  'sent': 'feelings',
  'val': 'values'
};

const clientString = localStorage.getItem('client');
let client;
let clientId;
if (clientString !== null) {
  client = JSON.parse(clientString);
  document.title = "Operação Curiosidade - Alterar Cadastro";
  const h2Element = document.querySelector('h2');
  const btnElement = document.getElementById('btn-cadastro');

  if (h2Element && btnElement instanceof HTMLInputElement) {
    h2Element.textContent = "Alterar Cadastro";
    btnElement.value = "SALVAR ALTERAÇÕES";
  }
}

if (client) {
  clientId = client.id;
  localStorage.removeItem('client');
  Object.keys(fieldMap).forEach(field => {
    const inputElement = document.getElementById('i' + field);
    if (inputElement) {
      if (field === 'ativo') {
        inputElement.checked = client[fieldMap[field]] === 'Ativo';
      } else {
        inputElement.value = client[fieldMap[field]] || '';
      }
    }
  });
}

const updateClient = async (id, client) => {
  const endpoint = `Client/${id}`;
  client.id = id;
  const params = client;
  const method = 'PUT';
  return fetchData(endpoint, params, method);
};

const newClient = async (client) => {
  const endpoint = 'Client';
  const params = client;
  const method = 'POST';
  return fetchData(endpoint, params, method);
};

const getInputValues = () => {
  const inputValues = {};

  Object.keys(fieldMap).forEach(field => {
    const inputElement = document.getElementById('i' + field);
    if (inputElement) {
      if (field === 'ativo') {
        inputValues[fieldMap[field]] = inputElement.checked ? 'Ativo' : 'Inativo';
      } else {
        inputValues[fieldMap[field]] = inputElement.value;
      }
    }
  });

  return inputValues;
};

const handleUpdateClient = async (client, inputValues) => {
  const response = await updateClient(client.id, inputValues);
  if (response === null) {
    localStorage.setItem('att-user', 'true');
    return true;
  } else {
    return false;
  }
};

const handleNewClient = async (inputValues) => {
  const response = await newClient(inputValues);
  if (response && response.id) {
    localStorage.setItem('new-user', 'true');
    return true;
  } else {
    return false;
  }
};

const registration = async () => {
  const inputValues = getInputValues();

  if (!inputValues.email || !inputValues.name || !inputValues.status) {
    return false;
  }

  try {
    if (client && client.id) {
      return await handleUpdateClient(client, inputValues);
    } else {
      return await handleNewClient(inputValues);
    }
  } catch (error) {
    return false;
  }
};
