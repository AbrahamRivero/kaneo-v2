import { windowId } from "@kaneo/libs";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { getApiUrl } from "@/fetchers/get-api-url";
import { authClient } from "@/lib/auth-client";

export function getWsUrl(projectId: string) {
	const base = getApiUrl("ws");
	const wsBase = base.replace(/^http/, "ws");
	return `${wsBase}/${encodeURIComponent(projectId)}?windowId=${encodeURIComponent(windowId)}`;
}

const MAX_RETRIES = 5;
const BASE_DELAY = 1000;

export function useProjectWebSocket(projectId: string) {
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();
	const wsRef = useRef<WebSocket | null>(null);
	const retriesRef = useRef(0);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const instanceIdRef = useRef(0);

	useEffect(() => {
		if (!projectId || !session?.user?.id) return;

		retriesRef.current = 0;
		const currentInstance = ++instanceIdRef.current;

		function connect() {
			if (currentInstance !== instanceIdRef.current) return;

			const url = getWsUrl(projectId);
			const ws = new WebSocket(url);
			wsRef.current = ws;

			ws.onopen = () => {
				if (currentInstance !== instanceIdRef.current) {
					ws.close();
					return;
				}
				retriesRef.current = 0;
			};

			ws.onmessage = (event) => {
				if (currentInstance !== instanceIdRef.current) return;

				try {
					const message = JSON.parse(event.data);
					if (
						message.type === "TASK_UPDATED" ||
						message.type === "TASK_CREATED" ||
						message.type === "TASK_DELETED" ||
						message.type === "TASK_LABEL_UPDATED" ||
						message.type === "TASK_MOVED" ||
						message.type === "TASK_RELATION_UPDATED" ||
						message.type === "COMMENT_UPDATED"
					) {
						queryClient.invalidateQueries({
							queryKey: ["tasks", message.projectId],
						});

						if (message.type === "TASK_RELATION_UPDATED") {
							if (message.sourceTaskId) {
								queryClient.invalidateQueries({
									queryKey: ["task", message.sourceTaskId],
								});
								queryClient.invalidateQueries({
									queryKey: ["task-relations", message.sourceTaskId],
								});
							}
							if (message.targetTaskId) {
								queryClient.invalidateQueries({
									queryKey: ["task", message.targetTaskId],
								});
								queryClient.invalidateQueries({
									queryKey: ["task-relations", message.targetTaskId],
								});
							}
							if (!message.sourceTaskId && !message.targetTaskId) {
								queryClient.invalidateQueries({
									queryKey: ["task-relations"],
								});
							}
						} else {
							queryClient.invalidateQueries({
								queryKey: ["task", message.taskId],
							});
						}

						if (message.type === "TASK_LABEL_UPDATED") {
							queryClient.invalidateQueries({
								queryKey: ["labels", message.taskId],
							});
						}

						if (message.type === "COMMENT_UPDATED") {
							queryClient.invalidateQueries({
								queryKey: ["activities", message.taskId],
							});
							queryClient.invalidateQueries({
								queryKey: ["comments", message.taskId],
							});
						}
					}
				} catch {
					// Ignore malformed messages
				}
			};

			ws.onerror = () => {
				// Browser WebSocket errors are expected during unmount/cleanup
			};

			ws.onclose = () => {
				if (currentInstance !== instanceIdRef.current) return;
				wsRef.current = null;

				if (retriesRef.current < MAX_RETRIES) {
					const delay = BASE_DELAY * 2 ** retriesRef.current;
					retriesRef.current += 1;
					timeoutRef.current = setTimeout(connect, delay);
				}
			};
		}
		connect();

		return () => {
			instanceIdRef.current = MAX_RETRIES;
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			if (wsRef.current) {
				const ws = wsRef.current;
				if (ws.readyState === 1) {
					ws.close();
				}
				wsRef.current = null;
			}
		};
	}, [projectId, session?.user?.id, queryClient]);
}
