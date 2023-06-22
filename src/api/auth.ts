import {reactive} from '@vue/reactivity';
import Local from './local';
import Api from './api';

export const useAuth = () => {
  const message = reactive({
    success: '',
    warning: '',
  });
  const toast = reactive({
    success: false,
    warning: false,
  });

  const composs = async (func: any) => {
    message.success = '';
    message.warning = '';
    try {
      const res = await func;
      if (res.data.data) Local.setLocalData('user', res.data.data);
      toast.success = true;
      message.success = res.data.message;
    } catch (err: any) {
      toast.warning = true;
      message.warning = err.response.data.message;
    }
  };

  const login = async (data: any) => composs(Api.post(`/users/login`, data));
  const sendmail = async (data: any) =>
    composs(Api.post('/users/sendmail', data));
  const reset = async (id: string, token: string, data: any) =>
    composs(Api.patch(`/users/reset?id=${id}&token=${token}`, data));
  const update = async (id: string, data: any) =>
    composs(Api.patch(`/users/update/${id}`, data));

  return {
    message,
    toast,
    login,
    sendmail,
    reset,
    update,
  };
};
