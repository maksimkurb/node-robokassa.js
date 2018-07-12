const robokassa = require("../index");
const util = require("util");

let api;

beforeEach(() => {
  api = robokassa.create({
    language: "ru",
    merchantLogin: "demo",
    password1: "pa$$1",
    password2: "pa$$2",
    hashingMethod: "sha256"
  });
});
afterEach(() => {
  api = null;
});

// TODO: improve tests
describe("basic methods", () => {
  test("get currencies", () => {
    return api.getCurrencies().then(currencies => {
      expect(currencies).toBeTruthy();
    });
  });
});
