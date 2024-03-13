import axios from 'axios';
const BASE_URL = 'http://127.0.0.1:8000/api/task/';
const axiosInstance = axios.create({
    baseURL: BASE_URL
});
axiosInstance.interceptors.request.use(
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
export const taskService = {
    getAllTasks() {
        return axiosInstance.get('get-tasks');
    },
    addTask(newTask) {
        return axiosInstance.post('store-tasks', newTask);
    },
    updateTask(taskId, updatedTask) {
        return axiosInstance.put('update-task/' + `${taskId}`, updatedTask);
    },
    deleteTask(taskId) {
        return axiosInstance.delete('remove/'+`${taskId}`);
    },
    changeTaskStatus(taskId) {
        return axiosInstance.put('update-status/' + `${taskId}`);
    }
};
export default axiosInstance;