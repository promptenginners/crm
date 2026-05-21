<template>
  <div class="page fade-in">
    <div class="page-header">
      <div>
        <div class="page-eyebrow">DIRECTORIO</div>
        <h1 class="page-title">Contactos</h1>
      </div>
      <button class="btn btn-primary" @click="showModal = true">+ Nuevo contacto</button>
    </div>

    <!-- Search -->
    <div class="search-bar">
      <input v-model="search" placeholder="Buscar por nombre, correo o cargo..." />
    </div>

    <!-- Table -->
    <div class="card table-card">
      <div v-if="loading" class="loading-rows">
        <div class="loading-row" v-for="i in 6" :key="i"></div>
      </div>
      <div v-else-if="filtrados.length === 0" class="empty-state">No se encontraron contactos</div>
      <table class="data-table" v-else>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Cargo</th>
            <th>Canal preferido</th>
            <th>Decisor</th>
            <th>Creado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in filtrados" :key="c.id">
            <td>
              <div class="name-cell">
                <div class="avatar">{{ initials(c.nombre, c.apellido) }}</div>
                <div>
                  <div class="name">{{ c.nombre }} {{ c.apellido }}</div>
                  <div class="sub">{{ c.telefono || '' }}</div>
                </div>
              </div>
            </td>
            <td class="mono text-sm">{{ c.correo || '—' }}</td>
            <td>{{ c.cargo || '—' }}</td>
            <td>
              <span v-if="c.canal_preferido" class="tag tag-purple">{{ c.canal_preferido }}</span>
              <span v-else class="text-dim">—</span>
            </td>
            <td>
              <span class="tag" :class="c.es_tomador_decision ? 'tag-green' : 'tag-gray'">
                {{ c.es_tomador_decision ? 'Sí' : 'No' }}
              </span>
            </td>
            <td class="text-dim mono">{{ formatDate(c.creado_en) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" v-if="showModal" @click.self="showModal = false">
      <div class="modal fade-in">
        <div class="modal-header">
          <h2>Nuevo Contacto</h2>
          <button class="btn btn-ghost" @click="showModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>Nombre *</label>
              <input v-model="form.nombre" placeholder="Juan" />
            </div>
            <div class="form-group">
              <label>Apellido *</label>
              <input v-model="form.apellido" placeholder="Pérez" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Correo</label>
              <input v-model="form.correo" type="email" placeholder="juan@empresa.com" />
            </div>
            <div class="form-group">
              <label>Teléfono</label>
              <input v-model="form.telefono" placeholder="+52 55 0000 0000" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Cargo</label>
              <input v-model="form.cargo" placeholder="Director de Tecnología" />
            </div>
            <div class="form-group">
              <label>Canal preferido</label>
              <select v-model="form.canal_preferido">
                <option value="">Sin especificar</option>
                <option value="correo">Correo</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="telefono">Teléfono</option>
                <option value="slack">Slack</option>
              </select>
            </div>
          </div>
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.es_tomador_decision" />
              Tomador de decisión
            </label>
          </div>
          <div class="form-group">
            <label>Notas</label>
            <textarea v-model="form.notas" rows="3" placeholder="Información adicional..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showModal = false">Cancelar</button>
          <button class="btn btn-primary" @click="guardar" :disabled="saving">
            {{ saving ? 'Guardando...' : 'Guardar contacto' }}
          </button>
        </div>
        <div class="form-error" v-if="error">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'

const loading = ref(true)
const contactos = ref([])
const search = ref('')
const showModal = ref(false)
const saving = ref(false)
const error = ref('')

const form = ref({ nombre:'', apellido:'', correo:'', telefono:'', cargo:'', canal_preferido:'', es_tomador_decision:false, notas:'' })

const filtrados = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return contactos.value
  return contactos.value.filter(c =>
    `${c.nombre} ${c.apellido} ${c.correo} ${c.cargo}`.toLowerCase().includes(q)
  )
})

function initials(n, a) { return `${(n||'?')[0]}${(a||'?')[0]}`.toUpperCase() }
function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'2-digit' })
}

async function cargar() {
  loading.value = true
  const { data } = await supabase.from('contactos').select('*').order('creado_en', { ascending: false })
  contactos.value = data || []
  loading.value = false
}

async function guardar() {
  error.value = ''
  if (!form.value.nombre || !form.value.apellido) { error.value = 'Nombre y apellido son obligatorios'; return }
  saving.value = true
  const { error: err } = await supabase.from('contactos').insert([{ ...form.value }])
  saving.value = false
  if (err) { error.value = err.message; return }
  showModal.value = false
  form.value = { nombre:'', apellido:'', correo:'', telefono:'', cargo:'', canal_preferido:'', es_tomador_decision:false, notas:'' }
  await cargar()
}

onMounted(cargar)
</script>

<style scoped>
.page { padding: 32px; max-width: 1200px; }
.page-eyebrow { font-family: var(--font-mono); font-size: 10px; color: var(--text3); letter-spacing: 0.12em; margin-bottom: 4px; }
.page-title { font-size: 28px; font-weight: 800; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }

.search-bar { margin-bottom: 20px; }
.search-bar input { max-width: 400px; }

.table-card { padding: 0; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { font-family: var(--font-mono); font-size: 10px; color: var(--text3); letter-spacing: 0.08em; padding: 14px 16px; text-align: left; border-bottom: 1px solid var(--border); }
.data-table td { padding: 12px 16px; border-bottom: 1px solid var(--border); font-size: 13px; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: var(--bg3); }

.name-cell { display: flex; align-items: center; gap: 10px; }
.avatar { width: 32px; height: 32px; border-radius: 8px; background: var(--bg3); border: 1px solid var(--border2); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: var(--accent2); flex-shrink: 0; }
.name { font-weight: 600; font-size: 13px; }
.sub { font-size: 11px; color: var(--text2); font-family: var(--font-mono); }
.mono { font-family: var(--font-mono); }
.text-sm { font-size: 12px; }
.text-dim { color: var(--text2); }

.loading-rows { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.loading-row { height: 48px; background: var(--bg3); border-radius: var(--radius); animation: pulse 1.5s infinite; }
.empty-state { text-align: center; padding: 48px; color: var(--text3); font-family: var(--font-mono); font-size: 12px; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: var(--bg2); border: 1px solid var(--border2); border-radius: 16px; width: 560px; max-width: 95vw; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); }
.modal-header h2 { font-size: 18px; font-weight: 700; }
.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; gap: 12px; justify-content: flex-end; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { display: flex; flex-direction: column; }
.checkbox-group { flex-direction: row; align-items: center; }
.checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: var(--text); }
.checkbox-label input[type="checkbox"] { width: auto; }

.form-error { padding: 8px 24px 16px; color: var(--accent3); font-size: 12px; font-family: var(--font-mono); }
</style>
