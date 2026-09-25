const Database = require("@ndiinginc/dal");
const Store = require("../src/store");

const db = new Database({
    client: "better-sqlite3",
    connection: {
        database: "./test.db",
    },
});
const store = new Store(db, {});

describe("store", () => {
    beforeAll(async () => {
        await store.clear();
    });

    test("set key", async () => {
        const result = await store.set("accessToken", "asdf3214");
        expect(result.changes).toBe(1);
    });

    test("get existing key", async () => {
        const result = await store.get("accessToken");
        expect(result).toBe("asdf3214");
    });

    test("set another key", async () => {
        const result = await store.set("refreshToken", "asdf3214");
        expect(result.changes).toBe(1);
    });

    test("getAll", async () => {
        const result = await store.getAll();
        expect(result).toEqual({
            accessToken: "asdf3214",
            refreshToken: "asdf3214",
        });
    });

    test("has existing key", async () => {
        const result = await store.has("refreshToken");
        expect(result).toBe(true);
    });

    test("delete existing key", async () => {
        const result = await store.delete("refreshToken");
        expect(result.changes).toBe(1);
    });

    test("get non-existent key", async () => {
        const result = await store.get("refreshToken");
        expect(result).toBe(null);
    });

    test("has non-existent key", async () => {
        const result = await store.has("refreshToken");
        expect(result).toBe(false);
    });

    test("clear", async () => {
        const result = await store.clear();
        expect(result.changes).toBe(1);
    });

    test("getAll", async () => {
        const result = await store.getAll();
        expect(result).toEqual({});
    });

    test("set overwrite existing key", async () => {
        await store.set("token", "old");
        await store.set("token", "new");
        expect(await store.get("token")).toBe("new");
    });

    test("get non-existent key", async () => {
        expect(await store.get("nggakAda")).toBe(null);
    });

    test("delete non-existent key", async () => {
        const result = await store.delete("nggakAda");
        expect(result.changes).toBe(0);
    });

    test("scope isolation", async () => {
        const other = new Store(db, { apiId: "other", sessionId: "s1" });
        await store.set("key", "value1");
        await other.set("key", "value2");
        expect(await store.get("key")).toBe("value1");
        expect(await other.get("key")).toBe("value2");
    });
});
