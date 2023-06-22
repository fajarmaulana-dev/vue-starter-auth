class Local {
  getLocalData(key: string) {
    return JSON.parse(localStorage.getItem(key)!);
  }
  setLocalData(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }
  removeLocalData(key: string) {
    localStorage.removeItem(key);
  }
}

export default new Local();
