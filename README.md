# @ndiinginc/store

Key-value store sederhana di atas [@ndiinginc/dal](https://www.npmjs.com/package/@ndiinginc/dal), dengan scoping otomatis berdasarkan `apiId` dan `sessionId`. Cocok untuk menyimpan session data, state, atau cache kecil per API/session di dalam tabel SQL.

Fitur:
- Auto-create table saat pertama kali dipakai (`ensureTable`)
- Data terisolasi per `apiId` + `sessionId`
- Operasi dasar: `get`, `set`, `has`, `delete`, `clear`, `getAll`
- Upsert otomatis lewat `onConflict(...).doUpdate()`

## Instalasi

```bash
npm install @ndiinginc/store
```

## Penggunaan

```js
const Store = require("@ndiinginc/store");
const db = require("@ndiinginc/dal")(/* konfigurasi db */);

const store = new Store(db, {
    tableName: "stores", // opsional, default "stores"
    apiId: "my-api",     // opsional, default "default"
    sessionId: "user-123" // opsional, default "default"
});

await store.set("token", "abc123");
console.log(await store.get("token")); // "abc123"
console.log(await store.has("token")); // true

await store.delete("token");
console.log(await store.has("token")); // false
```

## API

### `new Store(db, options)`

Membuat instance store baru.

| Parameter | Tipe | Default | Keterangan |
|---|---|---|---|
| `db` | `import("@ndiinginc/dal")` | — | Instance DAL yang sudah terkoneksi ke database |
| `options.tableName` | `String` | `"stores"` | Nama tabel yang dipakai/dibuat |
| `options.apiId` | `String` | `"default"` | Namespace berdasarkan API |
| `options.sessionId` | `String` | `"default"` | Namespace berdasarkan session |

### `store.set(name, value)`

Menyimpan atau memperbarui (upsert) sebuah key. Mengembalikan `Promise` hasil query insert/update.

```js
await store.set("theme", "dark");
```

### `store.get(name)`

Mengambil value dari sebuah key. Mengembalikan `Promise<any>` (value saja, bukan row lengkap), atau `undefined` jika tidak ditemukan.

```js
const theme = await store.get("theme");
```

### `store.has(name)`

Mengecek apakah sebuah key ada. Mengembalikan `Promise<Boolean>`.

```js
if (await store.has("theme")) { ... }
```

### `store.delete(name)`

Menghapus satu key spesifik dalam scope `apiId` + `sessionId` saat ini.

```js
await store.delete("theme");
```

### `store.clear()`

Menghapus **semua** key dalam scope `apiId` + `sessionId` saat ini (tidak memengaruhi `apiId`/`sessionId` lain).

```js
await store.clear();
```

### `store.getAll()`

Mengambil seluruh key-value dalam scope saat ini sebagai object biasa.

```js
const all = await store.getAll();
// { token: "abc123", theme: "dark" }
```

## Struktur Tabel

Tabel dibuat otomatis (jika belum ada) dengan skema berikut:

| Kolom | Tipe | Keterangan |
|---|---|---|
| `api_id` | `text`, `NOT NULL` | Bagian dari primary key |
| `session_id` | `text`, `NOT NULL` | Bagian dari primary key |
| `name` | `text`, `NOT NULL` | Bagian dari primary key (nama key) |
| `value` | `text` | Nilai yang disimpan |

Primary key: `(api_id, session_id, name)`
Index tambahan: `(api_id, session_id)`

> Catatan: pembuatan tabel otomatis (`_ensureTable`) berjalan setiap kali method dipanggil selama `ensureTable = true` (default). Set `store.ensureTable = false` setelah tabel dipastikan ada jika ingin menghindari overhead cek `exists()` di setiap call.

## Lisensi

ISC / sesuai kebijakan internal @ndiinginc.
