import i18n from "i18next";
import { authClient } from "@/lib/auth-client";

type DeleteWorkspaceRequest = {
	id: string;
};

const deleteWorkspace = async ({ id }: DeleteWorkspaceRequest) => {
	const { data, error } = await authClient.organization.delete({
		organizationId: id,
	});

	if (error) {
		throw new Error(error.message || i18n.t("common:error.deleteWorkspace"));
	}

	return data;
};

export default deleteWorkspace;
