// tailwind-build.js
import fs from "fs";
import path from "path";
import tailwind from "tailwindcss";

// المسارات
const inputFile = path.resolve("./src/style.css");
const outputFile = path.resolve("./dist/tailwind.css");

// قراءة CSS
const inputCSS = fs.readFileSync(inputFile, "utf8");

// توليد Tailwind CSS
const processor = tailwind({});

processor
  .process(inputCSS, { from: inputFile, to: outputFile })
  .then(result => {
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, result.css, "utf8");
    console.log("✅ Tailwind CSS generated at", outputFile);
  })
  .catch(err => {
    console.error("❌ Error generating Tailwind CSS:", err);
  });
