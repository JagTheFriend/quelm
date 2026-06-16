import type { OpenAPI } from "openapi-types";

const spec: OpenAPI.Document = {
  openapi: "3.0.3",
  info: {
    title: "Quelm API",
    description:
      "Workflow orchestration platform API. Manage workflows, run executions, and monitor agent status.",
    version: "1.0.0",
    contact: {
      name: "Quelm Team",
    },
  },
  servers: [
    {
      url: "http://localhost:8000",
      description: "Local development server",
    },
  ],
  tags: [
    { name: "Health", description: "Health check endpoints" },
    { name: "Auth", description: "Authentication and user management" },
    { name: "Workflows", description: "Workflow CRUD operations" },
    { name: "Runs", description: "Workflow run monitoring" },
    { name: "Agents", description: "Agent registry" },
    { name: "Dashboard", description: "Dashboard statistics" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT access token obtained from login/register endpoints",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string", description: "User ID" },
          email: { type: "string", format: "email", description: "User email" },
          name: { type: "string", description: "User display name" },
          createdAt: { type: "string", format: "date-time", description: "Account creation timestamp" },
        },
        required: ["id", "email", "name", "createdAt"],
      },
      AuthTokens: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/User" },
          accessToken: { type: "string", description: "JWT access token" },
        },
      },
      SuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string" },
          data: { type: "object" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
          errorCode: { type: "string" },
        },
      },
      WorkflowNode: {
        type: "object",
        properties: {
          id: { type: "string" },
          type: {
            type: "string",
            enum: [
              "LLM_AGENT",
              "HTTP_AGENT",
              "TRANSFORM_AGENT",
              "EXTRACTION_AGENT",
              "NOTIFICATION_AGENT",
              "STORAGE_AGENT",
            ],
          },
          name: { type: "string" },
          critical: { type: "boolean" },
          config: {
            type: "object",
            properties: {
              promptTemplate: { type: "string" },
              model: { type: "string" },
              maxTokens: { type: "integer" },
            },
          },
        },
        required: ["id", "type", "name", "critical", "config"],
      },
      WorkflowEdge: {
        type: "object",
        properties: {
          id: { type: "string" },
          source: { type: "string" },
          target: { type: "string" },
        },
        required: ["id", "source", "target"],
      },
      WorkflowDefinition: {
        type: "object",
        properties: {
          nodes: {
            type: "array",
            items: { $ref: "#/components/schemas/WorkflowNode" },
          },
          edges: {
            type: "array",
            items: { $ref: "#/components/schemas/WorkflowEdge" },
          },
        },
        required: ["nodes", "edges"],
      },
      Workflow: {
        type: "object",
        properties: {
          id: { type: "string", description: "Workflow ID" },
          name: { type: "string", description: "Workflow name" },
          description: { type: "string", nullable: true, description: "Workflow description" },
          definition: { $ref: "#/components/schemas/WorkflowDefinition" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "name", "definition", "createdAt", "updatedAt"],
      },
      RunStatus: {
        type: "string",
        enum: ["PENDING", "RUNNING", "COMPLETED", "FAILED", "CANCELLED"],
      },
      TaskStatus: {
        type: "string",
        enum: ["PENDING", "RUNNING", "COMPLETED", "FAILED", "CANCELLED"],
      },
      Task: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          type: {
            type: "string",
            enum: [
              "LLM_AGENT",
              "HTTP_AGENT",
              "TRANSFORM_AGENT",
              "EXTRACTION_AGENT",
              "NOTIFICATION_AGENT",
              "STORAGE_AGENT",
            ],
          },
          status: { $ref: "#/components/schemas/TaskStatus" },
          input: { type: "object" },
          output: { type: "object", nullable: true },
          error: { type: "string", nullable: true },
          attempts: { type: "integer" },
          maxAttempts: { type: "integer" },
          critical: { type: "boolean" },
          nodeId: { type: "string", nullable: true },
          startedAt: { type: "string", format: "date-time", nullable: true },
          completedAt: { type: "string", format: "date-time", nullable: true },
        },
      },
      WorkflowRun: {
        type: "object",
        properties: {
          id: { type: "string", description: "Run ID" },
          workflowId: { type: "string", description: "Parent workflow ID" },
          status: { $ref: "#/components/schemas/RunStatus" },
          input: { type: "object", description: "Run input parameters" },
          output: { type: "object", nullable: true, description: "Run output results" },
          startedAt: { type: "string", format: "date-time" },
          completedAt: { type: "string", format: "date-time", nullable: true },
          error: { type: "string", nullable: true },
          tasks: {
            type: "array",
            items: { $ref: "#/components/schemas/Task" },
            description: "Tasks in this run",
          },
        },
      },
      AgentType: {
        type: "string",
        enum: [
          "LLM_AGENT",
          "HTTP_AGENT",
          "TRANSFORM_AGENT",
          "EXTRACTION_AGENT",
          "NOTIFICATION_AGENT",
          "STORAGE_AGENT",
        ],
      },
      AgentStatus: {
        type: "string",
        enum: ["ONLINE", "OFFLINE", "BUSY"],
      },
      Agent: {
        type: "object",
        properties: {
          id: { type: "string", description: "Agent ID" },
          name: { type: "string", description: "Agent name" },
          type: { $ref: "#/components/schemas/AgentType" },
          status: { $ref: "#/components/schemas/AgentStatus" },
          lastSeenAt: { type: "string", format: "date-time", nullable: true },
          tasksHandled: { type: "integer" },
          tasksFailed: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      DashboardStats: {
        type: "object",
        properties: {
          totalWorkflows: { type: "integer", description: "Total number of workflows" },
          totalRuns: { type: "integer", description: "Total number of workflow runs" },
          activeRuns: { type: "integer", description: "Currently running workflows" },
          completedRuns: { type: "integer", description: "Successfully completed runs" },
          failedRuns: { type: "integer", description: "Failed runs" },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        description: "Returns server health status",
        operationId: "healthCheck",
        responses: {
          "200": {
            description: "Server is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        description: "Create a new user account with email and password",
        operationId: "register",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "name"],
                properties: {
                  email: { type: "string", format: "email", description: "User email" },
                  password: { type: "string", minLength: 8, description: "User password" },
                  name: { type: "string", description: "User display name" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/AuthTokens" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "400": {
            description: "Validation error or email already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in",
        description: "Authenticate with email and password",
        operationId: "login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/AuthTokens" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token",
        description: "Exchange a refresh token for a new access token",
        operationId: "refreshToken",
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  refreshToken: { type: "string", description: "Refresh token (also accepted via cookie)" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Token refreshed successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/AuthTokens" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Refresh token required or invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Log out",
        description: "Invalidate the current refresh token and clear the cookie",
        operationId: "logout",
        responses: {
          "200": {
            description: "Logged out successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user",
        description: "Retrieve the authenticated user's profile",
        operationId: "getCurrentUser",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "User profile",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            user: { $ref: "#/components/schemas/User" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/google": {
      get: {
        tags: ["Auth"],
        summary: "Google OAuth redirect",
        description: "Redirect to Google OAuth consent screen",
        operationId: "googleRedirect",
        responses: {
          "302": {
            description: "Redirect to Google OAuth",
          },
          "503": {
            description: "Google OAuth not configured",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/google/callback": {
      get: {
        tags: ["Auth"],
        summary: "Google OAuth callback",
        description: "Handle Google OAuth callback and complete authentication",
        operationId: "googleCallback",
        parameters: [
          {
            name: "code",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Authorization code from Google",
          },
        ],
        responses: {
          "302": {
            description: "Redirect to client with access token",
          },
        },
      },
    },
    "/api/auth/github": {
      get: {
        tags: ["Auth"],
        summary: "GitHub OAuth redirect",
        description: "Redirect to GitHub OAuth consent screen",
        operationId: "githubRedirect",
        responses: {
          "302": {
            description: "Redirect to GitHub OAuth",
          },
          "503": {
            description: "GitHub OAuth not configured",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/github/callback": {
      get: {
        tags: ["Auth"],
        summary: "GitHub OAuth callback",
        description: "Handle GitHub OAuth callback and complete authentication",
        operationId: "githubCallback",
        parameters: [
          {
            name: "code",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Authorization code from GitHub",
          },
        ],
        responses: {
          "302": {
            description: "Redirect to client with access token",
          },
        },
      },
    },
    "/api/workflow": {
      get: {
        tags: ["Workflows"],
        summary: "List all workflows",
        description: "Retrieve all workflows for the authenticated user",
        operationId: "getAllWorkflows",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Workflows fetched successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Workflow" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Workflows"],
        summary: "Create a workflow",
        description: "Create a new workflow definition",
        operationId: "createWorkflow",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["data"],
                properties: {
                  data: {
                    type: "object",
                    required: ["name", "definition"],
                    properties: {
                      name: { type: "string", description: "Workflow name" },
                      description: { type: "string", description: "Workflow description" },
                      definition: { $ref: "#/components/schemas/WorkflowDefinition" },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Workflow created successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Workflow" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/workflow/{id}": {
      get: {
        tags: ["Workflows"],
        summary: "Get a workflow by ID",
        description: "Retrieve a specific workflow by its ID",
        operationId: "getWorkflowById",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Workflow ID",
          },
        ],
        responses: {
          "200": {
            description: "Workflow fetched successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Workflow" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Workflow not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Workflows"],
        summary: "Delete a workflow",
        description: "Delete a workflow by its ID",
        operationId: "deleteWorkflow",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Workflow ID",
          },
        ],
        responses: {
          "200": {
            description: "Workflow deleted successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
          "401": {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Workflow not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/workflow/{id}/run": {
      post: {
        tags: ["Workflows"],
        summary: "Trigger a workflow run",
        description: "Start a new execution of the specified workflow",
        operationId: "triggerRun",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Workflow ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["data"],
                properties: {
                  data: {
                    type: "object",
                    required: ["input"],
                    properties: {
                      input: {
                        type: "object",
                        description: "Input parameters for the workflow run",
                        additionalProperties: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Workflow triggered successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/WorkflowRun" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Workflow not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/runs": {
      get: {
        tags: ["Runs"],
        summary: "List all runs",
        description: "Retrieve all workflow runs for the authenticated user",
        operationId: "getAllRuns",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Runs fetched successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/WorkflowRun" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/runs/{id}": {
      get: {
        tags: ["Runs"],
        summary: "Get a run by ID",
        description: "Retrieve a specific workflow run by its ID",
        operationId: "getRunById",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Run ID",
          },
        ],
        responses: {
          "200": {
            description: "Run fetched successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/WorkflowRun" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Run not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/runs/workflow/{workflowId}": {
      get: {
        tags: ["Runs"],
        summary: "Get runs by workflow ID",
        description: "Retrieve all runs for a specific workflow",
        operationId: "getRunsByWorkflowId",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "workflowId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Workflow ID",
          },
        ],
        responses: {
          "200": {
            description: "Runs fetched successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/WorkflowRun" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/runs/{runId}/stream": {
      get: {
        tags: ["Runs"],
        summary: "Stream run updates",
        description:
          "Subscribe to real-time Server-Sent Events for a specific workflow run. Sends events as `workflow-update` with run status and task progress.",
        operationId: "streamRunUpdates",
        parameters: [
          {
            name: "runId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Run ID to stream",
          },
        ],
        responses: {
          "200": {
            description: "SSE event stream",
            content: {
              "text/event-stream": {
                schema: { type: "string", description: "SSE event stream" },
              },
            },
          },
        },
      },
    },
    "/api/agents": {
      get: {
        tags: ["Agents"],
        summary: "List all agents",
        description: "Retrieve all registered agents",
        operationId: "getAllAgents",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Agents fetched successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Agent" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/agents/{id}": {
      get: {
        tags: ["Agents"],
        summary: "Get an agent by ID",
        description: "Retrieve a specific agent by its ID",
        operationId: "getAgentById",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Agent ID",
          },
        ],
        responses: {
          "200": {
            description: "Agent fetched successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Agent" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Agent not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/dashboard/stats": {
      get: {
        tags: ["Dashboard"],
        summary: "Get dashboard statistics",
        description: "Retrieve aggregate statistics for the dashboard",
        operationId: "getDashboardStats",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Dashboard stats fetched successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/DashboardStats" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/dashboard/recent-runs": {
      get: {
        tags: ["Dashboard"],
        summary: "Get recent runs",
        description: "Retrieve the 5 most recent workflow runs",
        operationId: "getRecentRuns",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Recent runs fetched successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/WorkflowRun" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
};

export default spec;
