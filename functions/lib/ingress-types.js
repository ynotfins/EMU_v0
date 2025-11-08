"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isExistingIncidentData = isExistingIncidentData;
exports.isGenerateObjectResult = isGenerateObjectResult;
exports.isErrorWithStatus = isErrorWithStatus;
function isExistingIncidentData(data) {
    if (data === undefined) {
        return false;
    }
    return typeof data === 'object' && data !== null;
}
function isGenerateObjectResult(result) {
    return typeof result === 'object' && result !== null && ('object' in result || 'text' in result);
}
function isErrorWithStatus(error) {
    return error instanceof SyntaxError && 'status' in error && 'body' in error;
}
//# sourceMappingURL=ingress-types.js.map