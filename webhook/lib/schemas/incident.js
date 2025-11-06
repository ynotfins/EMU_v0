"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incidentSchema = void 0;
const zod_1 = require("zod");
exports.incidentSchema = zod_1.z.object({
    type: zod_1.z
        .string()
        .describe('The type of incident (e.g., "Proximity Alert", "New Incident", "Fall Victim", "Apparatus Accident")'),
    distance: zod_1.z
        .number()
        .nonnegative()
        .optional()
        .describe('Distance in miles if available (e.g., 0.79 for proximity alerts)'),
    state: zod_1.z.string().describe('State abbreviation (e.g., "NJ")'),
    county: zod_1.z.string().describe('County name (e.g., "Monmouth", "Hudson")'),
    city: zod_1.z.string().describe('City name (e.g., "Fair Haven", "Union City")'),
    address: zod_1.z.string().describe('Street address (e.g., "19 Highland Ave", "132 41st St")'),
    description: zod_1.z.string().describe('Detailed description of the incident'),
    emergencyServicesStatus: zod_1.z
        .string()
        .optional()
        .describe('Status of emergency services (e.g., "PD O/S", "PD off", "safety 1")'),
    incidentId: zod_1.z.string().optional().describe('Incident ID if mentioned (e.g., "#1835340")'),
    source: zod_1.z.string().optional().describe('Source reference (e.g., "BNN | BNNDESK/njc4283")'),
    timestamp: zod_1.z.string().optional().describe('Timestamp if available in the message'),
});
//# sourceMappingURL=incident.js.map