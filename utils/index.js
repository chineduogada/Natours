const sendRes = {
  success: (res, code, data, dataKey) => {
    let results;
    if (typeof data === 'object') {
      results = data.length;
    }

    let status = 'success';

    if (code >= 400 && code < 500) {
      status = 'failed';
    } else if (code >= 500 && code < 600) {
      status = 'error';
    }

    return res.status(code).json({
      status,
      results,
      data: {
        [dataKey]: data,
      },
    });
  },

  error: (res, code, message) => {
    let status = '';

    if (code >= 400 && code < 500) {
      status = 'fail';
    } else if (code >= 500 && code < 600) {
      status = 'error';
    }

    return res.status(code).json({
      status,
      message,
    });
  },
};

module.exports.sendRes = sendRes;
