<template>
  <div class="page fade-in">
    <div class="page-header">
      <div>
        <div class="page-eyebrow">OVERVIEW</div>
        <h1 class="page-title">Dashboard</h1>
      </div>
      <div class="header-date">{{ fechaHoy }}</div>
    </div>

    <div class="stats-grid" v-if="!loading">
      <div class="stat-card" v-for="s in stats" :key="s.label">
        <div class="stat-icon">{{ s.icon }}</div>
        <div class="stat-value">{{ s.value }}</div>
        <div class="stat-label">{{ s.label }}</div>
      </div>
    </div>
    <div class="stats-grid" v-else>
      <div class="stat-card skeleton" v-for="i in 4" :key="i"></div>
    </div>

    <div class="section-grid">
      <div class="card">
        <div class="section-head">
          <span class="section-title">Cotizaciones recientes</span>
          <router-link to="/cotizaciones" class="btn btn-ghost" style="font-size:12px">Ver todas →</router-link>
        </div>
        <div v-if="cotizaciones.length === 0 && !loading" class="empty-state">Sin registros aún</div>
        <table class="mini-table" v-else>
          <thead><tr><th>Número</th><th>Total</th><th>Estado</th><th>Fecha</th></tr></thead>
          <tbody>
            <tr v-for="c in cotizaciones.slice(0,5)" :key="c.id">
              <td class="mono">{{ c.numero_cotizacion }}</td>
              <td class="mono accent">{{ formatMoney(c.total) }}</td>
              <td><span :class="estadoClass(c.estado)" class="tag">{{ c.estado }}</span></td>
              <td class="text-dim">{{ formatDate(c.creado_en) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <div class="section-head">
          <span class="section-title">Contactos recientes</span>
          <router-link to="/contactos" class="btn btn-ghost" style="font-size:12px">Ver todos →</router-link>
        </div>
        <div v-if="contactos.length === 0 && !loading" class="empty-state">Sin registros aún</div>
        <div class="contact-list" v-else>
          <div class="contact-row" v-for="c in contactos.slice(0,5)" :key="c.id">
            <div class="avatar">{{ initials(c.nombre, c.apellido) }}</div>
            <div>
              <div class="contact-name">{{ c.nombre }} {{ c.apellido }}</div>
              <div class="contact-meta">{{ c.cargo || '—' }} · {{ c.correo || '—' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'

const loading = ref(true)
const stats = ref([])
const cotizaciones = ref([])
const contactos = ref([])

const fechaHoy = new Date().toLocaleDateString('es-MX', { weekday:'long', year:'numeric', month:'long', day:'numeric' })

function formatMoney(v) {
  if (!v) return '—'
  return new Intl.NumberFormat('es-MX', { style:'currency', currency:'MXN' }).format(v)
}
function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-MX', { day:'2-digit', month:'short' })
}
function initials(n, a) { return `${(n||'?')[0]}${(a||'?')[0]}`.toUpperCase() }
function estadoClass(e) {
  const map = { enviada:'tag-purple', aceptada:'tag-green', rechazada:'tag-red', borrador:'tag-gray' }
  return map[e] || 'tag-gray'
}

onMounted(async () => {
  const [{ data: cotz }, { data: ctc }, { count: totalCotz }, { count: totalCtc }, { count: totalEmp }] = await Promise.all([
    supabase.from('cotizaciones').select('*').order('creado_en', { ascending: false }).limit(5),
    supabase.from('contactos').select('*').order('creado_en', { ascending: false }).limit(5),
    supabase.from('cotizaciones').select('*', { count: 'exact', head: true }),
    supabase.from('contactos').select('*', { count: 'exact', head: true }),
    supabase.from('empresas').select('*', { count: 'exact', head: true }),
  ])
  cotizaciones.value = cotz || []
  contactos.value = ctc || []
  stats.value = [
    { icon: '◎', label: 'Cotizaciones', value: totalCotz || 0 },
    { icon: '◉', label: 'Contactos', value: totalCtc || 0 },
    { icon: '◫', label: 'Empresas', value: totalEmp || 0 },
    { icon: '◈', label: 'Módulos activos', value: 3 },
  ]
  loading.value = false
})
</script>

<style scoped>
.page { padding: 32px; max-width: 1200px; }
.page-eyebrow { font-family: var(--font-mono); font-size: 10px; color: var(--text3); letter-spacing: 0.12em; margin-bottom: 4px; }
.page-title { font-size: 28px; font-weight: 800; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; }
.header-date { font-family: var(--font-mono); font-size: 11px; color: var(--text3); text-align: right; margin-top: 4px; text-transform: capitalize; }

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
.stat-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 20px; transition: border-color 0.15s; }
.stat-card:hover { border-color: var(--border2); }
.stat-icon { font-size: 20px; color: var(--accent); margin-bottom: 12px; }
.stat-value { font-size: 32px; font-weight: 800; font-family: var(--font-mono); color: var(--text); }
.stat-label { font-size: 12px; color: var(--text2); margin-top: 4px; }
.skeleton { min-height: 100px; animation: pulse 1.5s infinite; background: var(--bg3); }

.section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.section-title { font-weight: 700; font-size: 14px; }

.mini-table { width: 100%; border-collapse: collapse; }
.mini-table th { font-family: var(--font-mono); font-size: 10px; color: var(--text3); letter-spacing: 0.08em; padding: 0 0 10px; text-align: left; border-bottom: 1px solid var(--border); }
.mini-table td { padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 12px; }
.mini-table tr:last-child td { border-bottom: none; }
.mono { font-family: var(--font-mono); }
.accent { color: var(--accent); }
.text-dim { color: var(--text2); }

.contact-list { display: flex; flex-direction: column; gap: 12px; }
.contact-row { display: flex; align-items: center; gap: 12px; }
.avatar { width: 32px; height: 32px; border-radius: 8px; background: var(--bg3); border: 1px solid var(--border2); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: var(--accent2); flex-shrink: 0; }
.contact-name { font-size: 13px; font-weight: 600; }
.contact-meta { font-size: 11px; color: var(--text2); font-family: var(--font-mono); }

.empty-state { text-align: center; padding: 24px; color: var(--text3); font-family: var(--font-mono); font-size: 12px; }
</style>
