"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firestoreIncidentSchema = exports.weatherInfoSchema = exports.activitySchema = void 0;
const zod_1 = require("zod");
exports.activitySchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.string(),
    description: zod_1.z.string(),
    timestamp: zod_1.z.any().optional(),
    source: zod_1.z.string().optional(),
});
exports.weatherInfoSchema = zod_1.z.object({
    temperature: zod_1.z.number().optional(),
    conditions: zod_1.z.string().optional(),
    windSpeed: zod_1.z.number().optional(),
    windDirection: zod_1.z.string().optional(),
    humidity: zod_1.z.number().optional(),
    visibility: zod_1.z.number().optional(),
    pressure: zod_1.z.number().optional(),
    fetchedAt: zod_1.z.any().optional(),
});
exports.firestoreIncidentSchema = zod_1.z.object({
    date: zod_1.z.string(),
    time: zod_1.z.string(),
    distance: zod_1.z.number().nonnegative(),
    state: zod_1.z.string(),
    county: zod_1.z.string(),
    city: zod_1.z.string(),
    address: zod_1.z.string(),
    type: zod_1.z.string(),
    description: zod_1.z.string(),
    emergencyServicesStatus: zod_1.z.string().optional(),
    incidentId: zod_1.z.string().optional(),
    source: zod_1.z.string().optional(),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
    createdAt: zod_1.z.any().optional(),
    updatedAt: zod_1.z.any().optional(),
    respondedBy: zod_1.z.string().optional(),
    respondedAt: zod_1.z.any().optional(),
    activity: zod_1.z.array(exports.activitySchema).optional(),
    weatherConditions: exports.weatherInfoSchema.optional(),
});
//# sourceMappingURL=firestore-incident.js.map