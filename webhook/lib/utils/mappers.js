"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTimestamp = parseTimestamp;
exports.mapIncidentToFirestore = mapIncidentToFirestore;
const firestore_1 = require("firebase-admin/firestore");
function parseTimestamp(timestampStr) {
    if (!timestampStr) {
        const now = new Date();
        return {
            date: now.toISOString().split('T')[0],
            time: now.toTimeString().split(' ')[0].substring(0, 5),
        };
    }
    try {
        const date = new Date(timestampStr);
        if (!isNaN(date.getTime())) {
            return {
                date: date.toISOString().split('T')[0],
                time: date.toTimeString().split(' ')[0].substring(0, 5),
            };
        }
    }
    catch { }
    const now = new Date();
    return {
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0].substring(0, 5),
    };
}
function mapIncidentToFirestore(parsedIncident, notificationReceivedAt) {
    const timestamp = parsedIncident.timestamp || notificationReceivedAt;
    const { date, time } = parseTimestamp(timestamp);
    return {
        date,
        time,
        distance: parsedIncident.distance ?? 0,
        state: parsedIncident.state,
        county: parsedIncident.county,
        city: parsedIncident.city,
        address: parsedIncident.address,
        type: parsedIncident.type,
        description: parsedIncident.description,
        incidentId: parsedIncident.incidentId?.replace('#', '') || undefined,
        source: parsedIncident.source,
        updatedAt: firestore_1.Timestamp.now(),
    };
}
//# sourceMappingURL=mappers.js.map