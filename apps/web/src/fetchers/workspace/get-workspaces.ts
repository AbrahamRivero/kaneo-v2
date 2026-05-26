import i18n from "i18next";
import { authClient } from "@/lib/auth-client";

const getWorkspaces = async () => {
	const { data, error } = await authClient.organization.list();

	if (error) {
		throw new Error(error.message || i18n.t("common:error.fetchWorkspaces"));
	}

	return data || [];
};

export default getWorkspaces;
