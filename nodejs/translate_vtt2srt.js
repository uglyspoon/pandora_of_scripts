const fs = require("fs");

const translate = require("google-translate-api");
const path = require("path");
const vtt2srt = require("vtt2srt");

const dir = "/Users/spoon/Downloads/1. Getting Started with iOS 12 and Swift 4.2/";

const dirs = fs.readdirSync(dir, { withFileTypes: true });

function isNumber(val) {
  return val == +val;
}

dirs.forEach((file, idx) => {
  if (file.isFile()) {
    const ext = path.extname(file.name);
    if (ext !== ".vtt") return;
    let fullpath = path.resolve(dir, file.name);
    // let newFileName = path.basename(fullpath, ".vtt") + ".srt";
    let newFileName = fullpath.replace(".vtt", ".srt");
    fs.readFile(fullpath, "utf8", function(err, captionsBuff) {
      if (!err) {
        let originString = vtt2srt(captionsBuff.toString());
        const stringArray = originString.split("\n");
        var itemMatcher = /(\d{2}:\d{2}:\d{2})\,(\d{3})\s+-->\s+(\d{2}:\d{2}:\d{2})\,(\d{3}\s*)/gm;
        let toBetransLate = "";
        stringArray.forEach(async (item, idx) => {
          if (!itemMatcher.test(item) && !isNumber(item)) {
            toBetransLate += item + "\n";
          }
        });

        translate(toBetransLate, { to: "zh-CN" })
          .then(res => {
            let toBetransLateArray = toBetransLate.split("\n");
            let transLatedArray = res.text.split("\n");
            toBetransLateArray.forEach((word, idx) => {
              if (transLatedArray[idx] && word) {
                originString = originString.replace(word, transLatedArray[idx]);
              }
            });

            fs.writeFileSync(newFileName, originString);
            console.log(`success ！ ${path.basename(fullpath, ".vtt") + ".srt"}`);
          })
          .catch(err => {
            console.log(`fail! ${path.basename(fullpath, ".vtt") + ".srt"}`, err);
          });
      }
    });
  }
});
