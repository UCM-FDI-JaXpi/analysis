<template>
    <Teleport to="body">
        <div v-if="visible" class="modal-overlay" @click="cancel">
            <div class="modal" @click.stop>
                <h3>{{ title }}</h3>
                <p v-html="message"></p>  <!-- v-html para renderizar HTML en el mensaje -->
                <div class="modal-actions">
                    <button @click="confirm">Yes</button>
                    <button @click="cancel">No</button>
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
        default: 'Confirm',
    },
    message: {
        type: String,
        default: 'Are you sure?',
    },
});

const emit = defineEmits(['confirm', 'cancel']);

const confirm = () => {
    emit('confirm');
};

const cancel = () => {
    emit('cancel');
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
    justify-content: space-between;
    margin-top: 1em;
}

button {
    padding: 0.5em 1em;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background:#76C0FF7A;
}

button:hover {
    background: #1976D2;
    color: white;
}
</style>