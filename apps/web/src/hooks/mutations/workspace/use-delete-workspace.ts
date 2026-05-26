import { useMutation } from "@tanstack/react-query";
import i18n from "i18next";
import { authClient } from "@/lib/auth-client";

function useDeleteWorkspace() {
	return useMutation({
		mutationFn: async () => {
			const { data, error } = await authClient.organization.delete();

			if (error) {
				throw new Error(
					error.message || i18n.t("common:error.deleteWorkspace"),
				);
			}

			return data;
		},
	});
}

export default useDeleteWorkspace;
