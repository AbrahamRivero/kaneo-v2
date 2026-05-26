import { useMutation } from "@tanstack/react-query";
import i18n from "i18next";
import { authClient } from "@/lib/auth-client";

function useChangePassword() {
	return useMutation({
		mutationFn: async (newPassword: string) => {
			const { error } = await authClient.changePassword({
				newPassword,
			});

			if (error) {
				throw new Error(error.message || i18n.t("common:error.changePassword"));
			}
		},
	});
}

export default useChangePassword;
