import { useMutation } from "@tanstack/react-query";
import i18n from "i18next";
import { authClient } from "@/lib/auth-client";

type ChangePasswordRequest = {
	currentPassword: string;
	newPassword: string;
};

function useChangePassword() {
	return useMutation({
		mutationFn: async ({
			currentPassword,
			newPassword,
		}: ChangePasswordRequest) => {
			const { data, error } = await authClient.changePassword({
				currentPassword,
				newPassword,
			});

			if (error) {
				throw new Error(error.message || i18n.t("common:error.changePassword"));
			}

			return data;
		},
	});
}

export default useChangePassword;
