"use strict";

var axios = require("axios");
var cheerio = require("cheerio");
var async_core = require("async");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { Builder, By, Key, util, sleep } = require("selenium-webdriver", "sleep");
require("dotenv").config();
const nodemailer = require("nodemailer");

async function runAutomation() {
  let chrome = require("selenium-webdriver/chrome");
  let options = new chrome.Options();
  let driver = new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
  const actions = driver.actions({ bridge: true });
  try {
    await driver.get("https://www.vfsvisaonline.com/Netherlands-Global-Online-Appointment_Zone2/AppScheduling/AppWelcome.aspx?P=yLSZQO8Ad673EXhKOPALC%2fa6TdN5o6wQfJGZex2bh88%3d");
    await driver.sleep(4000);
    await driver.findElement(By.id("plhMain_lnkSchApp")).click();
    await driver.sleep(4000);
    var ddlElement = driver.findElement(By.id("plhMain_cboVisaCategory"));
    await ddlElement.click();
    await driver.sleep(1000);
    await ddlElement.findElement(By.css("option[value='898']")).click();
    await driver.sleep(4000);
    await driver.findElement(By.id("plhMain_btnSubmit")).click();
    await driver.sleep(4000);

    let promise = new Promise(function (resolve, reject) {
      driver.findElements(By.id("plhMain_lblMsg")).then(function (txt) {
        if (typeof txt === 'undefined') {
          resolve(false);
        } else {
          if (typeof txt[0] === 'undefined') {
            resolve(false);
          } else {
            txt[0].getText().then(function (t) {
              if (t == 'No date(s) available for appointment.') {
                resolve(true);
              } else {
                resolve(false);
              }
            });
          }
        }
      });
    });

    promise.then(
      function (result) {
        if (result === false) {
          sendEmail();
        } else {
          driver.close();
          runAutomation();
        }
        console.log(result);
      },
      function (err) {
        console.log(err);
      }
    );
  } catch (err) {
    console.log("Error; moving to next element");
    driver.quit();
  }
}

var sendEmail = function () {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "", // replace this with your gmail address
      pass: "" // replace this with your gmail app password 
      // please see: https://support.google.com/accounts/answer/185833?hl=en
    }
  });

  var text = 'Most likely there is an appoinment now';

  let mailOptions = {
    from: "", // replace this with your gmail address
    to: "", // replace this with your gmail address
    subject: "Heyyy!! Holland Schengen Notification",
    text: text
  };

  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log(err);
      console.log("got an error:");
    } else {
      console.log("your email has sent!");
    }
  });
};

runAutomation();

