<template>
  <div class="page fade-in">
    <div class="page-header">
      <div>
        <div class="page-eyebrow">VENTAS</div>
        <h1 class="page-title">Cotizaciones</h1>
      </div>
      <button class="btn btn-primary" @click="showModal = true">+ Nueva cotización</button>
    </div>

    <!-- Filter bar -->
    <div class="filter-bar">
      <input v-model="search" placeholder="Buscar por número o notas..." style="max-width:300px" />
      <div class="filter-pills">
        <button
          v-for="f in filtros"
          :key="f.value"
          class="pill"
          :class="{ active: filtroActivo === f.value }"
          @click="filtroActivo = f.value"
        >{{ f.label }}</button>
      </div>
    </div>

    <!-- Cards grid -->
    <div v-if="loading" class="cotz-grid">
      <div class="cotz-skeleton" v-for="i in 6" :key="i"></div>
    </div>
    <div v-else-if="filtradas.length === 0" class="empty-state">No hay cotizaciones con ese filtro</div>
    <div class="cotz-grid" v-else>
      <div class="cotz-card" v-for="c in filtradas" :key="c.id">
        <div class="cotz-top">
          <span class="cotz-num mono">{{ c.numero_cotizacion }}</span>
          <span :class="estadoClass(c.estado)" class="tag">{{ c.estado }}</span>
        </div>
        <div class="cotz-total">{{ formatMoney(c.total) }}</div>
        <div class="cotz-meta">
          <span>IVA {{ c.porcentaje_iva }}%</span>
          <span>{{ c.moneda }}</span>
          <span v-if="c.valida_hasta">vence {{ formatDate(c.valida_hasta) }}</span>
        </div>
        <div class="cotz-footer">
          <span class="text-dim mono">{{ formatDate(c.creado_en) }}</span>
          <span v-if="c.creado_por" class="text-dim">por {{ c.creado_por }}</span>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" v-if="showModal" @click.self="showModal = false">
      <div class="modal fade-in">
        <div class="modal-header">
          <h2>Nueva Cotización</h2>
          <button class="btn btn-ghost" @click="showModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>Número de cotización *</label>
              <input v-model="form.numero_cotizacion" placeholder="COT-2024-001" />
            </div>
            <div class="form-group">
              <label>Estado</label>
              <select v-model="form.estado">
                <option value="borrador">Borrador</option>
                <option value="enviada">Enviada</option>
                <option value="aceptada">Aceptada</option>
                <option value="rechazada">Rechazada</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Subtotal</label>
              <input v-model.number="form.subtotal" type="number" placeholder="0.00" @input="calcular" />
            </div>
            <div class="form-group">
              <label>Descuento %</label>
              <input v-model.number="form.porcentaje_descuento" type="number" placeholder="0" @input="calcular" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>IVA %</label>
              <input v-model.number="form.porcentaje_iva" type="number" placeholder="16" @input="calcular" />
            </div>
            <div class="form-group">
              <label>Moneda</label>
              <select v-model="form.moneda">
                <option value="MXN">MXN</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <!-- Totals preview -->
          <div class="totals-preview" v-if="form.subtotal">
            <div class="total-row"><span>Subtotal</span><span class="mono">{{ formatMoney(form.subtotal) }}</span></div>
            <div class="total-row"><span>Descuento</span><span class="mono accent3">- {{ formatMoney(form.monto_descuento) }}</span></div>
            <div class="total-row"><span>IVA ({{ form.porcentaje_iva }}%)</span><span class="mono">{{ formatMoney(form.monto_iva) }}</span></div>
            <div class="total-row total-final"><span>Total</span><span class="mono accent">{{ formatMoney(form.total) }}</span></div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Válida hasta</label>
              <input v-model="form.valida_hasta" type="date" />
            </div>
            <div class="form-group">
              <label>Creado por</label>
              <input v-model="form.creado_por" placeholder="Nombre del vendedor" />
            </div>
          </div>
          <div class="form-group">
            <label>Notas</label>
            <textarea v-model="form.notas" rows="3" placeholder="Condiciones, observaciones..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showModal = false">Cancelar</button>
          <button class="btn btn-primary" @click="guardar" :disabled="saving">
            {{ saving ? 'Guardando...' : 'Guardar cotización' }}
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
const cotizaciones = ref([])
const search = ref('')
const filtroActivo = ref('all')
const showModal = ref(false)
const saving = ref(false)
const error = ref('')

const filtros = [
  { label: 'Todas', value: 'all' },
  { label: 'Borrador', value: 'borrador' },
  { label: 'Enviada', value: 'enviada' },
  { label: 'Aceptada', value: 'aceptada' },
  { label: 'Rechazada', value: 'rechazada' },
]

