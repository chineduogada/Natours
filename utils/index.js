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

class API_Features {
  constructor(mongooseQuery, expressQuery) {
    this.query = mongooseQuery;
    this.queryString = expressQuery;
  }

  filter = () => {
    // 1.1. FILTERING
    let queryObject = { ...this.queryString };
    const excludedQueries = ['limit', 'fields', 'sort', 'page'];
    excludedQueries.forEach((query) =>
      Reflect.deleteProperty(queryObject, query)
    );

    // 1.2. ADVANCE FILTERING
    let queryString = JSON.stringify(queryObject);
    const regex = /\b(gt|lt|gte|lte)\b/g;
    const replaceQueryStr = (matchStr) => `$${matchStr}`;
    queryString = queryString.replace(regex, replaceQueryStr);
    queryObject = JSON.parse(queryString);

    this.query = this.query.find(queryObject);

    return this;
  };

  sort = () => {
    if (this.queryString.sort) {
      let sortBy = this.queryString.sort;
      sortBy = sortBy.replace(/,/g, ' ');

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  };

  project = () => {
    if (this.queryString.fields) {
      let fields = this.queryString.fields;
      fields = fields.replace(/,/g, ' ');

      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  };

  paginate = () => {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const numberOfDocsToSkip = (page - 1) * limit;

    this.query = this.query.limit(limit).skip(numberOfDocsToSkip);

    return this;
  };
}

module.exports.API_Features = API_Features;
module.exports.sendRes = sendRes;
