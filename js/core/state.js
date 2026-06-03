console.log('[State] loaded');

(function () {
  'use strict';

  const _state = {
    supabaseClient:  null,
    currentUser:     null,
    currentProfile:  null,
    selectedClientId: null,
    allModules:      [],
    allClientsData:  [],
  };

  window.ConexxaState = {

    // ── Supabase client ─────────────────────────────────────────
    setSupabaseClient(client) {
      _state.supabaseClient = client;
      console.log('[State] Supabase client set');
    },
    getSupabaseClient() {
      return _state.supabaseClient;
    },

    // ── Usuario actual ───────────────────────────────────────────
    setCurrentUser(user) {
      _state.currentUser = user;
      console.log('[State] Current user set:', user?.email || '—');
    },
    getCurrentUser() {
      return _state.currentUser;
    },

    // ── Perfil actual ────────────────────────────────────────────
    setCurrentProfile(profile) {
      _state.currentProfile = profile;
      console.log('[State] Current profile set:', profile?.full_name || '—');
    },
    getCurrentProfile() {
      return _state.currentProfile;
    },

    // ── Cliente seleccionado ─────────────────────────────────────
    setSelectedClientId(clientId) {
      _state.selectedClientId = clientId;
      console.log('[State] Selected client set:', clientId || '—');
    },
    getSelectedClientId() {
      return _state.selectedClientId;
    },

    // ── Módulos del programa ─────────────────────────────────────
    setAllModules(modules) {
      _state.allModules = modules || [];
      console.log('[State] All modules set:', _state.allModules.length, 'módulos');
    },
    getAllModules() {
      return _state.allModules;
    },

    // ── Datos de clientes (admin) ────────────────────────────────
    setAllClientsData(clients) {
      _state.allClientsData = clients || [];
      console.log('[State] All clients set:', _state.allClientsData.length, 'clientes');
    },
    getAllClientsData() {
      return _state.allClientsData;
    },

    // ── Helper: cliente seleccionado completo ────────────────────
    getSelectedClient() {
      if (!_state.selectedClientId || !_state.allClientsData.length) return null;
      return _state.allClientsData.find(c => c.id === _state.selectedClientId) || null;
    },

    // ── Reset de sesión ──────────────────────────────────────────
    resetSessionState() {
      _state.currentUser     = null;
      _state.currentProfile  = null;
      _state.selectedClientId = null;
      _state.allModules      = [];
      _state.allClientsData  = [];
      console.log('[State] Session state reset');
    },
  };

})();
