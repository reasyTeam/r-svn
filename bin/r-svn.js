#!/usr/bin/env node

const inquirer = require("inquirer"); //a tool for cli interaction with questions
const analysis = require("../src/code_analysis.js");
class CLI {
    ask() {
        inquirer
            .prompt([{
                type: "input",
                name: "startVersion",
                message: "请输入svn起始版本号",
                validate: input => {
                    return !/[^0-9]/.test(input);
                }
            }, {
                type: "input",
                name: "endVersion",
                message: "请输入svn结束版本号",
                validate: input => {
                    return !/[^0-9]/.test(input);
                }
            }])
            .then(answer => {
                analysis.run(answer.startVersion, answer.endVersion, process.cwd());
            })
            .catch(console.error);
    }
}
const cli = new CLI();
cli.ask();