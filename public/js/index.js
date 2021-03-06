import '@babel/polyfill';
import { login, logout } from './login';
import { displayMaps } from './mapbox';
import { updateUserData, updateUserPassword } from './updateSettings';

// DOM Elements
const loginForm_form = document.querySelector('.login-form .form');
const userData_form = document.querySelector('.form-user-data');
const userPassword_form = document.querySelector('.form-user-password');
const logout_button = document.querySelector('.nav__el--logout');
const mapbox_div = document.querySelector('#map');

// DELEGATION
if (mapbox_div) {
  const locations = JSON.parse(mapbox_div.dataset.locations);
  displayMaps(locations);
}

// Login
if (loginForm_form) {
  const [email_input, password_input] = loginForm_form.querySelectorAll(
    '.form__input'
  );

  loginForm_form.addEventListener('submit', (e) => {
    e.preventDefault();

    login(email_input.value, password_input.value);
  });
}

// Logout
if (logout_button) {
  logout_button.addEventListener('click', logout);
}

if (userData_form) {
  userData_form.addEventListener('submit', (e) => {
    e.preventDefault();

    const [name_input, email_input] = userData_form.querySelectorAll(
      '.form__input'
    );
    const upload_input = userData_form.querySelector('.form__upload');

    const form = new FormData();
    form.append('name', name_input.value);
    form.append('email', email_input.value);
    form.append('photo', upload_input.files[0]);

    updateUserData(form);

    // const form = {
    //   name: name_input.value,
    //   email: email_input.value,
    // };

    // const formData = new FormData();

    // for (const field in form) {
    //   formData.append(field, form[field]);
    // }
    // formData.append('photo', upload_input.files[0]);

    // updateUserData(formData);
  });
}

if (userPassword_form) {
  userPassword_form.addEventListener('submit', (e) => {
    e.preventDefault();

    const [
      currentPassword_input,
      newPassword_input,
      confirmPassword_input,
    ] = userPassword_form.querySelectorAll('.form__input');

    updateUserPassword(
      currentPassword_input.value,
      newPassword_input.value,
      confirmPassword_input.value
    );
  });
}

