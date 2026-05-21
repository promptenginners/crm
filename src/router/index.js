import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Contactos from '../views/Contactos.vue'
import Empresas from '../views/Empresas.vue'
import Cotizaciones from '../views/Cotizaciones.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/contactos', component: Contactos },
  { path: '/empresas', component: Empresas },
  { path: '/cotizaciones', component: Cotizaciones },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
