<template>
    <div class="create-group-view" v-if="authStore.isAuthenticated">
        <!-- Form to create class -->
        <div v-if="!showConfirmationCreatedGroup" class="form-container">
            <CreateGroupForm @submit="handleGroupCreated" @cancel="handleCancel" />
        </div>

        <!-- Information message: class created -->
        <div v-if="showConfirmationCreatedGroup" class="confirmation">
            <div class="title-container-image">
                <h3 style="font-size: 1.8rem; margin: 0px;">Class created</h3>
                <img :src=checkImage alt="check image" class="check-image"/>
            </div>
            <p><strong>Institution:</strong> {{ createdGroup.institution }}</p>
            <p><strong>Class name:</strong> {{ createdGroup.name }}</p>
            <p><strong>Teacher:</strong> {{ createdGroup.teacher }}</p>
            <p><strong>Students:</strong></p>
            <div class="students-list">
                <ul>
                    <li v-for="student in createdGroup.students" :key="student">
                            {{ student }}</li>
                </ul>
            </div>
            <button @click="redirectToGroupDetails">OK</button>
        </div>
    </div>
</template>

<script setup>
import checkImage from '@/assets/check.png';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import CreateGroupForm from '@/components/teacher/CreateGroupForm.vue';

const router = useRouter();
const authStore = useAuthStore();

const showConfirmationCreatedGroup = ref(false);
const createdGroup = ref({});

const handleGroupCreated = (groupData) => {
    createdGroup.value = groupData;
    showConfirmationCreatedGroup.value = true;
};

const redirectToGroupDetails = () => {
    showConfirmationCreatedGroup.value = false;
    router.push(`/group-details/${createdGroup.value.id}`); // Redirects to the groupDetails page of the newly created group
};

const handleCancel = () => {
    router.back(); // Redirect to original route if cancelled
};
</script>

<style scoped>
.create-group-view {
    padding: 2.5rem;
    background-color: #fff;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
	position: absolute;
	top: 53%;
	left: 56.5%;
	transform: translate(-50%, -50%);
    width: 100%;
    max-width: 333px;
    max-height: 500px;
}

.form-container {
    max-width: 600px;
    margin: auto;
}

.confirmation {
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 100%;
}

.confirmation > * {
    margin: 0;
}

.confirmation button {
    margin-top: 5px;
    align-self: center;
    padding: 10px 20px; 
    border: none;
    border-radius: 4px;
    background-color: #1976D2;
    color: white;
    cursor: pointer;
}

.confirmation button:hover {
    background-color: #0056b3;
}

.title-container-image {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
}

.check-image {
    max-width: 50px;
    height: auto;
}

.students-list {
    max-height: 170px;
    overflow-y: auto;
    padding-right: 5px;
    border: 1px solid #c1c1c1;
}

.students-list ul {
    padding: 0;
    margin: 0;
    list-style-type: none;
}

.students-list li {
    padding: 5px 0;
}
</style>