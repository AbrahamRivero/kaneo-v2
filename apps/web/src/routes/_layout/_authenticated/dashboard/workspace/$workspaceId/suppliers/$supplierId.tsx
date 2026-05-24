import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Building2, Trash2 } from "lucide-react";
import WorkspaceLayout from "@/components/common/workspace-layout";
import PageTitle from "@/components/page-title";
import AddContractDialog from "@/components/shared/modals/add-contract-dialog";
import AddOrderDialog from "@/components/shared/modals/add-order-dialog";
import EditSupplierDialog from "@/components/shared/modals/edit-supplier-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import useCreateContract from "@/hooks/mutations/supplier/use-create-contract";
import useCreateOrder from "@/hooks/mutations/supplier/use-create-order";
import useDeleteContract from "@/hooks/mutations/supplier/use-delete-contract";
import useDeleteOrder from "@/hooks/mutations/supplier/use-delete-order";
import useUpdateSupplier from "@/hooks/mutations/supplier/use-update-supplier";
import useGetSupplier from "@/hooks/queries/supplier/use-get-supplier";

export const Route = createFileRoute(
	"/_layout/_authenticated/dashboard/workspace/$workspaceId/suppliers/$supplierId",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { workspaceId, supplierId } = Route.useParams();
	const navigate = useNavigate();
	const { data: supplier, isLoading } = useGetSupplier(supplierId);
	const updateSupplier = useUpdateSupplier(workspaceId);
	const createContract = useCreateContract(workspaceId);
	const deleteContract = useDeleteContract(workspaceId);
	const createOrder = useCreateOrder(workspaceId);
	const deleteOrder = useDeleteOrder(workspaceId);

	if (isLoading) {
		return (
			<>
				<PageTitle title="Supplier" />
				<WorkspaceLayout title="Supplier">
					<div className="space-y-4 p-4">
						<Skeleton className="h-8 w-48" />
						<Skeleton className="h-32 w-full" />
						<Skeleton className="h-48 w-full" />
					</div>
				</WorkspaceLayout>
			</>
		);
	}

	if (!supplier) {
		return (
			<>
				<PageTitle title="Supplier" />
				<WorkspaceLayout title="Supplier">
					<Empty className="min-h-[40vh]">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<Building2 />
							</EmptyMedia>
							<EmptyTitle>Supplier not found</EmptyTitle>
							<EmptyDescription>
								The supplier you're looking for doesn't exist.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				</WorkspaceLayout>
			</>
		);
	}

	const handleEdit = (data: {
		name: string;
		contactName: string | null;
		contactEmail: string | null;
		contactPhone: string | null;
		website: string | null;
		notes: string | null;
	}) => {
		updateSupplier.mutate({ supplierId, data });
	};

	const handleCreateContract = async (data: {
		title: string;
		value?: string;
		status: string;
	}) => {
		await createContract.mutateAsync({
			supplierId,
			data: { workspaceId, ...data },
		});
	};

	const handleCreateOrder = async (data: {
		title: string;
		amount?: string;
		status: string;
	}) => {
		await createOrder.mutateAsync({
			supplierId,
			data: { workspaceId, ...data },
		});
	};

	return (
		<>
			<PageTitle title={supplier.name} />
			<WorkspaceLayout title={supplier.name}>
				<div className="space-y-5 p-4">
					<Button
						variant="ghost"
						size="sm"
						onClick={() =>
							navigate({
								to: "/dashboard/workspace/$workspaceId/suppliers",
								params: { workspaceId },
							})
						}
					>
						<ArrowLeft className="mr-1 size-4" />
						Back to Suppliers
					</Button>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle className="text-lg">Vendor Details</CardTitle>
							<EditSupplierDialog supplier={supplier} onSave={handleEdit} />
						</CardHeader>
						<CardContent className="grid gap-4 sm:grid-cols-2">
							<div>
								<p className="text-xs text-muted-foreground">Contact</p>
								<p>{supplier.contactName ?? "—"}</p>
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Email</p>
								<p>{supplier.contactEmail ?? "—"}</p>
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Phone</p>
								<p>{supplier.contactPhone ?? "—"}</p>
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Website</p>
								<p>{supplier.website ?? "—"}</p>
							</div>
							{supplier.notes && (
								<div className="sm:col-span-2">
									<p className="text-xs text-muted-foreground">Notes</p>
									<p className="whitespace-pre-wrap">{supplier.notes}</p>
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle className="text-lg">
								Contracts ({supplier.contracts.length})
							</CardTitle>
							<AddContractDialog onCreate={handleCreateContract} />
						</CardHeader>
						<CardContent className="p-0">
							{supplier.contracts.length === 0 ? (
								<div className="p-6 text-center text-sm text-muted-foreground">
									No contracts yet.
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Title</TableHead>
											<TableHead>Value</TableHead>
											<TableHead>Status</TableHead>
											<TableHead />
										</TableRow>
									</TableHeader>
									<TableBody>
										{supplier.contracts.map((c) => (
											<TableRow key={c.id}>
												<TableCell className="font-medium">{c.title}</TableCell>
												<TableCell>
													{c.value
														? `$${Number.parseFloat(c.value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
														: "—"}
												</TableCell>
												<TableCell>
													<Badge
														variant="outline"
														className="capitalize font-medium"
													>
														{c.status}
													</Badge>
												</TableCell>
												<TableCell>
													<Button
														variant="ghost"
														size="icon-xs"
														onClick={() => deleteContract.mutate(c.id)}
													>
														<Trash2 className="size-4" />
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle className="text-lg">
								Service Orders ({supplier.serviceOrders.length})
							</CardTitle>
							<AddOrderDialog onCreate={handleCreateOrder} />
						</CardHeader>
						<CardContent className="p-0">
							{supplier.serviceOrders.length === 0 ? (
								<div className="p-6 text-center text-sm text-muted-foreground">
									No service orders yet.
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Title</TableHead>
											<TableHead>Amount</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Project</TableHead>
											<TableHead />
										</TableRow>
									</TableHeader>
									<TableBody>
										{supplier.serviceOrders.map((o) => (
											<TableRow key={o.id}>
												<TableCell className="font-medium">{o.title}</TableCell>
												<TableCell>
													{o.amount
														? `$${Number.parseFloat(o.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
														: "—"}
												</TableCell>
												<TableCell>
													<Badge
														variant="outline"
														className="capitalize font-medium"
													>
														{o.status}
													</Badge>
												</TableCell>
												<TableCell className="text-muted-foreground">
													{o.project?.name ?? "—"}
												</TableCell>
												<TableCell>
													<Button
														variant="ghost"
														size="icon-xs"
														onClick={() => deleteOrder.mutate(o.id)}
													>
														<Trash2 className="size-4" />
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</div>
			</WorkspaceLayout>
		</>
	);
}
