const https = require("https");
const urls = [
  "https://cdn.10minuteschool.com/images/nagad_logo.png",
  "https://cdn.10minuteschool.com/images/rocket_logo.png",
  "https://cdn.10minuteschool.com/images/nagad.png",
  "https://cdn.10minuteschool.com/images/rocket.png",
  "https://cdn.10minuteschool.com/images/nagad-logo.png",
  "https://cdn.10minuteschool.com/images/Rocket.png",
  "https://cdn.10minuteschool.com/images/Nagad.png"
];
let completed = 0;
for (const url of urls) {
  https.get(url, (res) => {
    console.log(url, res.statusCode);
    completed++;
    if (completed === urls.length) process.exit(0);
  }).on("error", () => {
    console.log(url, "error");
    completed++;
    if (completed === urls.length) process.exit(0);
  });
}
