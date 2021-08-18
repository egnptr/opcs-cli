const puppeteer = require("puppeteer");
const logger = require("./logger");

const getScore = async (username, password, options) => {
  logger.log("[*] Launching browser");
  const browser = await puppeteer.launch({
    headless: !options.visible,
    defaultViewport: { width: 1280, height: 720 },
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
  logger.log("[*] Navigating to My Grades");
  await page.goto(
    "http://web.academic.uph.edu/psp/ps/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES.SSR_SSENRL_GRADE.GBL?PORTALPARAM_PTCNAV=HC_SSR_SSENRL_GRADE_GBL&EOPP.SCNode=HRMS&EOPP.SCPortal=EMPLOYEE&EOPP.SCName=CO_EMPLOYEE_SELF_SERVICE&EOPP.SCLabel=Enrollment&EOPP.SCFName=HCCC_ENROLLMENT&EOPP.SCSecondary=true&EOPP.SCPTfname=HCCC_ENROLLMENT&FolderPath=PORTAL_ROOT_OBJECT.CO_EMPLOYEE_SELF_SERVICE.HCCC_ENROLLMENT.HC_SSR_SSENRL_GRADE_GBL&IsFolder=false",
    { waitUntil: "networkidle0" }
  );

  await page.waitForSelector("iframe");
  logger.log("[*] iframe is ready. Loading iframe content");
  const elementHandle = await page.$("#ptifrmtgtframe");
  const frame = await elementHandle.contentFrame();
  await frame.waitForSelector("#win0divPAGECONTAINER");

  // logger.log("[*] Selecting the latest term");
  // await frame.click("#SSR_DUMMY_RECV1\\$sels\\$0\\$\\$0");
  // await Promise.all([
  //   frame.waitForFunction(
  //     'document.querySelector("body").innerText.includes("GPA")'
  //   ),
  //   frame.click("#DERIVED_SSS_SCT_SSR_PB_GO"),
  // ]);

  logger.log("[*] Latest term loaded! Extracting data");
  const element = await frame.waitForSelector("#win0divSTATS_CUMS\\$12");
  let value = await frame.evaluate((el) => el.textContent, element);

  if (parseInt(value) > 4.0) {
    const newElement = await frame.waitForSelector("#win0divSTATS_CUMS\\$13");
    value = await frame.evaluate((el) => el.textContent, newElement);
  }

  logger.log("[*] Logging out");
  await page.goto(
    "http://web.academic.uph.edu/psp/ps/EMPLOYEE/HRMS/?cmd=logout",
    { waitUntil: "load" }
  );

  logger.log("[*] Closing");
  await browser.close();

  return value;
};

module.exports = { getScore };
