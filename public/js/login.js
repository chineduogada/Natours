import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const {
      data: { data, status },
    } = await axios({
      url: 'http://127.0.0.1:4000/api/v1/users/login',
      method: 'POST',
      data: {
        email,
        password,
      },
    });

    if (status === 'success') {
      showAlert('success', 'Logged in successfully!');

      window.setTimeout(() => window.location.assign('/'), 1500);
    }
  } catch (err) {
    const { message } = err.response.data;

    showAlert('error', message);
  }
};

export const logout = async () => {
  try {
    const {
      data: { status },
    } = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:4000/api/v1/users/logout',
    });

    if (status === 'success') {
      showAlert('success', 'Logged out successfully!');

      window.setTimeout(() => window.location.assign('/auth/login'), 1000);
    }
  } catch (err) {
    showAlert('error', 'Error logging out! try again later.');
  }
};

