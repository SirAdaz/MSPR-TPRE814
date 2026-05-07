describe("countryApiMap", () => {
  it("contains supported country endpoints", () => {
    jest.resetModules();
    const { countryApiMap } = require("@/lib/countries");
    expect(countryApiMap.BR).toBeTruthy();
    expect(countryApiMap.EC).toBeTruthy();
    expect(countryApiMap.CO).toBeTruthy();
  });

  it("uses explicit backend env urls when provided", () => {
    const previousBr = process.env.BACKEND_BR_URL;
    const previousEc = process.env.BACKEND_EC_URL;
    const previousCo = process.env.BACKEND_CO_URL;

    process.env.BACKEND_BR_URL = "http://br.custom:8000";
    process.env.BACKEND_EC_URL = "http://ec.custom:8000";
    process.env.BACKEND_CO_URL = "http://co.custom:8000";

    jest.resetModules();
    jest.isolateModules(() => {
      const { countryApiMap } = require("@/lib/countries");
      expect(countryApiMap.BR).toBe("http://br.custom:8000");
      expect(countryApiMap.EC).toBe("http://ec.custom:8000");
      expect(countryApiMap.CO).toBe("http://co.custom:8000");
    });

    process.env.BACKEND_BR_URL = previousBr;
    process.env.BACKEND_EC_URL = previousEc;
    process.env.BACKEND_CO_URL = previousCo;
  });

  it("uses backend fallback urls when env is missing", () => {
    const previousBr = process.env.BACKEND_BR_URL;
    const previousEc = process.env.BACKEND_EC_URL;
    const previousCo = process.env.BACKEND_CO_URL;

    delete process.env.BACKEND_BR_URL;
    delete process.env.BACKEND_EC_URL;
    delete process.env.BACKEND_CO_URL;

    jest.resetModules();
    jest.isolateModules(() => {
      const { countryApiMap } = require("@/lib/countries");
      expect(countryApiMap.BR).toBe("http://backend-br:8000");
      expect(countryApiMap.EC).toBe("http://backend-ec:8000");
      expect(countryApiMap.CO).toBe("http://backend-co:8000");
    });

    process.env.BACKEND_BR_URL = previousBr;
    process.env.BACKEND_EC_URL = previousEc;
    process.env.BACKEND_CO_URL = previousCo;
  });
});
