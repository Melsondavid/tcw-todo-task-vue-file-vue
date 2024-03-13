<template>
  <div id="Loginsection">
    <form @submit.prevent="login">
      <h3>Login Here</h3>
      <label for="username">Username</label>
      <input type="text" placeholder="Email" id="email" v-model="email">
      <label for="password">Password</label>
      <input type="password" placeholder="Password" id="password" v-model="password">
      <button type="submit">Log In</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'App',
  data() {
    return {
      email: '',
      password: ''
    };
  },
  methods: {
    login() {
      if (!this.email || !this.password) {
        alert('Please enter both Email and password.');
        return;
      }
      const data = {
        email: this.email,
        password: this.password
      };
      axios.post('http://127.0.0.1:8000/api/auth/login', data)
        .then(response => {
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          this.$router.push({ name: 'TodoTask' });
        })
        .catch(error => {
          if (error.response && error.response.data && error.response.data.message) {
            alert('Error: ' + error.response.data.message);
          } else {
            alert('Unknown error occurred');
          }
        });
    }
  }
};
</script>



