const handleValidationError = (err) => {
  const errorSources = Object.values(err.errors).map((value) => {
    return {
      path: value?.path,
      message: value?.message,
    };
  });
  const statusCode = 400;

  return {
    statusCode,
    message: "validationError",
    errorSources,
  };
};
module.exports = handleValidationError;
