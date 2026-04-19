import '@testing-library/jest-dom/vitest';
import { vi, beforeEach } from 'vitest';

// ── localStorage polyfill for jsdom ──────────────────────────────────────────
// jsdom's localStorage can be incomplete; provide a simple in-memory fallback.

const localStorageStore: Record<string, string> = {};

const localStorageMock: Storage = {
  getItem: (key: string) => localStorageStore[key] ?? null,
  setItem: (key: string, value: string) => { localStorageStore[key] = value; },
  removeItem: (key: string) => { delete localStorageStore[key]; },
  clear: () => { for (const k in localStorageStore) delete localStorageStore[k]; },
  get length() { return Object.keys(localStorageStore).length; },
  key: (index: number) => Object.keys(localStorageStore)[index] ?? null,
};

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

beforeEach(() => {
  localStorageMock.clear();
});

// ── Supabase mock ────────────────────────────────────────────────────────────
// A chainable query builder that returns configurable results.

interface MockResult {
  data: unknown;
  error: unknown;
}

let mockResult: MockResult = { data: [], error: null };

function createQueryBuilder() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const builder: any = {};
  const chainMethods = [
    'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike',
    'is', 'in', 'order', 'limit', 'range', 'maybeSingle',
  ];

  for (const method of chainMethods) {
    builder[method] = vi.fn(() => builder);
  }

  // single() is terminal — returns a promise with the result
  builder.single = vi.fn(() => Promise.resolve(mockResult));

  // Make the builder thenable so `await supabase.from(...).select(...)` works
  builder.then = function (
    resolve: (value: MockResult) => void,
    reject?: (reason: unknown) => void,
  ) {
    return Promise.resolve(mockResult).then(resolve, reject);
  };

  return builder;
}

const queryBuilder = createQueryBuilder();

const channelMock = {
  on: vi.fn(() => channelMock),
  subscribe: vi.fn(() => channelMock),
  unsubscribe: vi.fn(),
};

const rpcBuilder = createQueryBuilder();

export const supabaseMock = {
  from: vi.fn(() => queryBuilder),
  rpc: vi.fn(() => rpcBuilder),
  channel: vi.fn(() => channelMock),
  removeChannel: vi.fn(),
  __channelMock: channelMock,
};

/** Set the result that the next Supabase query will return */
export function setMockResult(result: Partial<MockResult>) {
  mockResult = { data: [], error: null, ...result };
}

/** Reset mock result to default (empty success) */
export function resetMockResult() {
  mockResult = { data: [], error: null };
}

vi.mock('../lib/supabase', () => ({
  supabase: supabaseMock,
}));
