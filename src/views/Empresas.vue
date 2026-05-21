<template>
  <div class="page fade-in">
    <div class="page-header">
      <div>
        <div class="page-eyebrow">DIRECTORIO</div>
        <h1 class="page-title">Empresas</h1>
      </div>
      <button class="btn btn-primary" @click="showModal = true">+ Nueva empresa</button>
    </div>

    <div class="search-bar">
      <input v-model="search" placeholder="Buscar por nombre, industria o ciudad..." />
    </div>

    <div class="card table-card">
      <div v-if="loading" class="loading-rows">
        <div class="loading-row" v-for="i in 6" :key="i"></div>
      </div>
      <div v-else-if="filtradas.length === 0" class="empty-state">No se encontraron empresas</div>
      <table class="data-table" v-else>
        <thead>
          <tr>
            <th>Empresa</th>
            <th>Industria</th>
            <th>Tamaño</th>
            <th>Ciudad</th>
            <th>Sitio web</th>
            <th>Creada</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in filtradas" :key="e.id">
            <td>
              <div class="name-cell">
                <div class="company-icon">{{ e.nombre[0] }}</div>
                <div class="name">{{ e.nombre }}</div>
              </div>
            </td>
            <td>{{ e.industria || '—' }}</td>
            <td>
              <span v-if="e.tamano" class="tag tag-gray">{{ e.tamano }}</span>
              <span v-else class="text-dim">—</span>
            </td>
            <td class="text-dim">{{ e.ciudad || '—' }}</td>
            <td>
              <a v-if="e.sitio_web" :href="e.sitio_web" target="_blank" class="link-site">↗ visitar</a>
              <span v-else class="text-dim">—</span>
            </td>
            <td class="text-dim mono">{{ formatDate(e.creado_en) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" v-if="showModal" @click.self="showModal = false">
      <div class="modal fade-in">
        <div class="modal-header">
          <h2>Nueva Empresa</h2>
          <button class="btn btn-ghost" @click="showModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nombre *</label>
            <input v-model="form.nombre" placeholder="Empresa S.A. de C.V." />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Industria</label>
              <input v-model="form.industria" placeholder="Tecnología, Retail, etc." />
            </div>
            <div class="form-group">
              <label>Tamaño</label>
              <select v-model="form.tamano">
                <option value="">Sin especificar</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="500+">500+</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Ciudad</label>
              <input v-model="form.ciudad" placeholder="Ciudad de México" />
            </div>
            <div class="form-group">
              <label>País</label>
              <input v-model="form.pais" placeholder="México" />
            </div>
          </div>
          <div class="form-group">
            <label>Sitio web</label>
            <input v-model="form.sitio_web" placeholder="https://empresa.com" />
          </div>
          <div class="form-group">
            <label>Notas</label>
            <textarea v-model="form.notas" rows="3" placeholder="Información adicional..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showModal = false">Cancelar</button>
          <button class="btn btn-primary" @click="guardar" :disabled="saving">
            {{ saving ? 'Guardando...' : 'Guardar empresa' }}
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
const empresas = ref([])
const search = ref('')
const showModal = ref(false)
const saving = ref(false)
const error = ref('')

const form = ref({ nombre:'', industria:'', tamano:'', ciudad:'', pais:'México', sitio_web:'', notas:'' })

const filtradas = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return empresas.value
  return empresas.value.filter(e =>
    `${e.nombre} ${e.industria} ${e.ciudad}`.toLowerCase().includes(q)
  )
})

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'2-digit' })
}

async function cargar() {
  loading.value = true
  const { data } = await supabase.from('empresas').select('*').order('creado_en', { ascending: false })
  empresas.value = data || []
  loading.value = false
}

async function guardar() {
  error.value = ''
  if (!form.value.nombre) { error.value = 'El nombre es obligatorio'; return }
  saving.value = true
  const payload = { ...form.value }
  if (!payload.tamano) delete payload.tamano
  const { error: err } = await supabase.from('empresas').insert([payload])
  saving.value = false
  if (err) { error.value = err.message; return }
  showModal.value = false
  form.value = { nombre:'', industria:'', tamano:'', ciudad:'', pais:'México', sitio_web:'', notas:'' }
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
.company-icon { width: 32px; height: 32px; border-radius: 8px; background: var(--bg3); border: 1px solid var(--border2); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: var(--accent); flex-shrink: 0; }
.name { font-weight: 600; font-size: 13px; }
.mono { font-family: var(--font-mono); }
.text-dim { color: var(--text2); }
.link-site { color: var(--accent2); font-size: 12px; text-decoration: none; font-family: var(--font-mono); }
.link-site:hover { color: var(--accent); }

.loading-rows { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.loading-row { height: 48px; background: var(--bg3); border-radius: var(--radius); animation: pulse 1.5s infinite; }
.empty-state { text-align: center; padding: 48px; color: var(--text3); font-family: var(--font-mono); font-size: 12px; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: var(--bg2); border: 1px solid var(--border2); border-radius: 16px; width: 520px; max-width: 95vw; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); }
.modal-header h2 { font-size: 18px; font-weight: 700; }
.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; gap: 12px; justify-content: flex-end; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { display: flex; flex-direction: column; }
.form-error { padding: 8px 24px 16px; color: var(--accent3); font-size: 12px; font-family: var(--font-mono); }
</style>
