import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://syfgrjcabeoddvnoiuod.supabase.co'
const supabaseKey = 'sb_publishable_bd--c9MygvAXbhkajsHfuQ_Sa8ogsMM'

export const supabase = createClient(supabaseUrl, supabaseKey)
