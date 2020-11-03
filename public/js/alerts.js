export const hideAlert = () => {
  const alert_div = document.querySelector('.alert');

  if (alert_div) {
    const el_body = alert_div.parentElement;

    el_body.removeChild(alert_div);
  }
};

export const showAlert = (type, msg) => {
  hideAlert();

  const markup = `
    <div class="alert alert--${type}">${msg}</div>
  `;

  const el_body = document.querySelector('body');
  el_body.insertAdjacentHTML('afterbegin', markup);

  window.setTimeout(hideAlert, 5000);
};

