const puppeteer = require("puppeteer");
const logger = require("./logger");

const getSchedule = async (username, password, options) => {
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
  logger.log("[*] Navigating to My Weekly Schedule");
  await page.goto(
    "http://web.academic.uph.edu/psp/ps/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES.SSR_SSENRL_SCHD_W.GBL?PORTALPARAM_PTCNAV=HC_SSR_SSENRL_SCHD_W_GBL&EOPP.SCNode=HRMS&EOPP.SCPortal=EMPLOYEE&EOPP.SCName=CO_EMPLOYEE_SELF_SERVICE&EOPP.SCLabel=Enrollment&EOPP.SCFName=HCCC_ENROLLMENT&EOPP.SCSecondary=true&EOPP.SCPTfname=HCCC_ENROLLMENT&FolderPath=PORTAL_ROOT_OBJECT.CO_EMPLOYEE_SELF_SERVICE.HCCC_ENROLLMENT.HC_SSR_SSENRL_SCHD_W_GBL&IsFolder=false",
    { waitUntil: "networkidle0" }
  );

  await page.waitForSelector("iframe");
  logger.log("[*] iframe is ready. Loading iframe content");
  const elementHandle = await page.$("#ptifrmtgtframe");
  const frame = await elementHandle.contentFrame();
  await frame.waitForSelector("#win0divDERIVED_REGFRM1_SSR_SCHED_FORMAT");

  logger.log("[*] Weekly Calendar loaded");
  const table = await frame.$("#SSR_DUMMY_REC\\$scroll\\$0");
  await table.screenshot({
    path: "screenshot/class_schedule.png",
  });
  logger.log("[*] Screenshot Taken");

  logger.log("[*] Logging out");
  await page.goto(
    "http://web.academic.uph.edu/psp/ps/EMPLOYEE/HRMS/?cmd=logout",
    { waitUntil: "load" }
  );

  logger.log("[*] Closing");
  await browser.close();
};

module.exports = { getSchedule };
