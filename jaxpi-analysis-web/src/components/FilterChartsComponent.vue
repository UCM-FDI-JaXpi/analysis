<template>
    <div class="filters">
        <h2>{{ title }}</h2>
        <div class="elements">
            <button v-for="elem in data" :key="elem.id"
                :class="{ selected: elem.id === selectedElem?.id }" @click="selectElem(elem)">
                {{ elem.name }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';

// eslint-disable-next-line
const props = defineProps({
  data: {
    type: Array, // [ { id: X, name: Y}]
    required: false
  },
  title: {
    type: String,
    default: ''
  }
});
const selectedElem = ref('');

const emit = defineEmits(['selectElem']);

const selectElem = (elem) => {
    selectedElem.value = elem;
    emit('selectElem', elem.id);
};

watch(() => props.data, (newData) => {
    if (newData.length > 0) {
        selectedElem.value = newData[0];
        emit('selectElem', newData[0].id);
    }
}, { immediate: true });
</script>

<style scoped>
.filters {
    display: flex;
    flex-direction: column;
}

.elements button {
    background-color: #E9E9E9;
    border: 0.7px solid #d1d1d1;
    padding: 10px;
    text-align: start;
    width: 100%;
    cursor: pointer;
}

.elements button.selected,
.elements button.selected:hover {
    background-color: #ffa400;
    color:white;
}

.elements button:hover {
    background-color: #f2cd88;
    transform: scale(1.005);
}
</style>