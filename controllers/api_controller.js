class api_controller {
   static getKeys(keys) {
      this.keys = keys;
      return this.keys.split(',');
   }

   static validateKey(key, validApiKeys) {
      this.authorized = false;
      for (const validApiKey of validApiKeys) {
         if (key === validApiKey) {
            this.authorized = true;
            break;
         }
      }
   }
}

module.exports = api_controller;