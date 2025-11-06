# Firebase MCP Server - Firestore Database Capabilities

**Update 2025-01-05T05:00:00Z**
**[id]**: mcp_20250105_050000_firestore
**[source]**: human
**[reason]**: Document Firebase MCP Server capabilities for Firestore operations
**[status]**: active

## ✅ Verified Firebase MCP Server Status

**Status**: Fully operational  
**Project**: emu-incidents  
**Tools Available**: 32 tools  
**Resources Available**: 6 guides

## Firestore Database Tools Available

### Document Operations
- `firestore_list_collections` - List all collections in database
- `firestore_get_documents` - Get specific documents by path
- `firestore_query_collection` - Query collections with filters
- `firestore_delete_document` - Delete documents

### Authentication & Environment
- `firebase_get_environment` - Get current Firebase project config
- `firebase_get_project` - Get project details
- `firebase_list_projects` - List all accessible projects

### Security Rules
- `firebase_get_security_rules` - Get current Firestore rules
- `firebase_validate_security_rules` - Validate rules syntax

### Cloud Functions
- `functions_list_functions` - List deployed functions
- `functions_get_logs` - Get function execution logs

## Verified Firestore Collections

Using `firestore_list_collections`:
- `_counters` - Counter documents for sequential IDs
- `_idmap` - External ID to internal ID mapping
- `alerts` - Alert notifications
- `events` - System events
- `incidents` - Emergency incidents (primary collection)
- `sheetsErrors` - Error tracking
- `users` - User profiles

## How Firebase MCP Helps with Firestore

### 1. Schema Discovery
- **Tool**: `firestore_list_collections` + `firestore_get_documents`
- **Use Case**: Discover existing collections and document structure
- **Example**: List all collections, then query sample documents to understand schema

### 2. Query Testing
- **Tool**: `firestore_query_collection`
- **Use Case**: Test query filters before implementing in code
- **Example**: Query incidents with status='active' to verify query syntax

### 3. Security Rules Validation
- **Tool**: `firebase_validate_security_rules`
- **Use Case**: Validate rules before deployment
- **Example**: Validate `firestore.rules` before deploying to production

### 4. Operations/Data Inspection
- **Tool**: `firestore_get_documents` + `firestore_query_collection`
- **Use Case**: Inspect production data without writing code
- **Example**: Get specific incident document to debug issues

### 5. Function Logs & Debugging
- **Tool**: `functions_get_logs`
- **Use Case**: Debug Cloud Functions that interact with Firestore
- **Example**: Check logs for ingress function to see AI parsing results

## Best Practices Integration

**✅ Schema Discovery**: Use MCP to discover existing collections before coding  
**✅ Query Validation**: Test queries with MCP before implementing  
**✅ Rules Validation**: Always validate rules before deployment  
**✅ Production Support**: Use MCP for safe read-only operations in production  
**✅ Debugging**: Use logs and queries to debug without code changes

## Limitations

- **Read-Only**: MCP tools are primarily for inspection (read operations)
- **No Write Operations**: Cannot create/update/delete via MCP (use code)
- **Admin SDK**: MCP uses Admin SDK - requires proper authentication
- **Query Limits**: Queries may have limits (use `limit` parameter)

## Example Workflows

### Workflow 1: Debug Incident Creation Issue
1. Use `functions_get_logs` to check ingress function logs
2. Use `firestore_query_collection` to find incident by ID
3. Use `firestore_get_documents` to inspect document structure
4. Use `firebase_validate_security_rules` to check if rules allow writes

### Workflow 2: Schema Discovery
1. Use `firestore_list_collections` to see all collections
2. Use `firestore_query_collection` with limit=1 to get sample documents
3. Document schema structure for code implementation

### Workflow 3: Validate Before Deployment
1. Use `firebase_validate_security_rules` on local rules file
2. Use `firestore_query_collection` to test query patterns
3. Deploy with confidence after validation

