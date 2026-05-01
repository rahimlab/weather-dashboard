// TEST EVIDENCE TABLE
// ID     | Description                                                    | Input / Action                                              | Expected Output                                                     | Notes
// --------|----------------------------------------------------------------|-------------------------------------------------------------|---------------------------------------------------------------------|----------------------------------------------------------
// TC-I-08 | saveLocation calls insert with correct payload                 | saveLocation('London','GB',51.5,-0.12)                      | from('saved_locations').insert([{city_name,country_code,lat,lon}])  | Verifies the exact insert payload shape
// TC-I-09 | fetchSavedLocations calls select('*') and order                | fetchSavedLocations()                                       | from('saved_locations').select('*'); order called                   | order('created_at',{ascending:false}) also verified
// TC-I-10 | deleteLocation calls delete().eq('id', uuid)                   | deleteLocation('some-uuid')                                 | from('saved_locations').delete().eq('id','some-uuid')               | Verifies the delete + eq chain
// TC-I-11 | saveLocation returns { data, error: null } on success          | saveLocation resolves with data=[{id,...}]                  | { data: [{id:'abc',...}], error: null }                             | Happy-path return value shape
// TC-I-12 | saveLocation returns { data: null, error } when Supabase fails | insert rejects with an Error object                         | { data: null, error: <Error> }                                      | Error-path return value shape

import { vi, describe, it, expect, beforeEach } from 'vitest'

// hoist mock so it's accessible inside the vi.mock factory
const mockSupabase = vi.hoisted(() => ({ from: vi.fn() }))

vi.mock('../../src/api/supabaseClient.js', () => ({ default: mockSupabase }))

import {
  saveLocation,
  fetchSavedLocations,
  deleteLocation,
} from '../../src/hooks/useSavedLocations.js'

describe('Supabase client — integration (supabaseClient mocked with vi.mock)', () => {
  beforeEach(() => {
    mockSupabase.from.mockReset()
  })

  // ── saveLocation ─────────────────────────────────────────────────────────

  it('TC-I-08: saveLocation calls insert with the correct payload', async () => {
    const selectMock = vi.fn().mockResolvedValue({ data: [], error: null })
    const insertMock = vi.fn().mockReturnValue({ select: selectMock })
    mockSupabase.from.mockReturnValue({ insert: insertMock })

    await saveLocation('London', 'GB', 51.5, -0.12)

    expect(mockSupabase.from).toHaveBeenCalledWith('saved_locations')
    expect(insertMock).toHaveBeenCalledWith([
      { city_name: 'London', country_code: 'GB', lat: 51.5, lon: -0.12 },
    ])
    expect(selectMock).toHaveBeenCalled()
  })

  it('TC-I-11: saveLocation returns { data, error: null } on success', async () => {
    const fakeRow = { id: 'abc-123', city_name: 'London', country_code: 'GB', lat: 51.5, lon: -0.12 }
    const selectMock = vi.fn().mockResolvedValue({ data: [fakeRow], error: null })
    const insertMock = vi.fn().mockReturnValue({ select: selectMock })
    mockSupabase.from.mockReturnValue({ insert: insertMock })

    const result = await saveLocation('London', 'GB', 51.5, -0.12)

    expect(result.data).toEqual([fakeRow])
    expect(result.error).toBeNull()
  })

  it('TC-I-12: saveLocation returns { data: null, error } when Supabase returns an error', async () => {
    const dbError = new Error('duplicate key value')
    const selectMock = vi.fn().mockResolvedValue({ data: null, error: dbError })
    const insertMock = vi.fn().mockReturnValue({ select: selectMock })
    mockSupabase.from.mockReturnValue({ insert: insertMock })

    const result = await saveLocation('London', 'GB', 51.5, -0.12)

    expect(result.data).toBeNull()
    expect(result.error).toBe(dbError)
  })

  // ── fetchSavedLocations ───────────────────────────────────────────────────

  it('TC-I-09: fetchSavedLocations calls select("*") and order on saved_locations', async () => {
    const orderMock = vi.fn().mockResolvedValue({ data: [], error: null })
    const selectMock = vi.fn().mockReturnValue({ order: orderMock })
    mockSupabase.from.mockReturnValue({ select: selectMock })

    await fetchSavedLocations()

    expect(mockSupabase.from).toHaveBeenCalledWith('saved_locations')
    expect(selectMock).toHaveBeenCalledWith('*')
    expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  // ── deleteLocation ────────────────────────────────────────────────────────

  it('TC-I-10: deleteLocation calls delete().eq("id", uuid) on saved_locations', async () => {
    const selectMock = vi.fn().mockResolvedValue({ data: [], error: null })
    const eqMock = vi.fn().mockReturnValue({ select: selectMock })
    const deleteMock = vi.fn().mockReturnValue({ eq: eqMock })
    mockSupabase.from.mockReturnValue({ delete: deleteMock })

    await deleteLocation('some-uuid')

    expect(mockSupabase.from).toHaveBeenCalledWith('saved_locations')
    expect(deleteMock).toHaveBeenCalled()
    expect(eqMock).toHaveBeenCalledWith('id', 'some-uuid')
    expect(selectMock).toHaveBeenCalled()
  })
})
