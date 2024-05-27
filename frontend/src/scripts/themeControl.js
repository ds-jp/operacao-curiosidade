document.addEventListener('DOMContentLoaded', async () => {
  const userEmail = localStorage.getItem('email');

  const setInitialTheme = async (userEmail) => {
    const savedTheme = getDefaultTheme();
    if (userEmail) {
      await applyTheme(savedTheme, userEmail);
    } else {
      await applyTheme(savedTheme);
    }

    return savedTheme;
  };

  const applyTheme = async (theme, userEmail) => {
    document.documentElement.setAttribute('data-theme', theme);
    if (userEmail) {
      await saveThemeToAPI(userEmail, theme);
    }

    updateClickEvents(theme);
  };

  const getThemeFromAPI = async (email) => {
    const data = await fetchData(`User/${email}/theme`);
    return data ? data : null;
  };

  const saveThemeToAPI = async (email, theme) => {
    try {
      const response = await fetchData(`User/${encodeURIComponent(email)}/theme`, theme, 'PUT');
      return response ? true : false;
    } catch (error) {
      return false;
    }
  };

  const getDefaultTheme = () => {
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  };

  const toggleThemeOnClick = async () => {
    const currentTheme = getCurrentTheme();
    const newTheme = (currentTheme === 'dark' ? 'light' : 'dark');
    if (userEmail) {
      await applyTheme(newTheme, userEmail);
    } else {
      applyTheme(newTheme);
    }
  };

  const getCurrentTheme = () => {
    return document.documentElement.getAttribute('data-theme');
  };

  const updateClickEvents = (theme) => {
    ['mudar-tema', 'mudar-tema-desktop', 'mudar-tema-login'].forEach((id) => {
      const element = document.querySelector(`#${id}`);
      if (element instanceof HTMLInputElement) {
        element.checked = (theme === 'dark');
        element.removeEventListener('click', toggleThemeOnClick);
        element.addEventListener('click', toggleThemeOnClick);
      }
    });
  };

  const initializeTheme = async () => {
    if (userEmail) {
      const userTheme = await getThemeFromAPI(userEmail);
      if (userTheme) {
        await applyTheme(userTheme, userEmail);
      } else {
        await setInitialTheme(userEmail);
      }
    } else {
      await setInitialTheme(userEmail);
    }
  };

  initializeTheme();
});
