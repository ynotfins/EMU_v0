/**
 * Firebase Repository Helpers
 * 
 * Common helper functions for Firebase repository operations
 */

import { 
  Query,
  DocumentData,
  CollectionReference,
  WhereFilterOp,
  OrderByDirection,
  FieldPath
} from 'firebase-admin/firestore';

/**
 * Helper function to create a query with filters
 */
export function buildQuery(
  collection: CollectionReference<DocumentData>,
  filters?: Array<{
    field: string | FieldPath;
    operator: WhereFilterOp;
    value: any;
  }>,
  orderBy?: {
    field: string | FieldPath;
    direction: OrderByDirection;
  },
  limitCount?: number,
  startAfterDoc?: any
): Query<DocumentData> {
  let query: Query<DocumentData> = collection;

  // Apply filters
  if (filters && filters.length > 0) {
    filters.forEach(filter => {
      query = query.where(filter.field, filter.operator, filter.value);
    });
  }

  // Apply ordering
  if (orderBy) {
    query = query.orderBy(orderBy.field, orderBy.direction);
  }

  // Apply pagination
  if (startAfterDoc) {
    query = query.startAfter(startAfterDoc);
  }

  // Apply limit
  if (limitCount) {
    query = query.limit(limitCount);
  }

  return query;
}
