<script setup lang="ts">
// Internal
import ColorModeToggle from '@shared/components/ColorModeToggle.vue'
import Kicker from '@shared/components/typography/Kicker.vue'
import Link from '@shared/components/Link.vue'
import NavLink from '@shared/components/NavLink.vue'

import { useAuthStore } from '@features/auth/composables/useAuthStore'

import { AUTH_COPY } from '@features/auth/constants/copy'
import { ROUTE_NAME } from '@shared/services/router/router'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { SHARED_COPY } from '@shared/constants/copy'

const authStore = useAuthStore()
</script>

<template>
  <nav class="grid">
    <template v-if="authStore.isLoggedIn">
      <div class="center column">
        <NavLink
          icon="fa-solid fa-dollar-sign"
          :text="FINANCES_COPY.FINANCES"
          :to="{ name: ROUTE_NAME.FINANCES }"
        />
        <NavLink
          icon="fa-solid fa-tag"
          :text="SHARED_COPY.TAGS"
          :to="{ name: ROUTE_NAME.MANAGE_FINANCE_TAGS }"
        />
        <NavLink
          icon="fa-regular fa-user"
          :text="AUTH_COPY.ACCOUNT_PAGE.LINK"
          :to="{ name: ROUTE_NAME.ACCOUNT }"
        />
      </div>

      <div class="right column">
        <NavLink
          active-class=""
          icon="fa-solid fa-right-from-bracket"
          :text="AUTH_COPY.LOGOUT"
          to="#"
          @click="authStore.logout()"
        />
        <ColorModeToggle />
      </div>
    </template>

    <template v-else>
      <div class="center column">
        <Link class="text-link" :to="{ name: ROUTE_NAME.LOGIN }">
          <Kicker>{{ AUTH_COPY.AUTH_FORM.LOGIN }}</Kicker></Link
        >
        <Link class="text-link" :to="{ name: ROUTE_NAME.REGISTER }"
          ><Kicker>{{ AUTH_COPY.AUTH_FORM.REGISTER }}</Kicker></Link
        >
        <ColorModeToggle />
      </div>
    </template>
  </nav>
</template>

<style scoped lang="scss">
.grid {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-md);
  margin-inline: auto;
  max-width: var(--max-content-width);

  @include respond(md) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
}

.column {
  display: flex;
  align-items: center;
  gap: var(--space-xs);

  @include respond(sm) {
    gap: var(--space-md);
  }
}

@include respond(md) {
  .center {
    grid-column: 2 / 3;
    justify-self: center;
  }

  .right {
    grid-column: 3 / -1;
    justify-self: end;
  }
}

.text-link {
  color: var(--color-text);
  font-size: var(--font-size-sm);
}
</style>
