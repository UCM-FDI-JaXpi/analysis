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
            <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
                <td v-for="(key, colIndex) in rowKeys" :key="colIndex">
                    {{ row[key] }}
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup>
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
    }
});
</script>