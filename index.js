#!/usr/bin/env node

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { score } = require("./lib");
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
  else console.error("Unknown command:", argv._.join(" "));
};

run();
