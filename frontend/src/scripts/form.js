let errorMessage = '';

const validateInput = (input, checkClass = false) => {
  if (!['submit', 'search', 'radio'].includes(input.type)) {
    if (!checkClass || !input.classList.contains('preenchido')) {
      if (input.value === '') {
        input.classList.remove('preenchido');
        input.classList.add('preencher');
        errorMessage = 'Preencha todos os campos!';
        return false;
      } else {
        input.classList.remove('preencher');
        input.classList.add('preenchido');
      }
      if (input.name === 'nome' && !input.value.match(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ\s\'\-]*$/)) {
        input.classList.remove('preenchido');
        input.classList.add('preencher');
        return false;
      }
      if (input.name === 'email' && !input.value.match(/^\S+@\S+\.\S+$/)) {
        input.classList.remove('preenchido');
        input.classList.add('preencher');
        return false;
      }
    }
  }

  return true;
};

const emailInput = document.querySelector('input[name="email"]');
const passwordInput = document.querySelector('input[name="senha"]');

const validateForm = (checkClass = false) => {
  const inputList = document.querySelectorAll('input, textarea');
  let isValid = true;

  inputList.forEach((input) => {
    if (!validateInput(input, checkClass)) {
      isValid = false;
    }
  });

  if (errorMessage === '') {
    if (emailInput instanceof HTMLInputElement && emailInput.classList.contains('preencher')) {
      errorMessage = 'Campo e-mail com formatação incorreta!';
      isValid = false;
    }

    const nomeInput = document.querySelector('input[name="nome"]');
    if (nomeInput instanceof HTMLInputElement && nomeInput.classList.contains('preencher')) {
      errorMessage = 'Campo nome com formatação incorreta!';
      isValid = false;
    }
  }

  if (!isValid) {
    setErrorMessage(errorMessage);
    errorMessage = '';
  }

  return isValid;
};

const setErrorMessage = (message) => {
  const formErrorMessage = document.querySelector('p#form-error');

  if (formErrorMessage instanceof HTMLParagraphElement) {
    formErrorMessage.innerText = message;
    (formErrorMessage.style.display = 'block');
    setTimeout(() => {
      (formErrorMessage.style.opacity = '1');
    }, 2);
    setTimeout(() => {
      (formErrorMessage.style.opacity = '0');
      setTimeout(() => {
        (formErrorMessage.style.display = 'none');
      }, 200);
    }, 2500);
  }
};

let isProcessing = false;

const disableSubmitSpam = (element) => {
  if (element instanceof HTMLInputElement) {
    element.disabled = true;
    setTimeout(() => {
      isProcessing = false;
      element.disabled = false;
    }, 2850);
  }
};

const formElement = document.querySelector('#form-cadastro');

['input#btn-login', 'input#btn-cadastro'].forEach((id) => {
  const element = document.querySelector(`${id}`);

  if (element) {
    element.addEventListener('click', async (event) => {
      if (isProcessing) {
        event.preventDefault();
        return;
      }
      isProcessing = true;
      if (!validateForm()) {
        event.preventDefault();
        disableSubmitSpam(element);
      } else {
        if (typeof registration === 'function') {
          event.preventDefault();
          disableSubmitSpam(element);
          if (await registration()) {
            if (formElement instanceof HTMLFormElement) {
              formElement.submit();
            }
          } else {
            if (emailInput instanceof HTMLInputElement) {
              emailInput.classList.remove('preenchido');
              emailInput.classList.add('preencher');
            }
          }
        }
      }
      isProcessing = false;
    });
  }
});

const radioActive = document.querySelector('input#iativo');
const labelRadioActive = document.querySelector('label#label-ativo');

if (radioActive instanceof HTMLInputElement && labelRadioActive instanceof HTMLLabelElement) {
  let tag;
  [labelRadioActive, radioActive].forEach((element) => {
    element.addEventListener('mousedown', () => {
      tag = radioActive.checked;
    });
    element.addEventListener('click', () => {
      radioActive.checked = !tag;
    });
  });
}

const handleLoginResponse = async (response) => {
  if (response.ok) {
    const data = await response.json();
    const { token, user } = data;

    localStorage.setItem('token', token);
    localStorage.setItem('email', user);

    window.location.href = "app/home/home.html";
  } else {
    const errorData = await response.json();
    setErrorMessage(errorData.message);
  }
};

const handleLoginError = (error) => {
  setErrorMessage('Erro de rede, tente novamente mais tarde.');
};

const fetchLogin = async (email, password) => {
  try {
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios.');
    }

    const response = await fetch(`${baseUrl}/User/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    await handleLoginResponse(response);
  } catch (error) {
    handleLoginError(error);
  }
};

document.querySelector('#form-login')?.addEventListener('submit', async (event) => {
  disableSubmitSpam(document.querySelector('input#btn-login'));

  event.preventDefault();

  const emailValue = emailInput instanceof HTMLInputElement ? emailInput.value : '';
  const passwordValue = passwordInput instanceof HTMLInputElement ? passwordInput.value : '';

  await fetchLogin(emailValue, passwordValue);
});

document.querySelectorAll('input, textarea').forEach((input) => {
  if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
    if (!['submit', 'search'].includes(input.type)) {
      input.addEventListener('input', () => {
        if (validateInput(input, true)) {
          input.classList.remove('preencher');
          input.classList.add('preenchido');
        } else {
          input.classList.remove('preenchido');
          input.classList.add('preencher');
        }
      });
    }
  }
});
