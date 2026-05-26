import i18n from "i18next";

export type ApiError = {
	message: string;
	type: "network" | "cors" | "auth" | "server" | "unknown";
	status?: number;
	originalError?: Error;
};

export function parseApiError(error: unknown): ApiError {
	if (error instanceof Error) {
		if (
			error.message.includes("Failed to fetch") ||
			error.message.includes("NetworkError") ||
			error.message.includes("CORS")
		) {
			return {
				message: i18n.t("common:error.cors"),
				type: "cors",
				originalError: error,
			};
		}

		if (
			error.message.includes("fetch") ||
			error.message.includes("network") ||
			error.message.includes("connection")
		) {
			return {
				message: i18n.t("common:error.network"),
				type: "network",
				originalError: error,
			};
		}

		if (
			error.message.includes("401") ||
			error.message.includes("unauthorized") ||
			error.message.includes("authentication")
		) {
			return {
				message: i18n.t("common:error.auth"),
				type: "auth",
				status: 401,
				originalError: error,
			};
		}

		if (
			error.message.includes("500") ||
			error.message.includes("server error") ||
			error.message.includes("internal")
		) {
			return {
				message: i18n.t("common:error.server"),
				type: "server",
				status: 500,
				originalError: error,
			};
		}

		return {
			message: error.message || i18n.t("common:error.unexpected"),
			type: "unknown",
			originalError: error,
		};
	}

	return {
		message: i18n.t("common:error.unexpected"),
		type: "unknown",
	};
}

export function getCorsTroubleshootingSteps(): string[] {
	return [
		i18n.t("common:error.corsTroubleshooting.step0"),
		i18n.t("common:error.corsTroubleshooting.step1"),
		i18n.t("common:error.corsTroubleshooting.step2"),
		i18n.t("common:error.corsTroubleshooting.step3"),
		i18n.t("common:error.corsTroubleshooting.step4"),
	];
}

export function getNetworkTroubleshootingSteps(): string[] {
	return [
		i18n.t("common:error.networkTroubleshooting.step0"),
		i18n.t("common:error.networkTroubleshooting.step1"),
		i18n.t("common:error.networkTroubleshooting.step2"),
		i18n.t("common:error.networkTroubleshooting.step3"),
	];
}
