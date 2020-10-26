const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/APIFeatures');

exports.getMany = (Model, docName = "document") => catchAsync(async (req, res) => {
  const apiFeatures = new APIFeatures(Model.find(req.filterOptions), req.query)
    .filter()
    .sort()
    .paginate()
    .project();

  // EXECUTE QUERY
  // const docs = await apiFeatures.query.explain();
  const docs = await apiFeatures.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: docs.length,
    data: {
      [docName]: docs,
    },
  });
});

exports.getOne = (Model, docName = "document", populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) {
      query = query.populate(populateOptions)
    }
    const doc = await query;

    if (!doc) {
      return next(new AppError(`no \`${docName}\` with the given \`id\``, 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        [docName]: doc,
      },
    });
  });

exports.createOne = (Model, docName = "document") => catchAsync(async (req, res) => {
  // const newTour = await new TourModel(req.body);
  // const result = await newTour.save()
  
  const doc = await Model.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: {
      [docName]: doc,
    },
  });
});

exports.updateOne = (Model, docName = "document") => catchAsync(async (req, res, next) => {
  const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!doc) {
    return next(new AppError(`no \`${docName}\` with the given \`id\``, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      [docName]: doc,
    },
  });
});

exports.deleteOne = (Model, docName = "document") => catchAsync(async (req, res, next) => {
  const doc = await Model.findByIdAndRemove(req.params.id);

  if (!doc) {
    return next(new AppError(`no \`${docName}\` with the given \`id\``, 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});



