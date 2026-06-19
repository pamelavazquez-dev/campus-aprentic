// Authentication is handled by Firebase Auth in this project.
// These helper stubs intentionally do not create local `usuarios` documents.
async function register() {
  throw new Error('Registro de usuarios: usar Firebase Auth. No crear documentos en una colección `usuarios`.');
}

async function login() {
  throw new Error('Login de usuarios: usar Firebase Auth. Este servicio no gestiona credenciales locales.');
}

module.exports = {
  register,
  login,
};
