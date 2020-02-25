"use strict";

import axios from "axios";
import Url from "url-parse";

/**
 * WooCommerce REST API wrapper
 *
 * @param {Object} opt
 */
export default class WooCommerceRestApi {
  /**
   * Class constructor.
   *
   * @param {Object} opt
   */
  constructor(opt) {
    if (!(this instanceof WooCommerceRestApi)) {
      return new WooCommerceRestApi(opt);
    }

    opt = opt || {};

    if (!opt.url) {
      throw new OptionsException("url is required");
    }

    if (!opt.jwtToken) {
      throw new OptionsException("jwtToken is required");
    }

    this.classVersion = "1.0.1";
    this._setDefaultsOptions(opt);
  }

  /**
   * Set default options
   *
   * @param {Object} opt
   */
  _setDefaultsOptions(opt) {
    this.url = opt.url;
    this.wpAPIPrefix = opt.wpAPIPrefix || "wp-json";
    this.version = opt.version || "wc/v3";
    this.jwtToken = opt.jwtToken;
    this.encoding = opt.encoding || "utf8";
    this.port = opt.port || "";
    this.timeout = opt.timeout;
    this.axiosConfig = opt.axiosConfig || {};
  }

  /**
   * Parse params object.
   *
   * @param {Object} params
   * @param {Object} query
   */
  _parseParamsObject(params, query) {
    for (const key in params) {
      const value = params[key];

      if (typeof value === "object") {
        for (const prop in value) {
          const itemKey = key.toString() + "[" + prop.toString() + "]";
          query[itemKey] = value[prop];
        }
      } else {
        query[key] = value;
      }
    }

    return query;
  }

  /**
   * Get URL
   *
   * @param  {String} endpoint
   * @param  {Object} params
   *
   * @return {String}
   */
  _getUrl(endpoint, params) {
    const api = this.wpAPIPrefix + "/";

    let url = this.url.slice(-1) === "/" ? this.url : this.url + "/";

    url = url + api + this.version + "/" + endpoint;

    // Include port.
    if (this.port !== "") {
      const hostname = new Url(url).hostname;

      url = url.replace(hostname, hostname + ":" + this.port);
    }

    return url;
  }


  /**
   * Do requests
   *
   * @param  {String} method
   * @param  {String} endpoint
   * @param  {Object} data
   * @param  {Object} params
   *
   * @return {Object}
   */
  _request(method, endpoint, data, params = {}) {
    const url = this._getUrl(endpoint, params);

    const headers = {
      Accept: "application/json"
    };
    // only set "User-Agent" in node environment
    // the checking method is identical to upstream axios
    if (
      typeof process !== "undefined" &&
      Object.prototype.toString.call(process) === "[object process]"
    ) {
      headers["User-Agent"] =
        "WooCommerce REST API - JS Client/" + this.classVersion;
    }

    let options = {
      url: url,
      method: method,
      responseEncoding: this.encoding,
      timeout: this.timeout,
      responseType: "json",
      headers
    };

    // Set the authorization header
    headers["Authorization"] = `Bearer ${this.jwtToken}`

    options.params = { ...options.params, ...params };

    if (data) {
      options.headers["Content-Type"] = "application/json;charset=utf-8";
      options.data = JSON.stringify(data);
    }

    // Allow set and override Axios options.
    options = { ...options, ...this.axiosConfig };

    return axios(options);
  }

  /**
   * GET requests
   *
   * @param  {String} endpoint
   * @param  {Object} params
   *
   * @return {Object}
   */
  get(endpoint, params = {}) {
    return this._request("get", endpoint, null, params);
  }

  /**
   * POST requests
   *
   * @param  {String} endpoint
   * @param  {Object} data
   * @param  {Object} params
   *
   * @return {Object}
   */
  post(endpoint, data, params = {}) {
    return this._request("post", endpoint, data, params);
  }

  /**
   * PUT requests
   *
   * @param  {String} endpoint
   * @param  {Object} data
   * @param  {Object} params
   *
   * @return {Object}
   */
  put(endpoint, data, params = {}) {
    return this._request("put", endpoint, data, params);
  }

  /**
   * DELETE requests
   *
   * @param  {String} endpoint
   * @param  {Object} params
   * @param  {Object} params
   *
   * @return {Object}
   */
  delete(endpoint, params = {}) {
    return this._request("delete", endpoint, null, params);
  }

  /**
   * OPTIONS requests
   *
   * @param  {String} endpoint
   * @param  {Object} params
   *
   * @return {Object}
   */
  options(endpoint, params = {}) {
    return this._request("options", endpoint, null, params);
  }
}

/**
 * Options Exception.
 */
export class OptionsException {
  /**
   * Constructor.
   *
   * @param {String} message
   */
  constructor(message) {
    this.name = "Options Error";
    this.message = message;
  }
}
