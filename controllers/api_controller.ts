export default class ApiController{
   private static keys: string = '';

   static getKeys(keys: string): string[] {
      this.keys = keys;
      return this.keys.split(',');
   }

   private static authorized: boolean = false;

   static validateKey(key: string, validApiKeys: string[]): void {
      this.authorized = false;
      for (const validApiKey of validApiKeys) {
         if (key === validApiKey) {
            this.authorized = true;
            break;
         }
      }
   }
}
