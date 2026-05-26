import { useMutation } from "@tanstack/react-query";
import i18n from "i18next";
import { authClient } from "@/lib/auth-client";

type UpdateUserProfileRequest = {
	name?: string;
	locale?: string;
};

function useUpdateUserProfile() {
	return useMutation({
		mutationFn: async ({ name, locale }: UpdateUserProfileRequest) => {
			const { data, error } = await authClient.updateUser({
				name,
				locale,
			});

			if (error) {
				throw new Error(
					error.message || i18n.t("common:error.updateUserProfile"),
				);
			}

			return data;
		},
	});
}

export default useUpdateUserProfile;
