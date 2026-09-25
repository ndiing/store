/**
 * @typedef {Object} Options
 * @property {String} [tableName=stores]
 * @property {String} [apiId=default]
 * @property {String} [sessionId=default]
 */

class Store {
    /**@type {import("@ndiinginc/dal")}*/
    db = null;
    tableName = null;
    apiId = null;
    sessionId = null;
    ensureTable = true;

    /**
     * @param {import("@ndiinginc/dal")} db
     * @param {Options} options
     */
    constructor(db, options = {}) {
        this.db = db;
        this.tableName = options.tableName ?? "stores";
        this.apiId = options.apiId ?? "default";
        this.sessionId = options.sessionId ?? "default";
    }

    async _ensureTable(db) {
        const exists = await db
            .query()
            .select()
            .from("sqlite_master")
            .where("type", "table")
            .where("name", this.tableName)
            .exists();
        if (exists) {
            return;
        }

        await db.schema().createTable(this.tableName, (table) => {
            table.column("api_id").text().notNull();
            table.column("session_id").text().notNull();
            table.column("name").text().notNull();
            table.column("value").text();

            table.primaryKey("api_id", "session_id", "name");
            table.index().on("api_id", "session_id");
        });
    }

    async clear() {
        if (this.ensureTable) await this._ensureTable(this.db);

        return await this.db
            .query()
            .delete(this.tableName)
            .where("api_id", this.apiId)
            .where("session_id", this.sessionId);
    }

    async delete(name) {
        if (this.ensureTable) await this._ensureTable(this.db);

        return await this.db
            .query()
            .delete(this.tableName)
            .where("api_id", this.apiId)
            .where("session_id", this.sessionId)
            .where("name", name);
    }

    async get(name) {
        if (this.ensureTable) await this._ensureTable(this.db);

        return await this.db
            .query()
            .select()
            .from(this.tableName)
            .where("api_id", this.apiId)
            .where("session_id", this.sessionId)
            .where("name", name)
            .first("value");
    }

    async has(name) {
        if (this.ensureTable) await this._ensureTable(this.db);

        return await this.db
            .query()
            .select()
            .from(this.tableName)
            .where("api_id", this.apiId)
            .where("session_id", this.sessionId)
            .where("name", name)
            .exists();
    }

    async set(name, value) {
        if (this.ensureTable) await this._ensureTable(this.db);

        return await this.db
            .query()
            .insert(this.tableName, {
                api_id: this.apiId,
                session_id: this.sessionId,
                name,
                value,
            })
            .onConflict("api_id", "session_id", "name")
            .doUpdate();
    }

    async getAll() {
        if (this.ensureTable) await this._ensureTable(this.db);

        const rows = await this.db
            .query()
            .select()
            .from(this.tableName)
            .where("api_id", this.apiId)
            .where("session_id", this.sessionId);

        return Object.fromEntries(rows.map(({ name, value }) => [name, value]));
    }
}

module.exports = Store;
