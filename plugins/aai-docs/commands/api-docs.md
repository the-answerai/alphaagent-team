---
description: Generate API documentation from code with endpoints, parameters, and examples
argument-hint: [api path or file]
---

# /api-docs - Generate API Documentation

Generate comprehensive API documentation from your code.

## Usage

```
/api-docs
/api-docs src/routes/
/api-docs --format openapi
```

## Workflow

1. **Discover Endpoints**
   - Scan route files
   - Identify HTTP methods
   - Extract path parameters

2. **Analyze Each Endpoint**
   - Request parameters (query, body, path)
   - Response formats
   - Authentication requirements
   - Error responses

3. **Generate Documentation**
   - Endpoint descriptions
   - Parameter tables
   - Request/response examples
   - Authentication notes

4. **Add Context**
   - Getting started section
   - Authentication guide
   - Rate limiting info
   - Error code reference

## Output Formats

- Markdown documentation
- OpenAPI/Swagger spec
- Postman collection

## Output

- API reference documentation
- Example requests/responses
- Authentication guide
- Error code reference
