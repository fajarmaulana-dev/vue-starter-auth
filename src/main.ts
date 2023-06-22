import {createApp} from '@vue/runtime-dom';
import App from './App.vue';
import router from './router';
import store from './global';
import interceptor from '@/api/interceptor';
import 'nprogress/nprogress.css';
import './style.css';

const app = createApp(App);

app.use(router);
app.use(store);
interceptor(store, router);

app.mount('#app');
