import {createStore} from 'vuex';
import Local from '@/api/local';

const store = createStore({
  state() {
    return {
      user: Local.getLocalData('user')
        ? Local.getLocalData('user')
        : {
            userId: '',
            name: '',
            email: '',
            date: '',
            fimunnes: false,
          },
    };
  },
  mutations: {
    // updateQuest(state: any, {is, idx, point, quest}: any) {
    //   state[is].questions[idx].point = point;
    //   state[is].questions[idx].question = quest;
    // },
  },
  actions: {
    // resetQuest(context: any, {is, idx}: any) {
    //   context.commit('updateQuest', {
    //     is,
    //     idx,
    //     point: 30,
    //     quest: `<p>Soal ${is} nomor ${idx + 1} belum diedit.</p>`,
    //   });
    // },
  },
  getters: {
    // quest: (state) => (is: string, idx: number) => state[is].questions[idx],
  },
});

export default store;
