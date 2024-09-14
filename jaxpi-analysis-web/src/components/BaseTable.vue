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
            <tr v-for="(row, rowIndex) in rows" :key="rowIndex" >
                <td v-for="(key, colIndex) in rowKeys" :key="colIndex"
                    :class="cellClasses ? cellClasses[rowIndex] ? cellClasses[rowIndex][key] : '' : ''">

                    <span v-if="key === 'view'">
                        {{ row[key] }}
                        <span class="eye-icon" @click.stop="showStudentDetail(row)">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12c-2.48 0-4.5-2.02-4.5-4.5S9.52 7.5 12 7.5s4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5zm0-7c-1.38 0-2.5 1.12-2.5 2.5S10.62 14.5 12 14.5s2.5-1.12 2.5-2.5S13.38 9.5 12 9.5z"/>
                            </svg>
                        </span>
                    </span>
                    <!-- Para las otras columnas muestra normalmente -->
                    <span v-else>
                        {{ row[key] }}
                    </span>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup>
import {  defineEmits } from 'vue';
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

const emit = defineEmits(['student-selected']); // Definir evento personalizado

function showStudentDetail(studentName) {
    console.log(studentName)
    emit('student-selected', studentName); // Emitir evento personalizado con la info del estudiante
}
</script>

<style scoped>
td {
    background-color: #f7f5f5;
}

tr.highlight td {
    background-color: #b4dffca4;
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

.eye-icon {
    margin-left: 8px;
    cursor: pointer;
    display: inline-block;
    width: 16px;
    height: 16px;
    vertical-align: middle;
}

.eye-icon svg {
    width: 100%;
    height: 100%;
    fill: #007BFF;
    transition: fill 0.3s ease;
}

.eye-icon svg:hover {
    fill: #0056b3;
}
</style>