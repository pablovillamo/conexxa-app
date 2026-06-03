import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ModulePermission {
  moduleKey: string;
  canView: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

// Roles que pueden tener equipo de colaboradores
const ACCOUNT_OWNER_ROLES = ["ceo", "program_90d", "app_client", "service_client", "client"];

interface CreateCollaboratorInput {
  fullName: string;
  email: string;
  position: string;
  temporaryPassword: string;
  modules: ModulePermission[];
  parentAccountId?: string; // solo admin puede especificar una cuenta distinta
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ ok: false, error: "Método no permitido" }, 405);
  }

  try {
    // ── 1. Supabase clients ──────────────────────────────
    const supabaseUrl  = Deno.env.get("SUPABASE_URL")!;
    const anonKey      = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Cliente con JWT del usuario que llama (para verificar identidad)
    const authHeader = req.headers.get("Authorization") ?? "";
    const sbCaller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Cliente admin para crear usuarios (service role — nunca exponer en frontend)
    const sbAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // ── 2. Verificar identidad del caller ────────────────
    const { data: { user: caller }, error: callerErr } = await sbCaller.auth.getUser();
    if (callerErr || !caller) {
      return json({ ok: false, error: "No autenticado" }, 401);
    }

    const { data: callerProfile, error: profileErr } = await sbAdmin
      .from("profiles")
      .select("id, role, is_active")
      .eq("id", caller.id)
      .single();

    if (profileErr || !callerProfile) {
      return json({ ok: false, error: "Perfil no encontrado" }, 403);
    }

    const callerRole = callerProfile.role;
    if (!["admin", ...ACCOUNT_OWNER_ROLES].includes(callerRole)) {
      return json({ ok: false, error: "Sin permisos para crear colaboradores" }, 403);
    }
    if (callerProfile.is_active === false) {
      return json({ ok: false, error: "Cuenta desactivada" }, 403);
    }

    // ── 3. Parsear y validar input ───────────────────────
    const body: CreateCollaboratorInput = await req.json();
    const { fullName, email, position, temporaryPassword, modules, parentAccountId } = body;

    if (!fullName?.trim())          return json({ ok: false, error: "Nombre requerido" }, 400);
    if (!email?.trim())             return json({ ok: false, error: "Correo requerido" }, 400);
    if (!position?.trim())          return json({ ok: false, error: "Puesto requerido" }, 400);
    if (!temporaryPassword)         return json({ ok: false, error: "Contraseña requerida" }, 400);
    if (temporaryPassword.length < 8) return json({ ok: false, error: "Contraseña mínimo 8 caracteres" }, 400);
    if (!modules?.length)           return json({ ok: false, error: "Mínimo 1 módulo requerido" }, 400);

    const hasViewPermission = modules.some(m => m.canView === true);
    if (!hasViewPermission) {
      return json({ ok: false, error: "Al menos un módulo debe tener permiso de vista" }, 400);
    }

    // ── 4. Resolver parent_account_id ────────────────────
    let resolvedParentAccountId: string;

    if (callerRole === "admin") {
      if (!parentAccountId) {
        return json({ ok: false, error: "Admin debe especificar parentAccountId" }, 400);
      }
      // Verificar que la cuenta principal exista y sea un tipo válido
      const { data: ownerProfile } = await sbAdmin
        .from("profiles")
        .select("id, role")
        .eq("id", parentAccountId)
        .single();
      if (!ownerProfile || !ACCOUNT_OWNER_ROLES.includes(ownerProfile.role)) {
        return json({ ok: false, error: "Cuenta principal no existe o no puede tener equipo" }, 400);
      }
      resolvedParentAccountId = parentAccountId;
    } else {
      // Cuenta principal solo puede crear colaboradores para sí misma
      if (parentAccountId && parentAccountId !== callerProfile.id) {
        return json({ ok: false, error: "No podés crear colaboradores para otra cuenta" }, 403);
      }
      resolvedParentAccountId = callerProfile.id;
    }

    // ── 5. Crear usuario en Supabase Auth ────────────────
    const { data: authData, error: authErr } = await sbAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: temporaryPassword,
      email_confirm: true, // auto-confirmar — no requiere email
      user_metadata: {
        role: "collaborator",
        full_name: fullName.trim(),
        position: position.trim(),
        parent_account_id: resolvedParentAccountId,
      },
    });

    if (authErr) {
      console.error("[create-collaborator] auth error:", authErr);
      return json({ ok: false, error: authErr.message }, 400);
    }

    const newUserId = authData.user.id;

    // ── 6. Crear profile ─────────────────────────────────
    const { error: insertProfileErr } = await sbAdmin.from("profiles").insert({
      id:                newUserId,
      email:             email.trim().toLowerCase(),
      full_name:         fullName.trim(),
      role:              "collaborator",
      position:          position.trim(),
      parent_account_id: resolvedParentAccountId,
      parent_ceo_id:     resolvedParentAccountId, // legacy — mantener hasta deprecar
      created_by:        callerProfile.id,
      is_active:         true,
    });

    if (insertProfileErr) {
      // Rollback: eliminar el auth user si el profile falló
      await sbAdmin.auth.admin.deleteUser(newUserId);
      console.error("[create-collaborator] profile insert error:", insertProfileErr);
      return json({ ok: false, error: "Error al crear perfil del colaborador" }, 500);
    }

    // ── 7. Crear permisos por módulo ─────────────────────
    const permissionsToInsert = modules.map(m => ({
      user_id:    newUserId,
      module_key: m.moduleKey,
      can_view:   m.canView   ?? false,
      can_create: m.canCreate ?? false,
      can_edit:   m.canEdit   ?? false,
      can_delete: m.canDelete ?? false,
      granted_by: callerProfile.id,
    }));

    const { error: permsErr } = await sbAdmin
      .from("user_module_permissions")
      .insert(permissionsToInsert);

    if (permsErr) {
      console.error("[create-collaborator] perms insert error:", permsErr);
      // No hacer rollback completo — el usuario existe pero sin permisos
      // El CEO puede asignar permisos después
    }

    // ── 8. Respuesta exitosa ─────────────────────────────
    return json({
      ok: true,
      collaborator: {
        id:       newUserId,
        email:    email.trim().toLowerCase(),
        fullName: fullName.trim(),
        position: position.trim(),
        role:     "collaborator",
      },
    }, 201);

  } catch (err) {
    console.error("[create-collaborator] unexpected error:", err);
    return json({ ok: false, error: "Error interno del servidor" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
