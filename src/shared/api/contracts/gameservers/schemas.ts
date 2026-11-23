export type GameServerBaseEntity = {
  name: string;
  address: string;
  port: number;
  version: string | null;
  isOnline: boolean;
  online: number | null;
  maxOnline: number | null;
  /** Round-trip ms of the status request from the API host on the last check; null when offline/unknown. */
  ping: number | null;
};
