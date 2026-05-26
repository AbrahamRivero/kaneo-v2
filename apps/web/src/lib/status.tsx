import i18n from "i18next";
import { CheckCircle2, Clock } from "lucide-react";

export function getStatusIcon(status: "active" | "pending") {
	switch (status) {
		case "active":
			return <CheckCircle2 className="h-4 w-4 text-success-foreground" />;
		case "pending":
			return <Clock className="h-4 w-4 text-warning-foreground" />;
	}
}

export function getStatusText(status: "active" | "pending") {
	switch (status) {
		case "active":
			return i18n.t("common:status.active");
		case "pending":
			return i18n.t("common:status.pending");
	}
}
