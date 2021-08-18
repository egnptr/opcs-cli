#!/usr/bin/env node

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { score, schedule, transcript } = require("./lib");
const { setQuiet } = require("./lib/logger");

const run = async () => {
  const argv = yargs(hideBin(process.argv))
    .command({
      command: "gpa",
      aliases: ["gpa"],
      desc: "Get the latest GPA score",
      builder: (yargs) =>
        yargs.option("visible", {
          type: "boolean",
          description: "Show the puppeteer window",
        }),
    })
    .command({
      command: "schedule",
      aliases: ["cs"],
      desc: "Screenshot the weekly class schedule",
      builder: (yargs) =>
        yargs.option("visible", {
          type: "boolean",
          description: "Show the puppeteer window",
        }),
    })
    .command({
      command: "transcript",
      aliases: ["ts"],
      desc: "Save your course history as a transcript",
      builder: (yargs) =>
        yargs.option("visible", {
          type: "boolean",
          description: "Show the puppeteer window",
        }),
    })
    .option("username", {
      alias: "u",
      type: "string",
      description: "OPCS username",
      demandOption: true,
    })
    .option("password", {
      alias: "p",
      type: "string",
      description: "OPCS password",
      demandOption: true,
    })
    .option("quiet", {
      alias: "q",
      type: "boolean",
      description: "Do not output logs",
    })
    .demandCommand(1, "You need at least one command before moving on")
    .help()
    .alias("help", "h").argv;

  if (argv.quiet) setQuiet(true);

  if (argv._[0] === "gpa")
    score
      .getScore(argv.username, argv.password, {
        visible: argv.visible,
      })
      .then((value) => {
        console.log("Your current GPA Score is: " + value);
      });
  else if (argv._[0] === "schedule")
    schedule
      .getSchedule(argv.username, argv.password, {
        visible: argv.visible,
      })
      .then(() => {
        console.log("Your screenshot is now saved in the screenshot folder.");
      });
  else if (argv._[0] === "transcript")
    transcript.getTranscript(argv.username, argv.password).then(() => {
      console.log("Your transcript is now saved in the pdf folder.");
    });
  else console.error("Unknown command:", argv._.join(" "));
};

run();
