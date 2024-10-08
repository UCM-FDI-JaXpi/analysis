<template>
    <table>
        <thead>
            <tr>
                <th v-for="key in columns" :key="key"
                    @click="sortBy(key)"
                    :class="{ active: sortKey == key }">
                    {{ columnTitles[key] }}
                    <span v-if="key !== 'view'" class="arrow" :class="sortOrders[key] > 0 ? 'asc' : 'dsc'">
                    </span>
                </th>
            </tr>
        </thead>
        <tbody v-if="paginatedData.length">
            <tr v-for="(entry, index) in paginatedData" :key="index">
                <td v-for="key in columns" :key="`_${index}_${key}`">
                    
                    <span v-if="key === 'view'">
                        <span v-if="entry[key]" class="eye-icon" @click.stop="showStudentDetail(entry)" title="View analytics">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12c-2.48 0-4.5-2.02-4.5-4.5S9.52 7.5 12 7.5s4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5zm0-7c-1.38 0-2.5 1.12-2.5 2.5S10.62 14.5 12 14.5s2.5-1.12 2.5-2.5S13.38 9.5 12 9.5z"/>
                            </svg>
                        </span>
                    </span>
                    <!-- Para las otras columnas muestra normalmente -->
                    <div v-else>
                          <div v-if="key === 'lastTimestamp'" v-html="formatTimestamp(entry[key])">
                          </div>
                          <div v-else>
                            {{entry[key]}}
                          </div>
                    </div>
                    
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
    <p v-if="filteredData.length === 0" style="font-size: 1.3rem;">No matches found</p>

    <PaginationComponent v-if="paginatedData.length > 1"
        :totalItems="filteredData.length" 
        :itemsPerPage="itemsPerPage"
        @page-changed="changePage"/>
</template>

<script setup>
import { ref, computed } from 'vue';
import PaginationComponent from '@/components/PaginationComponent.vue';
import { usePaginationStore } from '@/stores/paginationStore';

const paginationStore = usePaginationStore();
const emit = defineEmits(['student-selected']); // Definir evento personalizado

const props = defineProps({
    data: Array,
    columns: Array,
    columnTitles: Object,
    filterKey: String
});

const sortKey = ref('')
const sortOrders = ref(
    props.columns.reduce((o, key) => ((o[key] = 1), o), {})
);
const itemsPerPage = ref(10);

const filteredData = computed(() => {
    let { data, filterKey } = props
    if (filterKey) {
        filterKey = filterKey.toLowerCase()
        data = data.filter((row) => {
            return (
                String(row.studentOriginal).toLowerCase().includes(filterKey) ||
                String(row.key).toLowerCase().includes(filterKey) ||
                String(row.numberOfStatements).toLowerCase().includes(filterKey) ||
                (row.lastTimestamp && new Date(row.lastTimestamp).toLocaleString().toLowerCase().includes(filterKey))
            );
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
});

function showStudentDetail(studentName) {
    console.log(studentName)
    emit('student-selected', studentName); // Emitir evento personalizado con la info del estudiante
}

const paginatedData = computed(() => {
    const start = (paginationStore.currentPage - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredData.value.slice(start, end);
});

function changePage(page) {
    paginationStore.setPage(page);
}

function sortBy(key) {
    sortKey.value = key
    sortOrders.value[key] *= -1
}

// To format the timestamp in a readable format
function formatTimestamp(timestamp) {
    const now = new Date();
    const timeDiff = now - new Date(timestamp);
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    let res;
    if (!timestamp){
        res = "<div class='never-connected-datable '>Never</div>";
    }
    else if (minutes < 10) {
        res = "<div class='recent-activity-datable '>" + new Date(timestamp).toLocaleString() + "</div>";
    } else  if (hours < 2) {
        res = "<div class='long-time-ago-datable '>" + new Date(timestamp).toLocaleString() + "</div>";
    } else {
        res = "<div class='long-long-time-ago-datable '>" + new Date(timestamp).toLocaleString() + "</div>";
    }
    return res ;
}
</script>

<style>
table {
    border: 2px solid #4276b9;
    border-radius: 3px;
    background-color: #fff;
}

td {
    background-color: #f7f5f5;
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

.never-connected-datable {
    color: gray;
}

.long-long-time-ago-datable   {
    color: rgba(255, 0, 0, 0.735);
}

.long-time-ago-datable  {
    color: #f99e00;
}

.recent-activity-datable  {
    color: #18d15e;
}
</style>