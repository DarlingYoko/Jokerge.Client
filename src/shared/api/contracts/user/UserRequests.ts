import { ApiUserBaseEntity, PlayerBaseEntity, UserBaseEntity } from '@/shared/api/contracts';
import { ResponseBaseEntity } from '@/shared/api/schemas';

// Регистрация
export type TPostSignUpRequest = {
  login: string;
  password: string;
  email: string;
};
export type TPostSignUpResponse = ResponseBaseEntity & {
  data: UserBaseEntity & {
    // accessToken/refreshToken arrive as httpOnly cookies, not in the body — profile carries
    // the same claims as plain JSON so the client can read them without decoding a JWT.
    profile: ApiUserBaseEntity;
  };
};

// Авторизация
export type ApiPostSignInRequest = {
  login: string;
  password: string;
};
export type ApiPostSignInResponse = ResponseBaseEntity & {
  data: {
    expiresIn: number;
    profile: ApiUserBaseEntity;
  };
};

// Игроки
export type TGetPlayersRequest = {
  take: number;
  offset: number;
  findName?: string;
  findUuid?: string;
  findIp?: string;
  findHwid?: string;
  onlyBlocked?: boolean;
  onlyDeviceBlocked?: boolean;
  sortBy?: 0 | 1 | 2;
  sortDesc?: boolean;
};
export type TGetPlayersResponse = ResponseBaseEntity & {
  data: PlayerBaseEntity[];
};

// Бан юзера
export type TPostBanPlayersRequest = string[];
export type TPostBanPlayersOptions = { deviceBlock?: boolean };
export type TPostBanPlayersResponse = ResponseBaseEntity & {};

// Разбан юзера
export type TPostPardonPlayersOptions = { deviceUnblock?: boolean };

// Удаление юзера
export type TPostRemovePlayersRequest = string[];
export type TPostRemovePlayersResponse = ResponseBaseEntity & {};
