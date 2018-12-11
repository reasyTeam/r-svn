const path = require("path");
const fs = require("fs");
const child_process = require("child_process");
const opn = require("opn");

class CodeAnalysis {
    constructor() {
        this.createReport = this.createReport.bind(this);
    }

    run(startVersion, endVersion, cwd) {
        // console.log(argv);
        this.startVersion = startVersion;
        this.endVersion = endVersion;
        this.rootPath = path.join(cwd, "./log");

        this.copyJaveFile();
        this.log("生成svn日志中");
        this.getSvnLog();
        this.log("svn日志生成完毕");
        this.log("代码分析中");
        this.isFileExist(path.join(this.rootPath, "svn.log"))
            .then(this.createReport)
            .then(() => {
                return this.isFileExist(path.join(this.rootPath, "index.html"));
            })
            .then(() => {
                this.log("代码分析完毕");
                this.log("项目报告生成完毕");
                this.openFile();
            })
            .catch(console.error); //eslint-disable-line
    }

    copyJaveFile() {
        try {
            fs.mkdirSync(this.rootPath);
        } catch (e) {}

        fs.writeFileSync(path.join(this.rootPath, "statsvn.jar"), fs.readFileSync(path.join(__dirname, "../assets/statsvn.jar")));
    }

    getSvnLog() {
        child_process.execSync(`svn log ../ -r ${this.startVersion}:${this.endVersion} -v --xml > svn.log`, {
            cwd: this.rootPath
        });
    }

    isFileExist(filename) {
        let ct = 0,
            exist = false,
            intervalTimer = null,
            timeoutTimer = null;
        return new Promise((resolve, reject) => {
            tryToGetFile();
            intervalTimer = setInterval(() => {
                if (exist) {
                    clearInterval(intervalTimer);
                    resolve();
                } else if (ct > 10) {
                    reject("生成svn.log文件时出错");
                }
            }, 1000);
        });

        function tryToGetFile() {
            if (fs.readFileSync(filename)) {
                exist = true;
                clearTimeout(timeoutTimer);
            } else {
                ct++;
                timeoutTimer = setTimeout(tryToGetFile(), 500);
            }
        }
    }

    createReport() {
        child_process.execSync("java -jar ./statsvn.jar -charset utf-8 ./svn.log ../", {
            cwd: this.rootPath
        });
    }

    openFile() {
        this.log("打开浏览器");
        const filePath = path.join(this.rootPath, "index.html");
        opn(filePath, {
            app: "chrome"
        });
    }

    log(msg) {
        /*eslint-disable*/
        console.log("");
        console.log("/***********/");
        console.log(`${msg}`);
        console.log("/***********/");
        console.log("");
        /*eslint-enable*/
    }
}
// const codeAnalysis = ;
// console.log(codeAnalysis);
module.exports = new CodeAnalysis();