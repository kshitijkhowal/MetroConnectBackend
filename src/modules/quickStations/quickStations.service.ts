import { supabaseAdmin } from '../../lib/supabase.js';
import { ApiError } from '../../utils/ApiError.js';
import type {
  CreateQuickStationInput,
  QuickStation,
  QuickStationRow,
  UpdateQuickStationInput,
} from './quickStations.types.js';

function mapQuickStation(row: QuickStationRow): QuickStation {
  return {
    id: row.id,
    stationId: row.station_id,
    stationName: row.station_name,
    nickname: row.nickname,
    icon: row.icon,
    iconColor: row.icon_color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listQuickStations(userId: string): Promise<QuickStation[]> {
  const { data, error } = await supabaseAdmin
    .from('quick_stations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new ApiError(500, error.message, 'QUICK_STATIONS_FETCH_FAILED');
  }

  return (data ?? []).map((row) => mapQuickStation(row as QuickStationRow));
}

export async function getQuickStationById(id: string, userId: string): Promise<QuickStation> {
  const { data, error } = await supabaseAdmin
    .from('quick_stations')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, error.message, 'QUICK_STATION_FETCH_FAILED');
  }

  if (!data) {
    throw new ApiError(404, 'Quick station not found', 'QUICK_STATION_NOT_FOUND');
  }

  return mapQuickStation(data as QuickStationRow);
}

export async function createQuickStation(
  userId: string,
  input: CreateQuickStationInput,
): Promise<QuickStation> {
  const { data, error } = await supabaseAdmin
    .from('quick_stations')
    .insert({
      id: input.id,
      user_id: userId,
      station_id: input.stationId,
      station_name: input.stationName,
      nickname: input.nickname,
      icon: input.icon,
      icon_color: input.iconColor,
    })
    .select('*')
    .single();

  if (error) {
    throw new ApiError(500, error.message, 'QUICK_STATION_CREATE_FAILED');
  }

  return mapQuickStation(data as QuickStationRow);
}

export async function updateQuickStation(
  id: string,
  userId: string,
  input: UpdateQuickStationInput,
): Promise<{ station: QuickStation } | { conflict: QuickStation }> {
  const current = await getQuickStationById(id, userId);

  if (new Date(current.updatedAt).getTime() > new Date(input.updatedAt).getTime()) {
    return { conflict: current };
  }

  const { data, error } = await supabaseAdmin
    .from('quick_stations')
    .update({
      station_id: input.stationId,
      station_name: input.stationName,
      nickname: input.nickname,
      icon: input.icon,
      icon_color: input.iconColor,
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) {
    throw new ApiError(500, error.message, 'QUICK_STATION_UPDATE_FAILED');
  }

  return { station: mapQuickStation(data as QuickStationRow) };
}

export async function deleteQuickStation(id: string, userId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('quick_stations')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw new ApiError(500, error.message, 'QUICK_STATION_DELETE_FAILED');
  }
}
