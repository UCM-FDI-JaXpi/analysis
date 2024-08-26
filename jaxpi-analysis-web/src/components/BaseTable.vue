<template>
    <table>
        <thead>
            <tr>
                <th v-for="(header, index) in headers" :key="index">
                    {{ header }}
                </th>
            </tr>
        </thead>    
        <tbody>
            <tr v-for="(row, rowIndex) in rows" :key="rowIndex"
                @click="showStudentDetail(row)"
                @mouseover="highlightRow = rowIndex"
                @mouseleave="highlightRow = null"
                :class="{ 'highlight': highlightRow === rowIndex }">
                <td v-for="(key, colIndex) in rowKeys" :key="colIndex"
                    :class="cellClasses ? cellClasses[rowIndex] ? cellClasses[rowIndex][key] : '' : ''">
                    {{ row[key] }}
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup>
import { ref, defineEmits } from 'vue';
// eslint-disable-next-line
const props = defineProps({
    headers: {
        type: Array,
        required: true
    },
    rows: {
        type: Array,
        required: true
    },
    rowKeys: {
        type: Array,
        required: true
    },
    cellClasses: {
        type: Array,
        default: () => []
    }
});

let highlightRow = ref(null);
const emit = defineEmits(['student-selected']); // Definir evento personalizado

function showStudentDetail(studentName) {
    console.log(studentName)
    emit('student-selected', studentName); // Emitir evento personalizado con la info del estudiante
}
</script>

<style scoped>
table {
    border: 2px solid #4276b9;
    border-radius: 3px;
    background-color: #fff;
}

td {
    background-color: #f7f5f5; /* Color por defecto cuando el mouse no está sobre la fila */
}

/* Estilo para td cuando el mouse está sobre la fila */
tr.highlight td {
    background-color: #b4dffca4; /* Color cuando el mouse está sobre la fila */
    cursor: pointer;
}

th,td {
    padding: 10px 20px;
    text-align: center;
}

th {
    background-color: #3fa8ee;
    color: rgba(255, 255, 255, 0.66);
    cursor: pointer;
    user-select: none;
}

th.active {
    color: #fff;
}

th.active .arrow {
    opacity: 1;
}

.arrow {
    display: inline-block;
    vertical-align: middle;
    width: 0;
    height: 0;
    margin-left: 5px;
    opacity: 0.66;
}

.arrow.asc {
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid #fff;
}

.arrow.dsc {
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid #fff;
}
</style>