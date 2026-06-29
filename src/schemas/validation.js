export const getFieldErrors = (zodError) => (
  zodError.issues.reduce((errors, issue) => {
    const field = issue.path[0];

    if (!field) return errors;

    return {
      ...errors,
      [field]: issue.message,
    };
  }, {})
);

export const validateData = (schema, data) => {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw result.error;
  }

  return result.data;
};
