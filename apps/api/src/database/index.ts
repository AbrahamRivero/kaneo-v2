import { config } from "dotenv-mono";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
	accountTableRelations,
	activityTableRelations,
	apikeyTableRelations,
	assetTableRelations,
	columnTableRelations,
	deviceCodeTableRelations,
	externalLinkTableRelations,
	githubIntegrationTableRelations,
	integrationTableRelations,
	invitationTableRelations,
	labelTableRelations,
	notificationTableRelations,
	projectTableRelations,
	recurringTaskChecklistItemTableRelations,
	recurringTaskTableRelations,
	sessionTableRelations,
	taskRelationTableRelations,
	taskReminderSentTableRelations,
	taskTableRelations,
	teamMemberTableRelations,
	teamTableRelations,
	templateColumnTableRelations,
	templateTableRelations,
	templateTaskTableRelations,
	timeEntryTableRelations,
	userNotificationPreferenceTableRelations,
	userNotificationWorkspaceProjectTableRelations,
	userNotificationWorkspaceRuleTableRelations,
	userTableRelations,
	verificationTableRelations,
	workflowRuleTableRelations,
	workspaceFeatureTableRelations,
	workspaceRoleTableRelations,
	workspaceTableRelations,
	workspaceUserTableRelations,
} from "./relations";
import { resolveDatabaseConnectionString } from "./resolve-database-url";
import {
	accountTable,
	activityTable,
	apikeyTable,
	assetTable,
	columnTable,
	deviceCodeTable,
	externalLinkTable,
	githubIntegrationTable,
	integrationTable,
	invitationTable,
	labelTable,
	notificationTable,
	projectTable,
	recurringTaskChecklistItemTable,
	recurringTaskTable,
	sessionTable,
	taskRelationTable,
	taskReminderSentTable,
	taskTable,
	teamMemberTable,
	teamTable,
	templateColumnTable,
	templateTable,
	templateTaskTable,
	timeEntryTable,
	userNotificationPreferenceTable,
	userNotificationWorkspaceProjectTable,
	userNotificationWorkspaceRuleTable,
	userTable,
	verificationTable,
	workflowRuleTable,
	workspaceFeatureTable,
	workspaceRoleTable,
	workspaceTable,
	workspaceUserTable,
} from "./schema";

config();

export const schema = {
	accountTable,
	assetTable,
	activityTable,
	apikeyTable,
	columnTable,
	deviceCodeTable,
	externalLinkTable,
	githubIntegrationTable,
	integrationTable,
	invitationTable,
	labelTable,
	notificationTable,
	projectTable,
	recurringTaskChecklistItemTable,
	recurringTaskTable,
	sessionTable,
	taskRelationTable,
	taskReminderSentTable,
	taskTable,
	teamMemberTable,
	teamTable,
	templateColumnTable,
	templateTable,
	templateTaskTable,
	timeEntryTable,
	userNotificationPreferenceTable,
	userNotificationWorkspaceProjectTable,
	userNotificationWorkspaceRuleTable,
	userTable,
	verificationTable,
	workflowRuleTable,
	workspaceFeatureTable,
	workspaceRoleTable,
	workspaceTable,
	workspaceUserTable,
	accountTableRelations,
	assetTableRelations,
	activityTableRelations,
	apikeyTableRelations,
	columnTableRelations,
	deviceCodeTableRelations,
	externalLinkTableRelations,
	githubIntegrationTableRelations,
	integrationTableRelations,
	invitationTableRelations,
	labelTableRelations,
	notificationTableRelations,
	projectTableRelations,
	recurringTaskChecklistItemTableRelations,
	recurringTaskTableRelations,
	sessionTableRelations,
	taskRelationTableRelations,
	taskReminderSentTableRelations,
	taskTableRelations,
	teamMemberTableRelations,
	teamTableRelations,
	templateColumnTableRelations,
	templateTableRelations,
	templateTaskTableRelations,
	timeEntryTableRelations,
	userTableRelations,
	userNotificationPreferenceTableRelations,
	userNotificationWorkspaceProjectTableRelations,
	userNotificationWorkspaceRuleTableRelations,
	verificationTableRelations,
	workflowRuleTableRelations,
	workspaceFeatureTableRelations,
	workspaceRoleTableRelations,
	workspaceTableRelations,
	workspaceUserTableRelations,
};

type DatabaseInstance = ReturnType<typeof drizzle<typeof schema>>;

let pool: Pool | undefined;
let dbInstance: DatabaseInstance | undefined;

export function getDatabasePool(): Pool {
	if (!pool) {
		pool = new Pool({
			connectionString: resolveDatabaseConnectionString(),
			// Fail fast when Railway's internal network is slow rather than hanging
			// indefinitely and blocking every API request.
			connectionTimeoutMillis: 5_000,
			idleTimeoutMillis: 30_000,
			max: 10,
		});
	}

	return pool;
}

export function getDatabase(): DatabaseInstance {
	if (!dbInstance) {
		dbInstance = drizzle(getDatabasePool(), {
			schema,
		});
	}

	return dbInstance;
}

const db = new Proxy({} as DatabaseInstance, {
	get(_target, property, receiver) {
		const value = Reflect.get(getDatabase(), property, receiver);

		if (typeof value === "function") {
			return value.bind(getDatabase());
		}

		return value;
	},
});

export default db;
