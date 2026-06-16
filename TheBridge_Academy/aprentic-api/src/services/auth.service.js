const { getAll, getDoc, createDoc } = require('./base.service');
const { Usuario } = require('../models');

async function register(userData) {
  const usuarios = await getAll(Usuario.collectionName);
  if (usuarios.some((user) => user.email === userData.email)) {
    throw new Error('El email ya está registrado');
  }

  const usuario = Usuario.buildUsuario({
    ...userData,
    id: userData.id || `user_${Date.now()}`,
    passwordHash: userData.passwordHash || '',
  });

  return createDoc(Usuario.collectionName, usuario.id, usuario);
}

async function login(email, password) {
  const usuarios = await getAll(Usuario.collectionName);
  const usuario = usuarios.find((user) => user.email === email);
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  if (usuario.passwordHash !== password) {
    throw new Error('Credenciales inválidas');
  }

  return usuario;
}

module.exports = {
  register,
  login,
};
