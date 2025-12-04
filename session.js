import { supabase } from "./supabase.js";

/**
 * Renderizar información del usuario en el navbar
 * Se ejecuta automáticamente en todas las páginas
 */
export async function renderUserInNav() {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const box = document.querySelector("#user-info");

  if (!box) return;

  if (user) {
    // Usuario autenticado - mostrar email y botón de salir
    const userEmail = user.email;
    const userName = user.user_metadata?.nombre || userEmail.split('@')[0];
    
    box.innerHTML = `
      <span class="me-2 text-white">
        <i class="fas fa-user-circle me-1"></i>
        Hola, ${userName}
      </span>
      <button class="btn btn-sm btn-outline-light" id="logout-btn">
        <i class="fas fa-sign-out-alt me-1"></i>Salir
      </button>
    `;

    // Evento de logout
    document.getElementById("logout-btn").onclick = async () => {
      const confirmLogout = confirm('¿Estás seguro de que quieres cerrar sesión?');
      if (confirmLogout) {
        await supabase.auth.signOut();
        window.location.href = 'index.html';
      }
    };

  } else {
    // Usuario NO autenticado - mostrar botones de login y registro
    box.innerHTML = `
      <a href="login.html" class="btn btn-sm btn-outline-light me-2">
        <i class="fas fa-sign-in-alt me-1"></i>Iniciar Sesión
      </a>
      <a href="registro.html" class="btn btn-sm btn-light">
        <i class="fas fa-user-plus me-1"></i>Registrarse
      </a>
    `;
  }
}

/**
 * Verificar si hay un usuario autenticado
 * @returns {Object|null} Usuario actual o null
 */
export async function checkAuth() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Proteger rutas - Redirigir a login si no está autenticado
 * @param {string} redirectUrl - URL a redirigir si no hay sesión (default: login.html)
 * @returns {boolean} true si está autenticado, false si no
 */
export async function requireAuth(redirectUrl = 'login.html') {
  const user = await checkAuth();
  
  if (!user) {
    // Guardar la URL actual para redirigir después del login
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    window.location.href = redirectUrl;
    return false;
  }
  
  return true;
}

/**
 * Obtener el usuario actual con toda su información
 * @returns {Object|null} Objeto de usuario completo
 */
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Cerrar sesión manualmente
 */
export async function logout() {
  await supabase.auth.signOut();
  window.location.href = 'index.html';
}

/**
 * Escuchar cambios en el estado de autenticación
 * @param {Function} callback - Función a ejecutar cuando cambie el estado
 * @returns {Object} Subscription object
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

/**
 * Inicializar la sesión en todas las páginas
 * - Renderiza el usuario en el navbar
 * - Maneja redirecciones después del login
 */
export async function initSession() {
  // Renderizar usuario en navbar
  await renderUserInNav();
  
  // Verificar si hay una redirección pendiente después del login
  const redirectPath = sessionStorage.getItem('redirectAfterLogin');
  if (redirectPath) {
    sessionStorage.removeItem('redirectAfterLogin');
    const user = await checkAuth();
    if (user && window.location.pathname !== redirectPath) {
      window.location.href = redirectPath;
    }
  }
}

/**
 * Verificar si el usuario tiene un rol específico (para permisos)
 * @param {string} role - Rol a verificar
 * @returns {boolean}
 */
export async function hasRole(role) {
  const user = await getCurrentUser();
  if (!user) return false;
  
  const userRole = user.user_metadata?.role || 'user';
  return userRole === role;
}

/**
 * Actualizar perfil del usuario
 * @param {Object} updates - Datos a actualizar
 * @returns {Object} Resultado de la actualización
 */
export async function updateProfile(updates) {
  const { data, error } = await supabase.auth.updateUser({
    data: updates
  });
  
  if (error) {
    console.error('Error updating profile:', error);
    return { success: false, error };
  }
  
  // Re-renderizar navbar con nueva información
  await renderUserInNav();
  return { success: true, data };
}

// Ejecutar automáticamente al cargar la página
document.addEventListener('DOMContentLoaded', initSession);