const crypto = require("crypto");
const qs = require("query-string");
const apisauce = require("apisauce");
const parseXML = require("xml2js").parseString;

const defaultConfig = {
  baseURL: "https://auth.robokassa.ru/Merchant/WebService/Service.asmx",
  paymentURL: "https://auth.robokassa.ru/Merchant/Index.aspx",
  language: "en",
  merchantLogin: null,
  password1: null,
  password2: null,
  hashingMethod: "sha256",
  timeout: 10000
};

const create = (opts = defaultConfig) => {
  const options = Object.assign({}, defaultConfig, opts);
  if (opts.hashingMethod !== "sha256") {
    throw new Error("Sorry, robokassa.js supports SHA256 only hashes for now.");
  }
  if (!opts.merchantLogin || !opts.password1 || !opts.password2) {
    throw new Error(
      "Please provide merchantLogin, password1 and password2 to robokassa.js"
    );
  }

  const api = apisauce.create({
    baseURL: options.baseURL,
    timeout: options.timeout,
    headers: {
      Accept: "application/xml",
      "Content-Type": "text/plain"
    }
  });

  api.addRequestTransform(request => {
    const { params } = request;
    params.MerchantLogin = options.merchantLogin;
    params.Language = options.language;
    console.log(request);
  });

  api.addResponseTransform(response => {
    return new Promise((resolve, reject) => {
      parseXML(response.data, (err, result) => {
        if (err) return reject(err);
        response.data = result;
        resolve(response);
      });
    });
  });

  const calcHash = payload => {
    return crypto
      .createHash("sha256")
      .update(payload)
      .digest("hex");
  };

  /**
   * Generate payment URL
   * @param {number} amount Payment amount (in rubles)
   * @param {string} description Payment description
   * @param {any} invoiceID Invoice ID. If 0, then Robokassa will assign invoice ID automatically
   */
  const generatePaymentUrl = (amount, description, invoiceID = 0) => {
    const hash = calcHash(
      `${options.merchantLogin}:${amount}:${invoiceID}:${options.password1}`
    );
    const args = {
      MerchantLogin: options.merchantLogin,
      OutSum: amount,
      InvoiceID: invoiceID,
      Description: description,
      Language: options.language,
      SignatureValue: hash
    };
    return `${options.paymentURL}?${qs.stringify(args)}`;
  };

  /**
   * Get available currencies
   */
  const getCurrencies = () => api.get("/GetCurrencies");

  /**
   * Get available payment methods
   */
  const getPaymentMethods = () => api.get("/GetPaymentMethods");

  /**
   * Get full amount (wanted amount + ROBOKASSA charges)
   * @param {number} wantedAmount Wanted payment amount
   * @param {string} currencyLabel Currency code for which amount should be calculated
   */
  const getAmountPlusCharges = (wantedAmount, currencyLabel = null) =>
    api.get("/GetRates", {
      IncCurrLabel: currencyLabel,
      OutSum: wantedAmount
    });

  /**
   * Get amount minus charges (payable amount - ROBOKASSA charges)
   * @param {number} payableAmount Amount to pay by customer
   * @param {string} currencyLabel Currency code for which amount should be calculated
   */
  const getAmountMinusCharges = (payableAmount, currencyLabel = null) =>
    api.get("/CalcOutSumm", {
      IncCurrLabel: currencyLabel,
      IncSum: payableAmount
    });

  /**
   * Get status of payment
   * @param {any} invoiceID
   */
  const getPaymentStatus = invoiceID => {
    const hash = calcHash(`${options.merchantLogin}:${invoiceID}:${password2}`);
  };

  return {
    generatePaymentUrl,
    getCurrencies,
    getPaymentMethods,
    getAmountPlusCharges,
    getAmountMinusCharges,
    getPaymentStatus
  };
};

module.exports = {
  create
};
