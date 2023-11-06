"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ApiController = /** @class */ (function () {
    function ApiController() {
    }
    ApiController.getKeys = function (keys) {
        this.keys = keys;
        return this.keys.split(',');
    };
    ApiController.validateKey = function (key, validApiKeys) {
        this.authorized = false;
        for (var _i = 0, validApiKeys_1 = validApiKeys; _i < validApiKeys_1.length; _i++) {
            var validApiKey = validApiKeys_1[_i];
            if (key === validApiKey) {
                this.authorized = true;
                break;
            }
        }
    };
    ApiController.keys = '';
    ApiController.authorized = false;
    return ApiController;
}());
exports.default = ApiController;
