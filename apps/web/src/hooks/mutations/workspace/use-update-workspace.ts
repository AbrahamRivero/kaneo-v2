import { useMutation } from "@tanstack/react-query";
import i18n from "i18next";
import { authClient } from "@/lib/auth-client";

function useUpdateWorkspace() {
	return useMutation({
		mutationFn: async ({
			name,
			description,
			logo,
		}: {
			name: string;
			description?: string;
			logo?: string;
		}) => {
			const { data, error } = await authClient.organization.update({
				data: {
					name,
					logo: logo || undefined,
					...(description ? { description } : {}),
				},
			});

			if (error) {
				throw new Error(
					error.message || i18n.t("common:error.updateWorkspace"),
				);
			}

			return data;
		},
	});
}

export default useUpdateWorkspace;
