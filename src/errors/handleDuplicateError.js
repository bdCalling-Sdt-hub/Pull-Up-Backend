const handleDuplicateError = (err) => {
  const match = err.message.match(/"([^"]*)"/);
  const message = match && match[1];
  const errorSources = [
    {
      path: "",
      message: message,
    },
  ];
  const statusCode = 400;
  return {
    statusCode,
    message: "Duplicate Error",
    errorSources,
  };
};
module.exports = handleDuplicateError;
