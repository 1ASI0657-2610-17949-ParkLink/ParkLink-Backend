"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkipResponseWrap = exports.SKIP_RESPONSE_WRAP_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.SKIP_RESPONSE_WRAP_KEY = 'skipResponseWrap';
const SkipResponseWrap = () => (0, common_1.SetMetadata)(exports.SKIP_RESPONSE_WRAP_KEY, true);
exports.SkipResponseWrap = SkipResponseWrap;
//# sourceMappingURL=skip-response-wrap.decorator.js.map