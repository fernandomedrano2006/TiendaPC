import { supabase } from "./supabase.js";

export async function renderUserInNav() {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const box = document.querySelector("#user-info");

  if (!box) return;

  if (user) {
    box.innerHTML = `
      <span class="me-2">Hola, ${user.email}</span>
      <button class="btn btn-sm btn-outline-light" id="logout-btn">Salir</button>
    `;

    document.getElementById("logout-btn").onclick = async () => {
      await supabase.auth.signOut();
      location.reload();
    };

  } else {
    box.innerHTML = `
      <a href="registro.html" class="btn btn-sm btn-outline-light">
        Iniciar / Registrarse
      </a>
    `;
  }
}
