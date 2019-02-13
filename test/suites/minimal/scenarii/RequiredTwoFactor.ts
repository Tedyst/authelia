import LoginAndRegisterTotp from '../../../helpers/LoginAndRegisterTotp';
import VerifyUrlIs from '../../../helpers/assertions/VerifyUrlIs';
import { StartDriver, StopDriver } from '../../../helpers/context/WithDriver';
import VerifyIsSecondFactorStage from '../../../helpers/assertions/VerifyIsSecondFactorStage';
import VisitPage from '../../../helpers/VisitPage';
import FillLoginPageAndClick from '../../../helpers/FillLoginPageAndClick';

export default function() {
  describe('User tries to access a page protected by second factor while he only passed first factor', function() {
    before(async function() {
      this.driver = await StartDriver();
      const secret = await LoginAndRegisterTotp(this.driver, "john", "password", true);
      if (!secret) throw new Error('No secret!');
      
      await VisitPage(this.driver, "https://admin.example.com:8080/secret.html");
      await VerifyUrlIs(this.driver, "https://login.example.com:8080/?rd=https://admin.example.com:8080/secret.html");
      await FillLoginPageAndClick(this.driver, "john", "password");
      await VerifyIsSecondFactorStage(this.driver);
    });

    after(async function() {
      await StopDriver(this.driver);
    });

    it("should reach second factor page of login portal", async function() {
      await VisitPage(this.driver, "https://admin.example.com:8080/secret.html");
      await VerifyIsSecondFactorStage(this.driver);
    });
  });
}