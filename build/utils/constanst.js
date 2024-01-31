"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieOptions = void 0;
exports.cookieOptions = {
    expires: new Date(Date.now() + 48 * 60 * 60 * 1000),
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    domain: '192.168.203.107', // Use the custom domain for testing
};
//# sourceMappingURL=constanst.js.map