import supabase from '../api/supabaseClient.js'

export async function fetchSavedLocations() {
  const { data, error } = await supabase
    .from('saved_locations')
    .select('*')
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function saveLocation(city_name, country_code, lat, lon) {
  const { data, error } = await supabase
    .from('saved_locations')
    .insert([{ city_name, country_code, lat, lon }])
    .select()

  return { data, error }
}

export async function deleteLocation(id) {
  const { data, error } = await supabase
    .from('saved_locations')
    .delete()
    .eq('id', id)
    .select()

  return { data, error }
}
