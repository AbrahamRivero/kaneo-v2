import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import { budgetExpenseSchema, budgetSchema } from "../schemas";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import createExpenseCtrl from "./controllers/create-expense";
import deleteExpenseCtrl from "./controllers/delete-expense";
import getBudgetCtrl from "./controllers/get-budget";
import getWorkspaceBudgetsCtrl from "./controllers/get-workspace-budgets";
import setBudgetCtrl from "./controllers/set-budget";
import updateExpenseCtrl from "./controllers/update-expense";

const budget = new Hono<{
	Variables: {
		userId: string;
		workspaceId: string;
	};
}>()
	.get(
		"/workspace/:workspaceId",
		describeRoute({
			operationId: "listWorkspaceBudgets",
			tags: ["Budget"],
			description: "Get all budgets with spending summary for a workspace",
			responses: {
				200: {
					description: "List of project budgets",
					content: {
						"application/json": { schema: resolver(v.any()) },
					},
				},
			},
		}),
		workspaceAccess.fromParam("workspaceId"),
		async (c) => {
			const workspaceId = c.get("workspaceId");
			const result = await getWorkspaceBudgetsCtrl(workspaceId);
			return c.json(result);
		},
	)
	.get(
		"/project/:projectId",
		describeRoute({
			operationId: "getProjectBudget",
			tags: ["Budget"],
			description: "Get budget and expenses for a project",
			responses: {
				200: {
					description: "Budget with expenses summary",
					content: {
						"application/json": { schema: resolver(v.any()) },
					},
				},
			},
		}),
		validator("param", v.object({ projectId: v.string() })),
		workspaceAccess.fromProject("projectId"),
		async (c) => {
			const { projectId } = c.req.valid("param");
			const result = await getBudgetCtrl(projectId);
			return c.json(result);
		},
	)
	.put(
		"/project/:projectId",
		describeRoute({
			operationId: "setProjectBudget",
			tags: ["Budget"],
			description: "Set the total budget for a project",
			responses: {
				200: {
					description: "Budget updated successfully",
					content: {
						"application/json": { schema: resolver(budgetSchema) },
					},
				},
			},
		}),
		validator("param", v.object({ projectId: v.string() })),
		validator("json", v.object({ totalBudget: v.string() })),
		workspaceAccess.fromProject("projectId"),
		async (c) => {
			const { projectId } = c.req.valid("param");
			const { totalBudget } = c.req.valid("json");
			const result = await setBudgetCtrl(projectId, totalBudget);
			return c.json(result);
		},
	)
	.post(
		"/:budgetId/expense",
		describeRoute({
			operationId: "createExpense",
			tags: ["Budget"],
			description: "Add an expense to a budget",
			responses: {
				200: {
					description: "Expense created successfully",
					content: {
						"application/json": { schema: resolver(budgetExpenseSchema) },
					},
				},
			},
		}),
		validator("param", v.object({ budgetId: v.string() })),
		validator(
			"json",
			v.object({
				description: v.string(),
				amount: v.string(),
				category: v.optional(v.string()),
				incurredAt: v.optional(v.date()),
			}),
		),
		async (c) => {
			const { budgetId } = c.req.valid("param");
			const data = c.req.valid("json");
			const result = await createExpenseCtrl(budgetId, data);
			return c.json(result);
		},
	)
	.put(
		"/expense/:expenseId",
		describeRoute({
			operationId: "updateExpense",
			tags: ["Budget"],
			description: "Update an expense",
			responses: {
				200: {
					description: "Expense updated successfully",
					content: {
						"application/json": { schema: resolver(budgetExpenseSchema) },
					},
				},
			},
		}),
		validator("param", v.object({ expenseId: v.string() })),
		validator(
			"json",
			v.object({
				description: v.optional(v.string()),
				amount: v.optional(v.string()),
				category: v.optional(v.nullable(v.string())),
				incurredAt: v.optional(v.date()),
			}),
		),
		async (c) => {
			const { expenseId } = c.req.valid("param");
			const data = c.req.valid("json");
			const result = await updateExpenseCtrl(expenseId, data);
			return c.json(result);
		},
	)
	.delete(
		"/expense/:expenseId",
		describeRoute({
			operationId: "deleteExpense",
			tags: ["Budget"],
			description: "Delete an expense",
			responses: {
				200: {
					description: "Expense deleted successfully",
					content: {
						"application/json": { schema: resolver(budgetExpenseSchema) },
					},
				},
			},
		}),
		validator("param", v.object({ expenseId: v.string() })),
		async (c) => {
			const { expenseId } = c.req.valid("param");
			const result = await deleteExpenseCtrl(expenseId);
			return c.json(result);
		},
	);

export default budget;
