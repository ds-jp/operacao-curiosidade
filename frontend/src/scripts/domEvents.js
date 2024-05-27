document.addEventListener('DOMContentLoaded', async () => {
  const searchMobile = document.querySelector(`#ipesq-mobile`);
  const searchDesktop = document.querySelector(`#ipesq-desktop`);

  const dispatchEventSearchBar = () => {
    var event = new Event('input', {
      bubbles: true,
      cancelable: true,
    });

    [searchMobile, searchDesktop].forEach((search) => {
      if (search instanceof HTMLInputElement) {
        if (search.value !== "")
          search.dispatchEvent(event);
        search.value = "";
      }
    });
  };

  const toggleVisibility = (element, icon, visibleIcon, hiddenIcon) => {
    if (element.style.display === 'block') {
      icon.innerHTML = hiddenIcon;
      element.classList.remove('visivel');
      setTimeout(() => element.style.display = 'none', 120);
      dispatchEventSearchBar();
    } else {
      icon.innerHTML = visibleIcon;
      element.style.display = 'block';
      setTimeout(() => element.classList.add('visivel'), 120);
    }
  };

  const logoMobile = document.querySelector('div#logo-mobile');
  const searchIcon = document.querySelector('#search');
  const searchBar = document.querySelector('#search-bar');
  const menuIcon = document.querySelector('#toggle-menu');

  menuIcon?.addEventListener('click', () => {
    const navDropdown = document.querySelector('nav.dropdown');

    if (navDropdown instanceof HTMLElement) {
      toggleVisibility(navDropdown, menuIcon, 'close', 'menu');
      setTimeout(() => {
        if (logoMobile instanceof HTMLDivElement && searchIcon instanceof HTMLSpanElement && searchBar instanceof HTMLFormElement) {
          if (navDropdown.classList.contains('visivel')) {
            logoMobile.style.opacity = '0';
            searchIcon.style.visibility = 'hidden';
            searchBar.style.opacity = '0';
            searchBar.style.visibility = 'hidden';
          } else {
            logoMobile.style.opacity = '1';
            searchIcon.style.visibility = 'visible';
            searchBar.style.removeProperty('opacity');
            searchBar.style.removeProperty('visibility');
          }
        }
      }, 120);
    }
  });

  searchIcon?.addEventListener('click', () => {
    if (searchBar instanceof HTMLFormElement) {
      toggleVisibility(searchBar, searchIcon, 'close', 'search');
      setTimeout(() => {
        const logoMobile = document.querySelector('div#logo-mobile');
        if (logoMobile instanceof HTMLDivElement) {
          logoMobile.style.display = searchBar.classList.contains('visivel') ? 'none' : 'flex';
        }
      }, 120);
    }
  });
});
