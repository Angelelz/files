require("dotenv").config();
const handler = require("serve-handler");
const jose = require("jose");

const setCookie = async (response) => {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const jwt = await new jose.SignJWT({
    jti: "something random",
    user: process.env.USER,
  })
    .setExpirationTime("1d")
    .setIssuedAt()
    .setIssuer("AngelelzFiles")
    .setAudience("All")
    .setProtectedHeader({ alg: "HS256" })
    .sign(secret);

  response.cookie("AngelelzFiles", jwt);
};
const getJWTUser = async (cookie) => {
  const fleetsCookie = cookie["AngelelzFiles"];
  if (!fleetsCookie) return null;

  const jwt = fleetsCookie;

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  try {
    const { payload } = await jose.jwtVerify(jwt, secret, {
      issuer: "AngelelzFiles",
      audience: "All",
    });
    return payload.user;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const publicRoutes = ["/login", "/logout"];

const authMiddleware = async (request, response, next) => {
  const user = await getJWTUser(request.cookies);
  if (
    !publicRoutes.includes(request.url) &&
    (!user || user !== process.env.USER)
  ) {
    return response.redirect(401, "/login");
  }
  return next();
};

module.exports = {
  authMiddleware,
  setCookie,
};
