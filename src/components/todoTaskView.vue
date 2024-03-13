<template>
    <div id="task-container" class="container">
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
        <div class="card">
            <div class="headingdiv">
                <h1>Todo Task View:</h1>
                <button @click="logout" class="logout-button">Logout</button>

            </div>
            <form @submit.prevent="addTask">
                <input type="text" v-model="newTaskTitle" placeholder="Enter task title* Max:255">
                <textarea v-model="newTaskDescription" placeholder="Enter task description* Max:1000"></textarea>
                <button type="submit">Add Task</button>
            </form>
            <ul v-if="tasks.length > 0">
                <li v-for="(task, index) in tasks" :key="index">
                    <div class="task-details">
                        <div class="task-content">
                            <h3 :class="{ 'completed': task.status }">{{ task.task_title }}</h3>
                            <p style="font-size: 12px;">{{ task.task_description }}</p>
                        </div>
                        <div style="min-width: 300px;">
                            <button class="button" @click="markAsComplete(task.id)" v-if="!task.status">Mark as
                                Complete</button>
                            <button class="button" v-if="!task.status" @click="editTask(index)">Edit</button>
                            <button class="button" @click="deleteTask(task.id)">Delete</button>
                        </div>
                    </div>
                </li>
            </ul>
            <ul v-else>
                <li class="message">No tasks available</li>
            </ul>
        </div>

        <div v-if="showModal" class="modal">
            <button class="close" @click="closeModal">x</button>
            <h3>Edit Task</h3>
            <input type="text" v-model="editedTaskTitle" placeholder="Edit task title*  Max:255">
            <textarea v-model="editedTaskDescription" placeholder="Edit task description*  Max:1000"></textarea>
            <button class="button" @click="saveTask">Save</button>
        </div>
    </div>
</template>
<script>
import { taskService } from '@/services/taskService.js';
import axios from 'axios';
export default {
    name: 'TodoTaskView',
    data() {
        return {
            newTaskTitle: '',
            newTaskDescription: '',
            tasks: [],
            taskDescriptions: [],
            showModal: false,
            editedTaskTitle: '',
            editedTaskDescription: '',
            errorMessage: '',
            successMessage: '',
            editedTaskIndex: -1,
            completedTasks: Array(3).fill(false)
        };
    },
    mounted() {
        this.loadTasks();
    },
    methods: {
        async loadTasks() {
            try {
                const response = await taskService.getAllTasks();
                this.tasks = response.data.tasks;
            } catch (error) {
                console.error('Error fetching tasks:', error);
                this.handleRequestError(error);
            }
        },
        async addTask() {
            if (this.newTaskTitle.trim() !== '' && this.newTaskDescription.trim() !== '') {
                try {
                    await taskService.addTask({ title: this.newTaskTitle, description: this.newTaskDescription });
                    await this.loadTasks();
                    this.newTaskTitle = '';
                    this.newTaskDescription = '';
                    this.showSuccessMessage('Task added successfully');
                } catch (error) {
                    console.error('Error adding task:', error);
                    this.handleRequestError(error);
                }
            } else {
                this.showErrorMessage('Please enter title and description');
            }
        },
        async editTask(index) {
            this.editedTaskTitle = this.tasks[index].task_title;
            this.editedTaskDescription = this.tasks[index].task_description;
            this.editedTaskIndex = this.tasks[index].id;
            this.showModal = true;
        },
        async saveTask() {
            if (this.editedTaskTitle.trim() !== '' && this.editedTaskDescription.trim() !== '') {
                try {
                    await taskService.updateTask(this.editedTaskIndex, {
                        title: this.editedTaskTitle,
                        description: this.editedTaskDescription
                    });
                    await this.loadTasks();
                    this.closeModal();
                    this.showSuccessMessage('Task updated successfully');
                } catch (error) {
                    console.error('Error updating task:', error);
                    this.handleRequestError(error);
                }
            }
        },
        async deleteTask(index) {
            if (confirm('Are you sure you want to delete this task?')) {
                try {
                    await taskService.deleteTask(index);
                    await this.loadTasks();
                    this.showSuccessMessage('Task deleted successfully');
                } catch (error) {
                    console.error('Error deleting task:', error);
                    this.handleRequestError(error);
                }
            }
        },
        async markAsComplete(index) {
            if (confirm('Are you sure you want to change the status of this task?')) {
                try {
                    await taskService.changeTaskStatus(index);
                    await this.loadTasks();
                    this.showSuccessMessage('Task status changed successfully');
                } catch (error) {
                    console.error('Error changing task status:', error);
                    this.handleRequestError(error);
                }
            }
            this.completedTasks[index] = true;
        },
        closeModal() {
            this.editedTaskTitle = '';
            this.editedTaskDescription = '';
            this.editedTaskIndex = -1;
            this.showModal = false;
        },
        showSuccessMessage(message) {
            this.successMessage = message;
            setTimeout(() => {
                this.successMessage = '';
            }, 2000);
        },
        showErrorMessage(message) {
            this.errorMessage = message;
            setTimeout(() => {
                this.errorMessage = '';
            }, 2000);
        },
        logout() {
            if (confirm('Are you sure you want to Logout?')) {
                axios.interceptors.request.use(
                    config => {
                        const token = localStorage.getItem('accessToken');
                        if (token) {
                            config.headers.Authorization = `Bearer ${token}`;
                        }
                        return config;
                    },
                    error => {
                        return Promise.reject(error);
                    }
                );
                axios.get('http://127.0.0.1:8000/api/auth/logout')
                    .then(() => {
                        localStorage.clear();
                        window.location.reload();
                    })
                    .catch(error => {
                        console.error('Error logging out:', error);
                        this.showErrorMessage('Failed to logout');
                    });
            }
        },
        handleRequestError(error) {
            if (error.response) {
                if (error.response.status === 422) {
                    this.showErrorMessage(error.response.data.message || 'Failed to perform the operation');
                } else if (error.response.status === 500) {
                    this.showErrorMessage('Internal server error. Please try again later.');
                }
            } else {
                this.showErrorMessage('An unexpected error occurred. Please try again later.');
            }
        }
    }
};
</script>

<style>
.error-message {
    color: red;
    margin-top: 10px;
    text-align: center;
}

.success-message {
    color: green;
    margin-top: 10px;
    text-align: center;
}
</style>
