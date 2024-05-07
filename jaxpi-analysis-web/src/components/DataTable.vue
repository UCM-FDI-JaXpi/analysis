<template>
    <table>
        <thead>
            <tr>
                <th v-for="key in columns" :key="key"
                    @click="sortBy(key)"
                    :class="{ active: sortKey == key }">
                    {{ columnTitles[key] }}
                    <span class="arrow" :class="sortOrders[key] > 0 ? 'asc' : 'dsc'">
                    </span>
                </th>
            </tr>
        </thead>
        <tbody v-if="filteredData.length">
            <tr v-for="entry in filteredData" :key="entry.student"
                @click="showStudentDetail(entry.student)"
                @mouseover="highlightRow = entry.student"
                @mouseleave="highlightRow = null"
                :class="{ 'highlight': highlightRow === entry.student }">
                <td v-for="key in columns" :key="`_${entry.student}_${key}`">
                    {{ key === 'lastTimestamp' ? formatTimestamp(entry[key]) : entry[key] }}
                </td>
            </tr>
        </tbody>
        <tbody v-else>
            <tr>
                <td v-for="key in columns" :key="key"> <!-- Renderizar celdas vacías para cada columna -->
                    &nbsp;
                </td>
            </tr>
        </tbody>
    </table>
    <p v-if="filteredData.length === 0">No matches found</p>
</template>

<script setup>
import { ref, computed, defineEmits } from 'vue'

const emit = defineEmits(['student-selected']); // Definir evento personalizado

const props = defineProps({
    data: Array,
    columns: Array,
    columnTitles: Object,
    filterKey: String
})
let highlightRow = ref(null)


const sortKey = ref('')
const sortOrders = ref(
    props.columns.reduce((o, key) => ((o[key] = 1), o), {})
)

const filteredData = computed(() => {
    let { data, filterKey } = props
    if (filterKey) {
        filterKey = filterKey.toLowerCase()
        data = data.filter((row) => {
            return Object.keys(row).some((key) => {
                return String(row[key]).toLowerCase().indexOf(filterKey) > -1
            })
        })
    }
    const key = sortKey.value
    if (key) {
        const order = sortOrders.value[key]
        data = data.slice().sort((a, b) => {
            a = a[key]
            b = b[key]
            return (a === b ? 0 : a > b ? 1 : -1) * order
        })
    }
    return data
})

function sortBy(key) {
    sortKey.value = key
    sortOrders.value[key] *= -1
}

// To format the timestamp in a readable format
function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString();
}

/*function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}*/

function showStudentDetail(studentName) {
    console.log(studentName)
    emit('student-selected', studentName); // Emitir evento personalizado con el nombre del estudiante
}

</script>

<style>
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