import axios from 'axios';
import { showAlert } from './alerts';

export const updateUserData = async (data) => {
  try {
    const {
      data: { status },
    } = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:4000/api/v1/users/update-me',
      data,
    });

    if (status === 'success') {
      showAlert('success', 'Data Updated successfully!');
    }
  } catch (err) {
    const { message } = err.response.data;
    showAlert('error', message);
  }
};

export const updateUserPassword = async (
  passwordCurrent,
  password,
  passwordCheck
) => {
  console.log(passwordCurrent, password, passwordCheck);

  try {
    const {
      data: { status },
    } = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:4000/api/v1/users/change-my-password',
      data: {
        passwordCurrent,
        password,
        passwordCheck,
      },
    });

    if (status === 'success') {
      showAlert('success', 'Password Changed successfully!');
    }
  } catch (err) {
    const { message } = err.response.data;
    showAlert('error', message);
  }
};


