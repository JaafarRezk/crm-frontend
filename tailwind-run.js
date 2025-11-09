// tailwind-run.js
import { exec } from "child_process";
import path from "path";

const input = path.resolve("./src/style.css");
const output = path.resolve("./dist/tailwind.css");

exec(`npx tailwindcss -i "${input}" -o "${output}" --minify`, (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
});
