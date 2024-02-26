<script setup lang="ts">
// External
import { ref } from 'vue'

// Internal
import PageLayout from '@/shared/layouts/PageLayout.vue'
import FormInput from '@/features/forms/components/FormInput.vue'

const formData = ref({
  email: "",
  name: "",
  password: ""
})

function handleSubmit(event: Event) {
  console.log(event)
}

</script>

<template>
  <PageLayout>
    <h1>Register</h1>

    <form @submit.prevent="handleSubmit">
      <fieldset>
        <div class="form-group">
          <FormInput label="Name" name="name" type="text" v-model="formData.name" />
        </div>

        <div class="form-group">
          <FormInput label="Email" name="email" type="email" v-model="formData.email" />
        </div>

        <div class="form-group">
          <FormInput label="Password" name="password" type="password" v-model="formData.password" />
        </div>

        <button type="submit">Register</button>
      </fieldset>
    </form>
  </PageLayout>
</template>

<style scoped>
fieldset {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 12rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}
</style>
