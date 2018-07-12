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

  test("check payment", () => {
    const result = api.checkPayment({
      OutSumm: 130,
      InvId: 155143,
      SignatureValue:
        "522c0ccb2057e063aa02a09338aee6993efab22ece796467689a96cab8cf83ea"
    });
    expect(result).toBeTruthy();
  });
  test("check payment with user params", () => {
    const result = api.checkPayment({
      OutSumm: 130,
      InvId: 155143,
      Shp_userId: 123,
      Shp_amount: 13,
      SignatureValue:
        "9b87defdafbf4b90e0aa5822274253c1203af97e7710984035394f301c208237"
    });
    expect(result).toBeTruthy();
  });
});
