"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incidentSchema = void 0;
const zod_1 = require("zod");
exports.incidentSchema = zod_1.z.object({
    type: zod_1.z
        .string()
        .describe('The type of incident, formatted with proper capitalization (e.g., "Fall Victim Incident", "Proximity Alert", "New Incident", "Apparatus Accident")'),
    distance: zod_1.z
        .number()
        .nonnegative()
        .optional()
        .describe('Distance in miles if available (e.g., 0.79 for proximity alerts)'),
    state: zod_1.z.string().describe('State abbreviation (e.g., "NJ")'),
    county: zod_1.z
        .string()
        .describe('County name with proper capitalization (e.g., "Monmouth", "Hudson")'),
    city: zod_1.z
        .string()
        .describe('City name with proper capitalization (e.g., "Fair Haven", "Union City")'),
    address: zod_1.z
        .string()
        .describe('Street address with proper formatting (e.g., "19 Highland Ave", "132 41st St")'),
    description: zod_1.z
        .string()
        .describe('Detailed description of the incident, formatted with proper grammar, capitalization, punctuation, and expanded abbreviations where appropriate (e.g., "PD O/S" -> "Police Department on scene")'),
    emergencyServicesStatus: zod_1.z
        .string()
        .optional()
        .describe('Status of emergency services, formatted in full readable text (e.g., "PD O/S" -> "Police Department On Scene", "PD off" -> "Police Department Cleared")'),
    incidentId: zod_1.z
        .string()
        .optional()
        .describe('Incident ID if mentioned (e.g., "#1835340" or "1835340")'),
    source: zod_1.z.string().optional().describe('Source reference (e.g., "BNN | BNNDESK/njc4283")'),
    timestamp: zod_1.z.string().optional().describe('Timestamp if available in the message'),
    latitude: zod_1.z.number().optional().describe('Latitude coordinate if available'),
    longitude: zod_1.z.number().optional().describe('Longitude coordinate if available'),
});
//# sourceMappingURL=incident.js.map