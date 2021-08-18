const puppeteer = require("puppeteer");
const logger = require("./logger");

const getTranscript = async (username, password) => {
  logger.log("[*] Launching browser");
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      width: 1280,
      height: 2280,
    },
  });
  const page = await browser.newPage();

  logger.log("[*] Loading page");
  await page.goto(
    "http://web.academic.uph.edu/psp/ps/?cmd=login&languageCd=ENG&",
    {
      waitUntil: "load",
    }
  );

  logger.log("[*] Inserting login details");
  await page.type("#userid", username);
  await page.type("#pwd", password);

  logger.log("[*] Logging in...");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0", timeout: 120000 }),
    page.click("input[type=submit]"),
  ]);

  logger.log("[*] Logged in!");
  logger.log("[*] Navigating to My Course History");
  await page.goto(
    "http://web.academic.uph.edu/psp/ps/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES_2.SSS_MY_CRSEHIST.GBL?PORTALPARAM_PTCNAV=HC_SSS_MY_CRSEHIST_GBL2&EOPP.SCNode=HRMS&EOPP.SCPortal=EMPLOYEE&EOPP.SCName=CO_EMPLOYEE_SELF_SERVICE&EOPP.SCLabel=Self%20Service&EOPP.SCPTfname=CO_EMPLOYEE_SELF_SERVICE&FolderPath=PORTAL_ROOT_OBJECT.CO_EMPLOYEE_SELF_SERVICE.HCCC_ACAD_PLANNING.HC_SSS_MY_CRSEHIST_GBL2&IsFolder=false",
    { waitUntil: "networkidle0" }
  );

  await page.waitForSelector("iframe");
  logger.log("[*] iframe is ready. Loading iframe content");
  const elementHandle = await page.$("#ptifrmtgtframe");
  const frame = await elementHandle.contentFrame();
  await frame.waitForSelector("#win0divPAGECONTAINER");

  logger.log("[*] Course History loaded");
  const scrollDimension = await page.evaluate(() => {
    return {
      width: document.scrollingElement.scrollWidth,
      height: document.scrollingElement.scrollHeight,
    };
  });
  await page.pdf({
    path: "pdf/transcript.pdf",
    printBackground: true,
    width: scrollDimension.width,
    height: scrollDimension.height,
    margin: {
      top: "20px",
      bottom: "0px",
      left: "20px",
      right: "20px",
    },
    format: "a4",
  });
  logger.log("[*] Saved as PDF");

  logger.log("[*] Logging out");
  await page.goto(
    "http://web.academic.uph.edu/psp/ps/EMPLOYEE/HRMS/?cmd=logout",
    { waitUntil: "load" }
  );

  logger.log("[*] Closing");
  await browser.close();
};

module.exports = { getTranscript };
