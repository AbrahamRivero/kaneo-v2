import i18n from "i18next";
import { authClient } from "@/lib/auth-client";

type UpdateWorkspaceRequest = {
	id: string;
	name: string;
	description?: string;
	logo?: string;
	slug?: string;
};

const updateWorkspace = async ({
	id,
	name,
	description,
	logo,
	slug,
}: UpdateWorkspaceRequest) => {
	const metadata = description ? { description } : undefined;

	const { data, error } = await authClient.organization.update({
		organizationId: id,
		data: {
			name,
			slug,
			logo,
			metadata,
		},
	});

	if (error) {
		throw new Error(error.message || i18n.t("common:error.updateWorkspace"));
	}

	return data;
};

export default updateWorkspace;
