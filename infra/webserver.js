function getOrigin() {
  if (["test", "development"].includes(process.env.NODE_ENV)) {
    return "http//localhost:3000";
  }

  if (process.env.VERCEL_ENV === "preview") {
    return `http//${process.env.VERCEL_ENV}`;
  }

  return "https://xedit.com.br";
}

const webServer = {
  origin: getOrigin(),
};

export default webServer;
