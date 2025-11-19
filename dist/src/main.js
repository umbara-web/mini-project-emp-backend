"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_config_1 = require("./config/env.config");
const app_1 = __importDefault(require("./app"));
app_1.default.listen(env_config_1.PORT, () => {
    console.log(`Server started on port ${env_config_1.PORT}`);
});
