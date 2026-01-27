import { JwtPayload, sign, verify } from "jsonwebtoken";
import configServer from "../config/configServer.config";

export interface TokenTypes {
  id: string
  name: string 
  lastname: string
  email: string
  phone: string 
  rol: string
  billing_state: string
}

class JwtManagement {
  private JWT_SECRET = configServer.jwt.secret_key;
  private EXPIRES_IN: any = configServer.jwt.expiration;

  public generateToken = async (tokenTypes: TokenTypes): Promise<string> => {
    const jwt = sign(tokenTypes, this.JWT_SECRET, {
      expiresIn: this.EXPIRES_IN,
    });
    return jwt;
  };

  public compareToken = async (jwt: string): Promise<string | JwtPayload> => {
    const isOk = verify(jwt, this.JWT_SECRET);
    return isOk;
  };
}

const jwtManagement = new JwtManagement();
export default jwtManagement;
