import type { Migration } from '../migrations';

import { migration as migration001 } from './001_initial_schema';
import { migration as migration002 } from './002_beacon_enr_p2p_nullable_endpoint';
import { migration as migration003 } from './003_token_requests';
import { migration as migration004 } from './004_sponsors_partners_contributors';
import { migration as migration005 } from './005_add_csrf_token_to_sessions';

/**
 * All available migrations in order.
 * New migrations should be added to this array.
 */
export const migrations: Migration[] = [
  migration001,
  migration002,
  migration003,
  migration004,
  migration005,
];
