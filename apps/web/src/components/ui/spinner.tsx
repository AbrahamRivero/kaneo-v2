import i18n from "i18next";
import { Loader2Icon } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/cn";

export function Spinner({
	className,
	...props
}: React.ComponentProps<typeof Loader2Icon>): React.ReactElement {
	return (
		<Loader2Icon
			aria-label={i18n.t("common:spinner.loading")}
			className={cn("animate-spin", className)}
			role="status"
			{...props}
		/>
	);
}