const form = ref({
  numero_cotizacion: '', estado: 'borrador',
  subtotal: null, porcentaje_descuento: 0, monto_descuento: 0,
  porcentaje_iva: 16, monto_iva: 0, total: 0,
  moneda: 'MXN', valida_hasta: '', creado_por: '', notas: ''
})

const filtradas = computed(() => {
  let arr = cotizaciones.value
  if (filtroActivo.value !== 'all') arr = arr.filter(c => c.estado === filtroActivo.value)
  const q = search.value.toLowerCase()
  if (q) arr = arr.filter(c => `${c.numero_cotizacion} ${c.notas}`.toLowerCase().includes(q))
  return arr
})

function calcular() {
  const sub = form.value.subtotal || 0
  const desc = (sub * (form.value.porcentaje_descuento || 0)) / 100
  const base = sub - desc
  const iva = (base * (form.value.porcentaje_iva || 0)) / 100
  form.value.monto_descuento = desc
  form.value.monto_iva = iva
  form.value.total = base + iva
}

function formatMoney(v) {
  if (v === null || v === undefined || v === '') return '—'
  return new Intl.NumberFormat('es-MX', { style:'currency', currency: form.value?.moneda || 'MXN' }).format(v)
}
function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'2-digit' })
}
function estadoClass(e) {
  const map = { enviada:'tag-purple', aceptada:'tag-green', rechazada:'tag-red', borrador:'tag-gray' }
  return map[e] || 'tag-gray'
}

async function cargar() {
  loading.value = true
  const { data } = await supabase.from('cotizaciones').select('*').order('creado_en', { ascending: false })
  cotizaciones.value = data || []
  loading.value = false
}

async function guardar() {
  error.value = ''
  if (!form.value.numero_cotizacion) { error.value = 'El número de cotización es obligatorio'; return }
  saving.value = true
  const payload = { ...form.value }
  if (!payload.valida_hasta) delete payload.valida_hasta
  if (!payload.subtotal) delete payload.subtotal
  const { error: err } = await supabase.from('cotizaciones').insert([payload])
  saving.value = false
  if (err) { error.value = err.message; return }
  showModal.value = false
  form.value = { numero_cotizacion:'', estado:'borrador', subtotal:null, porcentaje_descuento:0, monto_descuento:0, porcentaje_iva:16, monto_iva:0, total:0, moneda:'MXN', valida_hasta:'', creado_por:'', notas:'' }
  await cargar()
}

onMounted(cargar)
</script>

<style scoped>
.page { padding: 32px; max-width: 1200px; }
.page-eyebrow { font-family: var(--font-mono); font-size: 10px; color: var(--text3); letter-spacing: 0.12em; margin-bottom: 4px; }
.page-title { font-size: 28px; font-weight: 800; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }

.filter-bar { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
.filter-pills { display: flex; gap: 8px; flex-wrap: wrap; }
.pill { padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border2); background: transparent; color: var(--text2); font-size: 12px; font-family: var(--font-display); font-weight: 500; cursor: pointer; transition: all 0.15s; }
.pill:hover { color: var(--text); border-color: var(--accent2); }
.pill.active { background: rgba(124,111,253,0.15); color: var(--accent2); border-color: var(--accent2); }

.cotz-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.cotz-skeleton { height: 140px; background: var(--bg2); border-radius: 12px; animation: pulse 1.5s infinite; }

.cotz-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 20px; transition: border-color 0.15s, transform 0.15s; }
.cotz-card:hover { border-color: var(--border2); transform: translateY(-2px); }

.cotz-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.cotz-num { font-size: 12px; color: var(--text2); }
.cotz-total { font-size: 24px; font-weight: 800; font-family: var(--font-mono); color: var(--accent); margin-bottom: 8px; }
.cotz-meta { display: flex; gap: 8px; flex-wrap: wrap; font-size: 11px; color: var(--text2); font-family: var(--font-mono); margin-bottom: 16px; }
.cotz-meta span { background: var(--bg3); padding: 2px 8px; border-radius: 4px; }
.cotz-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--border); }
.mono { font-family: var(--font-mono); }
.text-dim { color: var(--text2); font-size: 11px; }

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
.form-error { padding: 8px 24px 16px; color: var(--accent3); font-size: 12px; font-family: var(--font-mono); }

.totals-preview { background: var(--bg3); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; display: flex; flex-direction: column; gap: 8px; }
.total-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--text2); }
.total-final { padding-top: 8px; border-top: 1px solid var(--border2); color: var(--text); font-weight: 700; }
.accent { color: var(--accent); }
.accent3 { color: var(--accent3); }
</style>
