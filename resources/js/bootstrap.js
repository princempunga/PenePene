import axios from 'axios';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

const csrfToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];

if (csrfToken) {
    window.axios.defaults.headers.common['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken);
}
