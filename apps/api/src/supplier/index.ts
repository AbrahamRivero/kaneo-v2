import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import {
	serviceOrderSchema,
	supplierContractSchema,
	supplierSchema,
} from "../schemas";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import createContractCtrl from "./controllers/create-contract";
import createOrderCtrl from "./controllers/create-order";
import createSupplierCtrl from "./controllers/create-supplier";
import deleteContractCtrl from "./controllers/delete-contract";
import deleteOrderCtrl from "./controllers/delete-order";
import deleteSupplierCtrl from "./controllers/delete-supplier";
import getSupplierCtrl from "./controllers/get-supplier";
import listContractsCtrl from "./controllers/list-contracts";
import listOrdersCtrl from "./controllers/list-orders";
import listSuppliersCtrl from "./controllers/list-suppliers";
import updateContractCtrl from "./controllers/update-contract";
import updateOrderCtrl from "./controllers/update-order";
import updateSupplierCtrl from "./controllers/update-supplier";

const supplier = new Hono<{
	Variables: {
		userId: string;
		workspaceId: string;
	};
}>()
	.get(
		"/workspace/:workspaceId/suppliers",
		describeRoute({
			operationId: "listSuppliers",
			tags: ["Supplier"],
			description: "List all suppliers in a workspace",
			responses: {
				200: {
					description: "List of suppliers",
					content: {
						"application/json": { schema: resolver(v.any()) },
					},
				},
			},
		}),
		workspaceAccess.fromParam("workspaceId"),
		async (c) => {
			const workspaceId = c.get("workspaceId");
			const result = await listSuppliersCtrl(workspaceId);
			return c.json(result);
		},
	)
	.post(
		"/workspace/:workspaceId/suppliers",
		describeRoute({
			operationId: "createSupplier",
			tags: ["Supplier"],
			description: "Create a new supplier",
			responses: {
				200: {
					description: "Supplier created",
					content: {
						"application/json": { schema: resolver(supplierSchema) },
					},
				},
			},
		}),
		validator("param", v.object({ workspaceId: v.string() })),
		validator(
			"json",
			v.object({
				name: v.string(),
				contactName: v.optional(v.string()),
				contactEmail: v.optional(v.string()),
				contactPhone: v.optional(v.string()),
				website: v.optional(v.string()),
				notes: v.optional(v.string()),
			}),
		),
		workspaceAccess.fromParam("workspaceId"),
		async (c) => {
			const workspaceId = c.get("workspaceId");
			const body = c.req.valid("json");
			const result = await createSupplierCtrl({ workspaceId, ...body });
			return c.json(result);
		},
	)
	.get(
		"/supplier/:supplierId",
		describeRoute({
			operationId: "getSupplier",
			tags: ["Supplier"],
			description: "Get a supplier with contracts and orders",
			responses: {
				200: {
					description: "Supplier details",
					content: {
						"application/json": { schema: resolver(v.any()) },
					},
				},
			},
		}),
		validator("param", v.object({ supplierId: v.string() })),
		workspaceAccess.fromSupplier("supplierId"),
		async (c) => {
			const { supplierId } = c.req.valid("param");
			const result = await getSupplierCtrl(supplierId);
			return c.json(result);
		},
	)
	.put(
		"/supplier/:supplierId",
		describeRoute({
			operationId: "updateSupplier",
			tags: ["Supplier"],
			description: "Update a supplier",
			responses: {
				200: {
					description: "Supplier updated",
					content: {
						"application/json": { schema: resolver(supplierSchema) },
					},
				},
			},
		}),
		validator("param", v.object({ supplierId: v.string() })),
		validator(
			"json",
			v.object({
				name: v.optional(v.string()),
				contactName: v.optional(v.nullable(v.string())),
				contactEmail: v.optional(v.nullable(v.string())),
				contactPhone: v.optional(v.nullable(v.string())),
				website: v.optional(v.nullable(v.string())),
				notes: v.optional(v.nullable(v.string())),
			}),
		),
		workspaceAccess.fromSupplier("supplierId"),
		async (c) => {
			const { supplierId } = c.req.valid("param");
			const body = c.req.valid("json");
			const result = await updateSupplierCtrl(supplierId, body);
			return c.json(result);
		},
	)
	.delete(
		"/supplier/:supplierId",
		describeRoute({
			operationId: "deleteSupplier",
			tags: ["Supplier"],
			description: "Delete a supplier",
			responses: {
				200: {
					description: "Supplier deleted",
					content: {
						"application/json": { schema: resolver(supplierSchema) },
					},
				},
			},
		}),
		validator("param", v.object({ supplierId: v.string() })),
		workspaceAccess.fromSupplier("supplierId"),
		async (c) => {
			const { supplierId } = c.req.valid("param");
			const result = await deleteSupplierCtrl(supplierId);
			return c.json(result);
		},
	)
	.get(
		"/workspace/:workspaceId/contracts",
		describeRoute({
			operationId: "listContracts",
			tags: ["Supplier"],
			description: "List all contracts in a workspace",
			responses: {
				200: {
					description: "List of contracts",
					content: {
						"application/json": { schema: resolver(v.any()) },
					},
				},
			},
		}),
		workspaceAccess.fromParam("workspaceId"),
		async (c) => {
			const workspaceId = c.get("workspaceId");
			const result = await listContractsCtrl(workspaceId);
			return c.json(result);
		},
	)
	.post(
		"/supplier/:supplierId/contracts",
		describeRoute({
			operationId: "createContract",
			tags: ["Supplier"],
			description: "Create a contract for a supplier",
			responses: {
				200: {
					description: "Contract created",
					content: {
						"application/json": { schema: resolver(supplierContractSchema) },
					},
				},
			},
		}),
		validator("param", v.object({ supplierId: v.string() })),
		validator(
			"json",
			v.object({
				workspaceId: v.string(),
				title: v.string(),
				description: v.optional(v.string()),
				value: v.optional(v.string()),
				startDate: v.optional(v.date()),
				endDate: v.optional(v.date()),
				status: v.optional(v.string()),
			}),
		),
		workspaceAccess.fromBody("workspaceId"),
		async (c) => {
			const { supplierId } = c.req.valid("param");
			const body = c.req.valid("json");
			const result = await createContractCtrl({ ...body, supplierId });
			return c.json(result);
		},
	)
	.put(
		"/contract/:contractId",
		describeRoute({
			operationId: "updateContract",
			tags: ["Supplier"],
			description: "Update a contract",
			responses: {
				200: {
					description: "Contract updated",
					content: {
						"application/json": { schema: resolver(supplierContractSchema) },
					},
				},
			},
		}),
		validator("param", v.object({ contractId: v.string() })),
		validator("query", v.object({ workspaceId: v.string() })),
		validator(
			"json",
			v.object({
				title: v.optional(v.string()),
				description: v.optional(v.nullable(v.string())),
				value: v.optional(v.nullable(v.string())),
				startDate: v.optional(v.nullable(v.date())),
				endDate: v.optional(v.nullable(v.date())),
				status: v.optional(v.string()),
			}),
		),
		workspaceAccess.fromQuery("workspaceId"),
		async (c) => {
			const { contractId } = c.req.valid("param");
			const body = c.req.valid("json");
			const result = await updateContractCtrl(contractId, body);
			return c.json(result);
		},
	)
	.delete(
		"/contract/:contractId",
		describeRoute({
			operationId: "deleteContract",
			tags: ["Supplier"],
			description: "Delete a contract",
			responses: {
				200: {
					description: "Contract deleted",
					content: {
						"application/json": { schema: resolver(supplierContractSchema) },
					},
				},
			},
		}),
		validator("param", v.object({ contractId: v.string() })),
		validator("query", v.object({ workspaceId: v.string() })),
		workspaceAccess.fromQuery("workspaceId"),
		async (c) => {
			const { contractId } = c.req.valid("param");
			const result = await deleteContractCtrl(contractId);
			return c.json(result);
		},
	)
	.get(
		"/workspace/:workspaceId/orders",
		describeRoute({
			operationId: "listOrders",
			tags: ["Supplier"],
			description: "List all service orders in a workspace",
			responses: {
				200: {
					description: "List of service orders",
					content: {
						"application/json": { schema: resolver(v.any()) },
					},
				},
			},
		}),
		workspaceAccess.fromParam("workspaceId"),
		async (c) => {
			const workspaceId = c.get("workspaceId");
			const result = await listOrdersCtrl(workspaceId);
			return c.json(result);
		},
	)
	.post(
		"/supplier/:supplierId/orders",
		describeRoute({
			operationId: "createOrder",
			tags: ["Supplier"],
			description: "Create a service order for a supplier",
			responses: {
				200: {
					description: "Service order created",
					content: {
						"application/json": { schema: resolver(serviceOrderSchema) },
					},
				},
			},
		}),
		validator("param", v.object({ supplierId: v.string() })),
		validator(
			"json",
			v.object({
				workspaceId: v.string(),
				title: v.string(),
				description: v.optional(v.string()),
				amount: v.optional(v.string()),
				contractId: v.optional(v.string()),
				projectId: v.optional(v.string()),
				status: v.optional(v.string()),
				orderedAt: v.optional(v.date()),
			}),
		),
		workspaceAccess.fromBody("workspaceId"),
		async (c) => {
			const { supplierId } = c.req.valid("param");
			const body = c.req.valid("json");
			const result = await createOrderCtrl({ ...body, supplierId });
			return c.json(result);
		},
	)
	.put(
		"/order/:orderId",
		describeRoute({
			operationId: "updateOrder",
			tags: ["Supplier"],
			description: "Update a service order",
			responses: {
				200: {
					description: "Service order updated",
					content: {
						"application/json": { schema: resolver(serviceOrderSchema) },
					},
				},
			},
		}),
		validator("param", v.object({ orderId: v.string() })),
		validator("query", v.object({ workspaceId: v.string() })),
		validator(
			"json",
			v.object({
				title: v.optional(v.string()),
				description: v.optional(v.nullable(v.string())),
				amount: v.optional(v.nullable(v.string())),
				status: v.optional(v.string()),
				contractId: v.optional(v.nullable(v.string())),
				projectId: v.optional(v.nullable(v.string())),
				orderedAt: v.optional(v.nullable(v.date())),
				completedAt: v.optional(v.nullable(v.date())),
			}),
		),
		workspaceAccess.fromQuery("workspaceId"),
		async (c) => {
			const { orderId } = c.req.valid("param");
			const body = c.req.valid("json");
			const result = await updateOrderCtrl(orderId, body);
			return c.json(result);
		},
	)
	.delete(
		"/order/:orderId",
		describeRoute({
			operationId: "deleteOrder",
			tags: ["Supplier"],
			description: "Delete a service order",
			responses: {
				200: {
					description: "Service order deleted",
					content: {
						"application/json": { schema: resolver(serviceOrderSchema) },
					},
				},
			},
		}),
		validator("param", v.object({ orderId: v.string() })),
		validator("query", v.object({ workspaceId: v.string() })),
		workspaceAccess.fromQuery("workspaceId"),
		async (c) => {
			const { orderId } = c.req.valid("param");
			const result = await deleteOrderCtrl(orderId);
			return c.json(result);
		},
	);

export default supplier;
