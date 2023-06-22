import {createRouter, createWebHistory} from 'vue-router';
import routes from '~pages';
import NProgress from 'nprogress';
import Local from '@/api/local';

const router = createRouter({
  history: createWebHistory(),
  routes,
});

NProgress.configure({showSpinner: false});

router.beforeEach((to: any, from, next) => {
  NProgress.start();
  if (
    (!Local.getLocalData('user') ||
      !Object.keys(Local.getLocalData('user')).includes('fimunnes') ||
      !Object.keys(Local.getLocalData('user')).includes('date')) &&
    !to.path.includes('auth/') &&
    to.fullPath !== '/'
  ) {
    next({
      path: '/auth/login',
      query: {
        redirect: to.fullPath,
      },
    });
  } else {
    next();
  }
});
router.afterEach(() => {
  NProgress.done(true);
});

export default router;
