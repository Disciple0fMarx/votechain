import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import VoterDashboard from '@/views/VoterDashboard.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'
import { useContract } from '@/composables/useContract'
import { useWeb3 } from '@/composables/useWeb3'
import path from 'path'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/voter',
    name: 'VoterDashboard',
    component: VoterDashboard,
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, _from, next) => {
  const web3 = useWeb3()
  const contract = useContract()

  if (!web3.isConnected) {
    await web3.connectWallet()
    await contract.initialize()
  }

  if (to.path === '/admin') {
    if (!contract.isOwner) {
      next('/voter')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
