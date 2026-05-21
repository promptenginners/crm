<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span class="logo-icon">⬡</span>
        <div>
          <div class="logo-title">CRM AGENTES</div>
          <div class="logo-sub">v1.0 · evento demo</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-label">MÓDULOS</div>
        <router-link to="/" class="nav-item">
          <span class="nav-icon">◈</span> Dashboard
        </router-link>
        <router-link to="/contactos" class="nav-item">
          <span class="nav-icon">◉</span> Contactos
        </router-link>
        <router-link to="/empresas" class="nav-item">
          <span class="nav-icon">◫</span> Empresas
        </router-link>
        <router-link to="/cotizaciones" class="nav-item">
          <span class="nav-icon">◎</span> Cotizaciones
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="status-dot"></div>
        <span>Supabase conectado</span>
      </div>
    </aside>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
.app-shell { display: flex; height: 100vh; overflow: hidden; }

.sidebar {
  width: 220px; flex-shrink: 0;
  background: var(--bg2);
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  padding: 24px 0;
}

.sidebar-logo {
  display: flex; align-items: center; gap: 12px;
  padding: 0 20px 24px;
  border-bottom: 1px solid var(--border);
}
.logo-icon { font-size: 24px; color: var(--accent); line-height: 1; }
.logo-title { font-family: var(--font-display); font-weight: 800; font-size: 13px; letter-spacing: 0.1em; color: var(--text); }
.logo-sub { font-family: var(--font-mono); font-size: 10px; color: var(--text3); }

.sidebar-nav { flex: 1; padding: 20px 12px; display: flex; flex-direction: column; gap: 2px; }
.nav-section-label {
  font-family: var(--font-mono); font-size: 10px; color: var(--text3);
  letter-spacing: 0.12em; padding: 0 8px; margin-bottom: 8px;
}
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: var(--radius);
  color: var(--text2); text-decoration: none; font-size: 13px; font-weight: 500;
  transition: all 0.15s ease; border: 1px solid transparent;
}
.nav-item:hover { color: var(--text); background: var(--bg3); }
.nav-item.router-link-active {
  color: var(--accent); background: rgba(79,255,176,0.06);
  border-color: rgba(79,255,176,0.15);
}
.nav-icon { font-size: 12px; }

.sidebar-footer {
  padding: 16px 20px 0;
  border-top: 1px solid var(--border);
  display: flex; align-items: center; gap: 8px;
  font-family: var(--font-mono); font-size: 10px; color: var(--text3);
}
.status-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--accent); box-shadow: 0 0 6px var(--accent);
  animation: pulse 2s infinite;
}

.main-content { flex: 1; overflow-y: auto; background: var(--bg); }

.page-enter-active, .page-leave-active { transition: all 0.2s ease; }
.page-enter-from { opacity: 0; transform: translateX(12px); }
.page-leave-to { opacity: 0; transform: translateX(-12px); }
</style>
