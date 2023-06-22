import Api from './api';
import Local from './local';

const diff_minutes = (date: any) => {
  let diff = (new Date().getTime() - new Date(date).getTime()) / 1000;
  diff /= 60;
  return Math.round((diff + Number.EPSILON) * 100) / 100;
};

const setup = (store: any, router: any) => {
  Api.interceptors.request.use(
    async (config: any) => {
      const noAuth = ['login', 'sendmail', 'refresh'];
      if (
        !config.url.includes('reset') &&
        !noAuth.includes(config.url.split('/')[2])
      ) {
        let user = Local.getLocalData('user');
        if (!user) router.replace('/auth/login');
        if (user) {
          if (
            !Object.keys(user).includes('fimunnes') ||
            !Object.keys(user).includes('date')
          ) {
            router.replace('/auth/login');
          }
        }
        const limit = user.date;
        if (diff_minutes(limit) >= 9.5) {
          try {
            const res = await Api.post('/users/refresh');
            user.date = res.data.data;
            Local.setLocalData('user', user);
            store.dispatch('login');
          } catch (error: any) {
            if (error.message === 'Network Error') {
              router.replace('/auth/login');
            }
            if (error.response) {
              if (error.response.status === 403) {
                if (Local.getLocalData('user')) {
                  Local.removeLocalData('user');
                  store.dispatch('logout');
                }
                router.replace('/auth/login');
              }
            }
            return Promise.reject(error);
          }
        }
      }
      return config;
    },
    (err) => {
      return Promise.reject(err);
    },
  );

  Api.interceptors.response.use(
    (res) => {
      return res;
    },
    (err) => {
      if (err.message === 'Network Error') {
        const is = err.config.params.is;
        if (is) store.commit('spill', {is, to: true});
        else router.replace('/auth/login');
      }
      return Promise.reject(err);
    },
  );
};

export default setup;
