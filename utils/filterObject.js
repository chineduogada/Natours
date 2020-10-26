const filterObj = (obj, allowedFields) =>{
  const filteredObj = {};
  
  for (key in obj) {
    if (allowedFields.includes(key)) {
      filteredObj[key] = obj[key];
    }
  }

  return filteredObj
}

module.exports = filterObj;
