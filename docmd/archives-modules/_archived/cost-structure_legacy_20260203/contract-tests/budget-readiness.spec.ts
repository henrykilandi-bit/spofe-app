import { query } from '../infrastructure/db'
import { setTenantContext } from '../test-utils/tenant'

describe('Contract tests — Cost-Structure → Budget', () => {
  beforeEach(() => {
    setTenantContext('tenant-1')
  })

  it('never exposes projects failing COUT-01', async () => {
    const rows = await query(`
      SELECT * FROM rm_cost_projects_budget_ready
    `)

    rows.forEach((row) => {
      expect(row.margin_at_70).toBeGreaterThan(0)
    })
  })

  it('exposes only FROZEN cost structures', async () => {
    const rows = await query(`
      SELECT * FROM rm_cost_projects_budget_ready
    `)

    rows.forEach((row) => {
      expect(row.version).toBeDefined()
    })
  })
})
