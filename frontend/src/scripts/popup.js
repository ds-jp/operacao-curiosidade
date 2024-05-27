function updatePopupContent(popupElement, title, message) {
  const popupTitle = popupElement?.querySelector('.popup-title');
  const popupMessage = popupElement?.querySelector('.popup-message');

  if (popupTitle && popupMessage) {
    popupTitle.textContent = title;
    popupMessage.innerText = message;
  }
}

function showHideButtons(popupElement, showButtons, confirmCallback) {
  const buttonEdit = popupElement?.querySelector('#popup-alterar');
  const buttonDelete = popupElement?.querySelector('#popup-excluir');

  if (buttonEdit && buttonDelete) {
    buttonEdit.style.display = showButtons ? 'block' : 'none';
    buttonDelete.style.display = showButtons ? 'block' : 'none';

    if (showButtons && confirmCallback) {
      buttonEdit.style.display = 'none';
      buttonDelete.style.marginRight = '65px';
      buttonDelete.style.backgroundColor = 'green';
      buttonDelete.textContent = 'SIM';
      buttonDelete.addEventListener('mouseover', () => buttonDelete.style.backgroundColor = 'rgb(6, 196, 6)');
      buttonDelete.addEventListener('mouseout', () => buttonDelete.style.backgroundColor = 'green');
      buttonDelete.addEventListener('click', confirmCallback);
    }
  }
}

window.showPopup = function (title, message, popupElement, showButtons = false, confirmCallback = null) {
  const popup = popupElement?.querySelector('.popup');

  if (popup) {
    popup.style.display = 'flex';
    updatePopupContent(popupElement, title, message);
    showHideButtons(popupElement, showButtons, confirmCallback);
  }
};

window.createPopup = function (hasTimer = false) {
  const newPopup = document.createElement('popup-component');

  newPopup.classList.add('popup-component');
  newPopup.hasTimer = hasTimer;
  document.body.appendChild(newPopup);

  const popupClose = newPopup.querySelector('.popup-close');
  popupClose?.addEventListener('click', () => {
    const popup = newPopup.querySelector('.popup');
    if (popup instanceof HTMLDivElement) {
      popup.style.display = 'none';
    }
    if (!newPopup.hasTimer) {
      document.body.removeChild(newPopup);
    }
  });

  return newPopup;
};
