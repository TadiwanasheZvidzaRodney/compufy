import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const db = new PGlite();
await db.exec(`
  CREATE ROLE anon;
  CREATE ROLE authenticated;
  CREATE ROLE service_role;
  CREATE SCHEMA auth;
  CREATE SCHEMA storage;
  GRANT USAGE ON SCHEMA public, auth, storage TO anon, authenticated, service_role;
  CREATE TABLE auth.users(id uuid PRIMARY KEY, email text, raw_user_meta_data jsonb DEFAULT '{}');
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE SQL STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  CREATE TABLE storage.buckets(id text PRIMARY KEY, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  CREATE TABLE storage.objects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), bucket_id text);
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
`);
const migrations = [
  "20260708212550_bca48c3e-b1f0-41f3-bf42-8c3293dc177b.sql",
  "20260708212559_b32ab259-c029-48a4-8265-897c3c3ec0bb.sql",
  "20260708212907_394c86b2-bc00-427b-ba06-7382e1eca1b9.sql",
  "20261117090000_compufy_catalogue.sql",
];
for (const name of migrations) await db.exec(await readFile(`${process.cwd()}/supabase/migrations/${name}`,"utf8"));
console.log("PASS: all migrations execute in order");
const admin = "00000000-0000-4000-8000-000000000001";
const staff = "00000000-0000-4000-8000-000000000002";
const live = "10000000-0000-4000-8000-000000000001";
const draft = "10000000-0000-4000-8000-000000000002";
await db.exec(`
  INSERT INTO auth.users(id,email) VALUES ('${admin}','admin@example.com'), ('${staff}','staff@example.com');
  INSERT INTO public.user_roles(user_id,role) VALUES ('${admin}','admin'),('${staff}','finance');
  INSERT INTO public.products(id,title,slug,published) VALUES ('${live}','Published device','published-device',true),('${draft}','Draft device','draft-device',false);
  SET ROLE anon;
`);
assert.equal((await db.query("select * from products")).rows.length,1);
console.log("PASS: anonymous visitors see published products only");
await assert.rejects(db.query("select * from inquiries"));
await assert.rejects(db.query("insert into products(title,slug) values ('Bad','bad')"));
await db.query("insert into inquiries(name,email,message,product_id) values ('Test','test@example.com','Quote please',$1)",[live]);
await assert.rejects(db.query("insert into inquiries(name,email,message,product_id) values ('Test','test@example.com','Draft quote',$1)",[draft]));
await assert.rejects(db.query("insert into inquiries(name,email,message,status) values ('Test','test@example.com','Bad','resolved')"));
console.log("PASS: anonymous submissions succeed; reads, inventory writes, draft inquiries and status injection are blocked");
await db.exec(`RESET ROLE; SET ROLE authenticated; SET request.jwt.claim.sub = '${staff}';`);
assert.equal((await db.query("select * from products")).rows.length,1);
assert.equal((await db.query("select * from inquiries")).rows.length,0);
await assert.rejects(db.query("insert into products(title,slug) values ('Bad','bad')"));
console.log("PASS: non-admin staff cannot access private inquiries or manage products");
await db.exec(`SET request.jwt.claim.sub = '${admin}';`);
assert.equal((await db.query("select * from products")).rows.length,2);
assert.equal((await db.query("select * from inquiries")).rows.length,1);
await db.query("update products set price = 250, published = true where id = $1",[draft]);
assert.equal((await db.query("select price from products where id = $1",[draft])).rows[0].price, "250.00");
await db.query("update inquiries set status = 'quoted'");
assert.equal((await db.query("select status from inquiries")).rows[0].status,"quoted");
await db.query("delete from products where id = $1",[live]);
assert.equal((await db.query("select product_id from inquiries")).rows[0].product_id,null);
console.log("PASS: admin CRUD and inquiry workflow work; deletion preserves inquiry history");
await assert.rejects(db.query("insert into products(title,slug,price) values ('Negative','negative',-1)"));
await assert.rejects(db.query("insert into products(title,slug,stock_status) values ('Invalid','invalid','invalid')"));
console.log("PASS: database rejects invalid prices and stock status");
await db.close();
