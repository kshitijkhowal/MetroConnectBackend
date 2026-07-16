export type QuickStationRow = {
  id: string;
  user_id: string;
  station_id: number;
  station_name: string;
  nickname: string;
  icon: string;
  icon_color: string;
  created_at: string;
  updated_at: string;
};

export type QuickStation = {
  id: string;
  stationId: number;
  stationName: string;
  nickname: string;
  icon: string;
  iconColor: string;
  createdAt: string;
  updatedAt: string;
};

export type QuickStationResponse = {
  station: QuickStation;
};

export type QuickStationsResponse = {
  stations: QuickStation[];
};

export type CreateQuickStationInput = {
  id: string;
  stationId: number;
  stationName: string;
  nickname: string;
  icon: string;
  iconColor: string;
};

export type UpdateQuickStationInput = {
  stationId: number;
  stationName: string;
  nickname: string;
  icon: string;
  iconColor: string;
  updatedAt: string;
};
