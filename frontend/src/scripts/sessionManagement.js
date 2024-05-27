document.addEventListener('DOMContentLoaded', async () => {
  const logoutAPI = async (token) => {
    try {
      const response = await fetch(`${baseUrl}/User/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      if (!response.ok) {
        const data = await response.text();
        return data;
      }
      const data = await response.text();
      return data;
    } catch (error) {
      return null;
    }
  };

  const token = localStorage.getItem('token');
  const keysToRemove = ['email', 'rowCount', 'lastChance', 'new-user', 'token'];

  async function logout() {
    if (token) {
      const result = await logoutAPI(token);
      if (!result) {
        return;
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    const path = window.location.pathname;

    if (!path.endsWith('index.html')) {
      window.location.replace('../../index.html');
    } else {
      location.reload();
    }
  }

  document.querySelectorAll('.logout').forEach(element => element.addEventListener('click', logout));

  function showPopupWithTimer(popupElement, remainingTime, seconds = false) {
    let timer = remainingTime / 1000;
    const popup = popupElement?.querySelector('.popup');
    const popupTitle = popupElement?.querySelector('.popup-title');
    const popupMessage = popupElement?.querySelector('.popup-message');

    const intervalId = setInterval(() => {
      if (timer <= 0) {
        clearInterval(intervalId);
        localStorage.setItem('expired', 'true');
        logout();
      } else {
        if (timer === remainingTime / 1000) {
          showPopup('Aviso!', '', popupElement);
        }

        if (popupMessage && popupTitle) {
          if (seconds) {
            popupTitle.textContent = 'Aviso!';
            popupMessage.textContent = `Em ${Math.round(timer)} segundos sua sessão irá expirar. Por favor, salve seu trabalho.`;
          } else {
            const minute = Math.ceil(timer / 60);
            if (minute !== 0) {
              popupTitle.textContent = 'Aviso!';
              popupMessage.textContent = `Em ${minute} ${minute !== 1 ? 'minutos' : 'minuto'} você precisará fazer o login novamente. Por favor, salve seu trabalho.`;
              if (minute === 3 || minute === 1) {
                clearInterval(intervalId);
              }
            }
          }
        }
        timer--;
      }
    }, 1000);
  }

  const getSessionExpirationFromAPI = async (token) => {
    const data = await fetchData('User/token/expiration');
    return data ? new Date(data.expiration) : null;
  };

  async function handleSessionExpiration() {
    if (!token) return;

    const expirationDate = await getSessionExpirationFromAPI(token);

    if (!expirationDate) return;

    const remainingTime = Number(expirationDate) - Date.now();
    const popupElement = createPopup(true);

    const showPopupSession = (delay, setLastChance) => {
      setTimeout(() => {
        showPopupWithTimer(popupElement, delay, setLastChance);
        if (setLastChance) localStorage.setItem('lastChance', 'true');
      }, remainingTime - delay);
    };

    const fiveMinutes = 300000;
    const twoMinutes = 120000;
    const thirtySeconds = 30000;

    if (remainingTime > fiveMinutes) showPopupSession(fiveMinutes, false);
    if (remainingTime > twoMinutes) showPopupSession(twoMinutes, false);
    if (remainingTime > thirtySeconds) {
      showPopupSession(thirtySeconds, true);
    } else {
      const delay = Math.max(remainingTime, 0);

      const logoutAction = () => {
        logout();
        localStorage.setItem('expired', 'true');
      };

      if (!localStorage.getItem('lastChance')) {
        setTimeout(logoutAction, 0);
      } else {
        setTimeout(logoutAction, delay);
      }
    }
  }
  function handleUser(action, message, isSuccess = true) {
    const userAction = localStorage.getItem(action);
    if (userAction === 'true') {
      const title = isSuccess ? 'Sucesso!' : 'Aviso!';
      showPopup(title, message, createPopup());
      localStorage.removeItem(action);
    }
  }

  handleSessionExpiration();
  handleUser('new-user', 'Cadastro realizado com sucesso!');
  handleUser('att-user', 'Usuário atualizado com sucesso!');
  handleUser('del-user', 'Usuário excluído com sucesso!');
  handleUser('expired', 'Sua sessão expirou, faça o login novamente.', false);

  const currentPage = window.location.pathname;
  const requiredKeys = ['email', 'token'];
  let validator = true;

  requiredKeys.forEach(key => {
    const reqKey = localStorage.getItem(key);

    if (reqKey && currentPage.endsWith('index.html')) {
      window.location.replace('./app/home/home.html');
    } else if ((!reqKey) && !currentPage.endsWith('index.html')) {
      validator = false;
      logout();
    }
  });

  if (validator && typeof tables === 'function') {
    tables();
  }
});
