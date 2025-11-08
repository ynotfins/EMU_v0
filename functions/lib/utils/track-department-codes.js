"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackDepartmentCodes = trackDepartmentCodes;
const admin = __importStar(require("firebase-admin"));
function getDb() {
    return admin.firestore();
}
async function trackDepartmentCodes(incidentId, codes, address, city, state, county, alertType) {
    if (!codes || codes.length === 0 || !address || !city || !state)
        return;
    const db = getDb();
    const batch = db.batch();
    const now = new Date().toISOString();
    for (const code of codes) {
        // Sanitize code: replace slashes with underscores for Firestore document ID
        const sanitizedCode = code.replace(/\//g, '_');
        const mappingRef = db.collection('fireDepartmentMappings').doc(sanitizedCode);
        const mappingSnap = await mappingRef.get();
        if (mappingSnap.exists) {
            const existing = mappingSnap.data();
            const addressExists = existing.addressAssociations.some((a) => a.address.toLowerCase() === address.toLowerCase() &&
                a.city.toLowerCase() === city.toLowerCase() &&
                a.state.toLowerCase() === state.toLowerCase() &&
                (a.county || '').toLowerCase() === (county || '').toLowerCase());
            if (!addressExists) {
                existing.addressAssociations.push({
                    address,
                    city,
                    state,
                    county: county || undefined,
                    alertType: alertType || undefined,
                    incidentCount: 1,
                    firstSeen: now,
                    lastSeen: now,
                });
            }
            else {
                const assoc = existing.addressAssociations.find((a) => a.address.toLowerCase() === address.toLowerCase() &&
                    a.city.toLowerCase() === city.toLowerCase() &&
                    a.state.toLowerCase() === state.toLowerCase() &&
                    (a.county || '').toLowerCase() === (county || '').toLowerCase());
                if (assoc) {
                    assoc.incidentCount++;
                    assoc.lastSeen = now;
                    if (alertType && !assoc.alertType) {
                        assoc.alertType = alertType;
                    }
                    else if (alertType && assoc.alertType !== alertType) {
                        assoc.alertType = `${assoc.alertType}, ${alertType}`;
                    }
                }
            }
            existing.updatedAt = now;
            // Filter out undefined values for Firestore
            const updateData = {};
            Object.keys(existing).forEach(key => {
                const value = existing[key];
                if (value !== undefined) {
                    updateData[key] = value;
                }
            });
            batch.update(mappingRef, updateData);
        }
        else {
            const stateMatch = code.match(/^([a-z]{2})\d+/i);
            const newMapping = {
                code: sanitizedCode,
                originalCode: code,
                confidence: 'unknown',
                source: 'crossref',
                addressAssociations: [{
                        address,
                        city,
                        state,
                        ...(county ? { county } : {}),
                        ...(alertType ? { alertType } : {}),
                        incidentCount: 1,
                        firstSeen: now,
                        lastSeen: now,
                    }],
                createdAt: now,
                updatedAt: now,
            };
            if (stateMatch) {
                newMapping.state = stateMatch[1].toUpperCase();
            }
            batch.set(mappingRef, newMapping);
        }
    }
    await batch.commit();
}
//# sourceMappingURL=track-department-codes.js.map