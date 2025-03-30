import { JwtPayload, UserInfo } from "../types";

export const mapJwtPayloadToUserInfo = (payload: JwtPayload): UserInfo => ({
  id: payload.sub,
  username: payload.username,
  roles: payload.roles,
});
