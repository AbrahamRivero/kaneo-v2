import { config } from "dotenv-mono";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
	accountTableRelations,
	activityTableRelations,
	apikeyTableRelations,
	assetTableRelations,
	columnTableRelations,
	externalLinkTableRelations,
	githubIntegrationTableRelations,
	integrationTableRelations,
	invitationTableRelations,
	labelTableRelations,
	notificationTableRelations,
	projectTableRelations,
	recurringTaskTableRelations,
	sessionTableRelations,
	taskRelationTableRelations,
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
	recurringTaskTable,
	sessionTable,
	taskRelationTable,
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
	recurringTaskTable,
	sessionTable,
	taskRelationTable,
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
	workspaceTable,
	workspaceUserTable,
	accountTableRelations,
	assetTableRelations,
	activityTableRelations,
	apikeyTableRelations,
	columnTableRelations,
	externalLinkTableRelations,
	githubIntegrationTableRelations,
	integrationTableRelations,
	invitationTableRelations,
	labelTableRelations,
	notificationTableRelations,
	projectTableRelations,
	recurringTaskTableRelations,
	sessionTableRelations,
	taskRelationTableRelations,
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
