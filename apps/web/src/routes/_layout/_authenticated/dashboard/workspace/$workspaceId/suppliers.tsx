import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, FileText, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import WorkspaceLayout from "@/components/common/workspace-layout";
import PageTitle from "@/components/page-title";
import AddSupplierDialog from "@/components/shared/modals/add-supplier-dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useCreateSupplier from "@/hooks/mutations/supplier/use-create-supplier";
import useDeleteContract from "@/hooks/mutations/supplier/use-delete-contract";
import useDeleteOrder from "@/hooks/mutations/supplier/use-delete-order";
import useDeleteSupplier from "@/hooks/mutations/supplier/use-delete-supplier";
import useListContracts from "@/hooks/queries/supplier/use-list-contracts";
import useListOrders from "@/hooks/queries/supplier/use-list-orders";
import useListSuppliers from "@/hooks/queries/supplier/use-list-suppliers";

export const Route = createFileRoute(
	"/_layout/_authenticated/dashboard/workspace/$workspaceId/suppliers",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { workspaceId } = Route.useParams();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("vendors");

	const { data: suppliers, isLoading: loadingSuppliers } =
		useListSuppliers(workspaceId);
	const { data: contracts, isLoading: loadingContracts } =
		useListContracts(workspaceId);
	const { data: orders, isLoading: loadingOrders } = useListOrders(workspaceId);

	const createSupplier = useCreateSupplier(workspaceId);
	const deleteSupplier = useDeleteSupplier(workspaceId);
	const deleteContract = useDeleteContract(workspaceId);
	const deleteOrder = useDeleteOrder(workspaceId);

	const totalSuppliers = suppliers?.length ?? 0;
	const totalContracts = contracts?.length ?? 0;
	const totalOrders = orders?.length ?? 0;

	if (loadingSuppliers || loadingContracts || loadingOrders) {
		return (
			<>
				<PageTitle title="Suppliers" />
				<WorkspaceLayout title="Suppliers">
					<div className="space-y-4 p-4">
						<div className="grid gap-4 sm:grid-cols-3">
							{[1, 2, 3].map((i) => (
								<Card key={i}>
									<CardHeader className="pb-2">
										<Skeleton className="h-4 w-20" />
									</CardHeader>
									<CardContent>
										<Skeleton className="h-8 w-24" />
									</CardContent>
								</Card>
							))}
						</div>
						<Skeleton className="h-64 w-full" />
					</div>
				</WorkspaceLayout>
			</>
		);
	}

	return (
		<>
			<PageTitle title="Suppliers" />
			<WorkspaceLayout title="Suppliers">
				<div className="space-y-5 p-4">
					<div className="grid gap-4 sm:grid-cols-3">
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm text-muted-foreground">
									Total Vendors
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-3">
								<div className="flex items-center gap-3">
									<Building2 className="size-5 text-muted-foreground shrink-0" />
									<p className="text-3xl font-semibold">{totalSuppliers}</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm text-muted-foreground">
									Total Contracts
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-3">
								<div className="flex items-center gap-3">
									<FileText className="size-5 text-muted-foreground shrink-0" />
									<p className="text-3xl font-semibold">{totalContracts}</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm text-muted-foreground">
									Service Orders
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-3">
								<div className="flex items-center gap-3">
									<ShoppingCart className="size-5 text-muted-foreground shrink-0" />
									<p className="text-3xl font-semibold">{totalOrders}</p>
								</div>
							</CardContent>
						</Card>
					</div>

					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList>
							<TabsTrigger value="vendors">Vendors</TabsTrigger>
							<TabsTrigger value="contracts">Contracts</TabsTrigger>
							<TabsTrigger value="orders">Service Orders</TabsTrigger>
						</TabsList>

						<TabsContent value="vendors" className="space-y-4">
							<div className="flex justify-end">
								<AddSupplierDialog
									onCreate={(data) => createSupplier.mutateAsync(data)}
								/>
							</div>
							{!suppliers || suppliers.length === 0 ? (
								<Empty className="min-h-[30vh]">
									<EmptyHeader>
										<EmptyMedia variant="icon">
											<Building2 />
										</EmptyMedia>
										<EmptyTitle>No vendors yet</EmptyTitle>
										<EmptyDescription>
											Add a vendor to start tracking suppliers.
										</EmptyDescription>
									</EmptyHeader>
								</Empty>
							) : (
								<Card>
									<CardContent className="p-0">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead className="text-foreground font-medium">
														Name
													</TableHead>
													<TableHead className="text-foreground font-medium">
														Contact
													</TableHead>
													<TableHead className="text-foreground font-medium">
														Email
													</TableHead>
													<TableHead className="text-foreground font-medium">
														Contracts
													</TableHead>
													<TableHead className="text-foreground font-medium">
														Orders
													</TableHead>
													<TableHead className="w-16" />
												</TableRow>
											</TableHeader>
											<TableBody>
												{suppliers.map((s) => (
													<TableRow
														key={s.id}
														className="cursor-pointer hover:bg-muted/50 transition-colors"
														onClick={() =>
															navigate({
																to: "/dashboard/workspace/$workspaceId/suppliers/$supplierId",
																params: {
																	workspaceId,
																	supplierId: s.id,
																},
															})
														}
													>
														<TableCell className="font-medium">
															{s.name}
														</TableCell>
														<TableCell className="text-muted-foreground">
															{s.contactName ?? "—"}
														</TableCell>
														<TableCell className="text-muted-foreground">
															{s.contactEmail ?? "—"}
														</TableCell>
														<TableCell>{s.contractCount}</TableCell>
														<TableCell>{s.orderCount}</TableCell>
														<TableCell>
															<Button
																variant="ghost"
																size="icon-xs"
																className="text-muted-foreground hover:text-destructive"
																onClick={(e) => {
																	e.stopPropagation();
																	deleteSupplier.mutate(s.id);
																}}
															>
																<Trash2 className="size-4" />
															</Button>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</CardContent>
								</Card>
							)}
						</TabsContent>

						<TabsContent value="contracts" className="space-y-4">
							{!contracts || contracts.length === 0 ? (
								<Empty className="min-h-[30vh]">
									<EmptyHeader>
										<EmptyMedia variant="icon">
											<FileText />
										</EmptyMedia>
										<EmptyTitle>No contracts yet</EmptyTitle>
										<EmptyDescription>
											Create a contract from a vendor's detail page.
										</EmptyDescription>
									</EmptyHeader>
								</Empty>
							) : (
								<Card>
									<CardContent className="p-0">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead className="text-foreground font-medium">
														Title
													</TableHead>
													<TableHead className="text-foreground font-medium">
														Vendor
													</TableHead>
													<TableHead className="text-foreground font-medium">
														Value
													</TableHead>
													<TableHead className="text-foreground font-medium">
														Status
													</TableHead>
													<TableHead className="text-foreground font-medium">
														Period
													</TableHead>
													<TableHead className="w-16" />
												</TableRow>
											</TableHeader>
											<TableBody>
												{contracts.map((c) => (
													<TableRow key={c.id}>
														<TableCell className="font-medium">
															{c.title}
														</TableCell>
														<TableCell>{c.supplier.name}</TableCell>
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
														<TableCell className="text-xs text-muted-foreground">
															{c.startDate
																? new Date(c.startDate).toLocaleDateString()
																: "—"}
															{c.endDate
																? ` · ${new Date(c.endDate).toLocaleDateString()}`
																: ""}
														</TableCell>
														<TableCell>
															<Button
																variant="ghost"
																size="icon-xs"
																className="text-muted-foreground hover:text-destructive"
																onClick={() => deleteContract.mutate(c.id)}
															>
																<Trash2 className="size-4" />
															</Button>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</CardContent>
								</Card>
							)}
						</TabsContent>

						<TabsContent value="orders" className="space-y-4">
							{!orders || orders.length === 0 ? (
								<Empty className="min-h-[30vh]">
									<EmptyHeader>
										<EmptyMedia variant="icon">
											<ShoppingCart />
										</EmptyMedia>
										<EmptyTitle>No service orders yet</EmptyTitle>
										<EmptyDescription>
											Create a service order from a vendor's detail page.
										</EmptyDescription>
									</EmptyHeader>
								</Empty>
							) : (
								<Card>
									<CardContent className="p-0">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead className="text-foreground font-medium">
														Title
													</TableHead>
													<TableHead className="text-foreground font-medium">
														Vendor
													</TableHead>
													<TableHead className="text-foreground font-medium">
														Amount
													</TableHead>
													<TableHead className="text-foreground font-medium">
														Status
													</TableHead>
													<TableHead className="text-foreground font-medium">
														Project
													</TableHead>
													<TableHead className="w-16" />
												</TableRow>
											</TableHeader>
											<TableBody>
												{orders.map((o) => (
													<TableRow key={o.id}>
														<TableCell className="font-medium">
															{o.title}
														</TableCell>
														<TableCell>{o.supplier.name}</TableCell>
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
																className="text-muted-foreground hover:text-destructive"
																onClick={() => deleteOrder.mutate(o.id)}
															>
																<Trash2 className="size-4" />
															</Button>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</CardContent>
								</Card>
							)}
						</TabsContent>
					</Tabs>
				</div>
			</WorkspaceLayout>
		</>
	);
}
