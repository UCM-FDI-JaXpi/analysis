<template>
    <Teleport to="body">
        <div v-if="visible" class="modal-overlay">
            <div class="modal">
                <h3>{{ title }}</h3>
                <p>{{ message }}</p>
                <div class="modal-actions">
                    <button @click="ok">OK</button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
// eslint-disable-next-line no-unused-vars
const props = defineProps({
    visible: Boolean,
    title: {
        type: String,
        default: 'Success',
    },
    message: {
        type: String,
        default: 'Operation completed successfully.',
    },
});


const emit = defineEmits(['ok']);

const ok = () => {
    emit('ok');
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal {
    background: white;
    padding: 2em;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.modal-actions {
    display: flex;
    justify-content: center;
    margin-top: 1em;
}

button {
    padding: 0.5em 1em;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background: #76C0FF7A;
}

button:hover {
    background: #1976D2;
    color: white;
}
</style>
