const getNameParts = (fullName) => (
  fullName
    .trim()
    .match(/[A-Za-zÀ-ÿ]+/g) || []
);

export const generateInitialPassword = (fullName) => {
  const [firstName = '', ...rest] = getNameParts(fullName);
  const lastName = rest.at(-1) || '';

  if (firstName.length < 2 || lastName.length < 2) {
    throw new Error('Introduce al menos un nombre y un apellido de dos letras.');
  }

  return `${firstName.slice(0, 2).toLowerCase()}${lastName.slice(0, 2).toLowerCase()}1234!`;
};
