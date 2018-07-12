const robokassa = require("../index");

test("payment url is generated correctly", () => {
  const api = robokassa.create({
    language: "ru",
    merchantLogin: "demo",
    password1: "pa$$1",
    password2: "pa$$2",
    hashingMethod: "sha256"
  });
  const url = api.generatePaymentUrl(156, "Test payment. Buy 'em all!");
  expect(url).toBe(
    "https://auth.robokassa.ru/Merchant/Index.aspx?Description=Test%20payment.%20Buy%20%27em%20all%21&InvoiceID=0&Language=ru&MerchantLogin=demo&OutSum=156&SignatureValue=ee90014685ca3fb72c53ee1fbe3a262e7a5430276aae9b0bea9a7caa06180a40"
  );
});
