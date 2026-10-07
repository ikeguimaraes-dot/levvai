import test from 'node:test';
import assert from 'node:assert/strict';
import { requireUser } from '../api/_auth.js';
import adminUsers from '../api/admin-users.js';

process.env.VITE_SUPABASE_URL = 'https://isolated-test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-public-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
const adminId = '00000000-0000-4000-8000-000000000001';
const otherId = '00000000-0000-4000-8000-000000000002';
const reply = () => ({ code: 200, status(code) { this.code = code; return this; }, json(value) { this.value = value; return this; } });
const request = (method = 'GET', body = {}) => ({ method, body, headers: { authorization: 'Bearer test-token' } });

function mockFetch(t, { member = true, email = 'ikeguimaraes@gmail.com', anonymous = false, managed = false, targetMember = true, unavailable = false } = {}) {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (input, options = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url);
    const method = options.method || 'GET';
    calls.push({ path: url.pathname, query: url.search, method });
    const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
    if (url.pathname === '/auth/v1/user') return json({ id: adminId, email, is_anonymous: anonymous, app_metadata: { portal_access: true } });
    if (url.pathname === '/rest/v1/levvai_members') {
      if (unavailable) return json({ message: 'Unavailable' }, 503);
      if (method === 'DELETE') return new Response(null, { status: 204 });
      const id = url.searchParams.get('user_id')?.replace('eq.', '');
      if (id === adminId) return json(member ? [{ user_id: adminId }] : []);
      if (id === otherId) return json(targetMember ? [{ user_id: otherId, managed_auth: managed }] : []);
      return json([{ user_id: otherId, managed_auth: managed }]);
    }
    if (url.pathname === `/auth/v1/admin/users/${otherId}`) return json({ id: otherId, email: 'staff@example.com', user_metadata: { nome: 'Staff' } });
    throw new Error(`Unexpected request: ${method} ${url.pathname}`);
  });
  return calls;
}

test('missing token is rejected before any network request', async t => {
  const calls = mockFetch(t);
  const res = reply();
  assert.equal(await requireUser({ headers: {} }, res), null);
  assert.equal(res.code, 401);
  assert.equal(calls.length, 0);
});
test('email allowlist and legacy metadata cannot bypass membership', async t => {
  mockFetch(t, { member: false });
  const res = reply();
  assert.equal(await requireUser(request(), res), null);
  assert.equal(res.code, 403);
});
test('anonymous auth users are rejected', async t => {
  mockFetch(t, { anonymous: true });
  const res = reply();
  assert.equal(await requireUser(request(), res), null);
  assert.equal(res.code, 401);
});
test('membership service failure fails closed', async t => {
  mockFetch(t, { unavailable: true });
  const res = reply();
  assert.equal(await requireUser(request(), res), null);
  assert.equal(res.code, 503);
});
test('a migrated staff member can enter but cannot administer', async t => {
  mockFetch(t, { email: 'staff@example.com' });
  assert.equal((await requireUser(request(), reply())).id, adminId);
  const res = reply();
  assert.equal(await requireUser(request(), res, { admin: true }), null);
  assert.equal(res.code, 403);
});
test('admin listing only fetches explicit Levvai members', async t => {
  const calls = mockFetch(t);
  const res = reply();
  await adminUsers(request(), res);
  assert.equal(res.code, 200);
  assert.deepEqual(res.value.users.map(u => u.id), [otherId]);
  assert.ok(!calls.some(c => c.path === '/auth/v1/admin/users'));
});
test('shared HOS account cannot be edited', async t => {
  const calls = mockFetch(t, { managed: false });
  const res = reply();
  await adminUsers(request('PATCH', { userId: otherId, password: 'should-not-be-written' }), res);
  assert.equal(res.code, 409);
  assert.ok(calls.every(c => c.method === 'GET'));
});
test('foreign account cannot be edited or removed', async t => {
  const calls = mockFetch(t, { targetMember: false });
  for (const method of ['PATCH', 'DELETE']) {
    const res = reply();
    await adminUsers(request(method, { userId: otherId }), res);
    assert.equal(res.code, 404);
  }
  assert.ok(calls.every(c => c.method === 'GET'));
});
test('removal revokes membership but never deletes Auth account', async t => {
  const calls = mockFetch(t);
  const res = reply();
  await adminUsers(request('DELETE', { userId: otherId }), res);
  assert.equal(res.code, 200);
  assert.deepEqual(calls.filter(c => c.method === 'DELETE').map(c => c.path), ['/rest/v1/levvai_members']);
});
