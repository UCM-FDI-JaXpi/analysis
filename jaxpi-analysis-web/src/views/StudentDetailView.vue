<template>
    <div>
        <h1>{{ studentName }}</h1>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const studentName = ref('')
const router = useRouter()

onMounted(async () => {
    const name = router.currentRoute.value.params.name
    console.log(name)
    studentName.value = name
})
</script>
