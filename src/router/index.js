import {
    createRouter,
    createWebHistory
} from 'vue-router';
import Login from '../components/login.vue';
import TodoView from '../components/todoTaskView.vue';
import {
    isAuthenticated
} from './auth.js';

const routes = [{
        path: '/',
        name: 'Home',
        component: Login
    },
    {
        path: '/todo-task',
        name: 'TodoTask',
        component: TodoView,
        meta: {
            requiresAuth: true
        }
    }
];
const router = createRouter({
    history: createWebHistory(),
    routes
});
router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!isAuthenticated()) {
            next({
                name: 'Home'
            });
        } else {
            next();
        }
    } else {
        if (isAuthenticated()) {
            next({
                name: 'TodoTask'
            });
        } else {
            next();
        }
    }
});
export default router;