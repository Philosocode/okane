// External
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

// Internal
import type { User } from '@/features/users/types/userTypes'

export const useAuthStore = defineStore('AuthStore', () => {
  const authUser = ref<User>()
  const isLoggedIn = computed(() => Boolean(authUser.value?.id))

  function setAuthUser(user: User) {
    authUser.value = user
  }

  function clearAuthUser() {
    authUser.value = undefined
  }

  return { authUser, isLoggedIn, setAuthUser, clearAuthUser }
})
