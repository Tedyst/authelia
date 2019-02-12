import SeleniumWebDriver, { WebDriver } from "selenium-webdriver";
import Util from "util";

export default async function(driver: WebDriver, header: string, expectedValue: string) {
  const el = await driver.wait(SeleniumWebDriver.until.elementLocated(SeleniumWebDriver.By.tagName("body")), 5000);
  const text = await el.getText();

  const expectedLine = Util.format("\"%s\": \"%s\"", header, expectedValue);

  if (text.indexOf(expectedLine) < 0) {
    throw new Error("Header not found.");
  }
}