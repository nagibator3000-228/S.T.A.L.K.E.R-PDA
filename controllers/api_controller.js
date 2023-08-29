class api_controller {
   static getKeys(keys) {
      this.keys = keys;
      return this.keys.split(',');
   }
}

module.exports = api_controller;