const fs = require("fs");
const path = require("path");
const { exit } = require("process");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

WARNING_DAYS_THRESHOLD = 30;
ALERT_DAYS_THRESHOLD = 60;
COLOR_GREY = "\x1b[0m";
COLOR_RED = "\x1b[31m";
COLOR_YELLOW = "\x1b[33m";

const daysSince = (installedTimestamp, latestTimestamp) => {
  const installedDate = new Date(installedTimestamp);
  const latestDate = new Date(latestTimestamp);
  const diff = latestDate.getTime() - installedDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const checkForNewVersion = async (dependencyName, category) => {
  const { stdout, stderr } = await exec(`yarn info '${dependencyName}' --json`);
  if (stderr) {
    console.error(stderr);
    exit(1);
  }

  const dependencyPackageFilePath = path.join(
    process.cwd(),
    "node_modules",
    dependencyName,
    "package.json"
  );

  if (!fs.existsSync(dependencyPackageFilePath)) {
    console.error(`Path not found: ${dependencyPackageFilePath}`);
    exit(1);
  }

  let installedVersion;
  try {
    installedVersion = JSON.parse(
      fs.readFileSync(dependencyPackageFilePath)
    ).version;
  } catch (err) {
    console.error(err);
    exit(1);
  }

  const dependencyInfo = JSON.parse(stdout).data;
  const latestVersion =
    dependencyInfo["dist-tags"]?.latest ??
    dependencyInfo.versions[dependencyInfo.versions.length - 1];
  dependencyData = {
    name: dependencyName,
    category: category,
    installedVersion,
    installedReleaseDate: dependencyInfo.time[installedVersion],
    latestVersion: latestVersion,
    latestReleaseDate: dependencyInfo.time[latestVersion],
  };

  logOutdatedDependency(dependencyData);
};

const logOutdatedDependency = (dependencyData) => {
  if (dependencyData.latestVersion !== dependencyData.installedVersion) {
    const daysOutdated = daysSince(
      dependencyData.installedReleaseDate,
      dependencyData.latestReleaseDate
    );

    let color = COLOR_GREY;
    if (daysOutdated > ALERT_DAYS_THRESHOLD) {
      color = COLOR_RED;
    } else if (daysOutdated > WARNING_DAYS_THRESHOLD) {
      color = COLOR_YELLOW;
    }

    console.log(
      `${color}> ${dependencyData.category} '${dependencyData.name}' is out of date.${COLOR_GREY}`
    );
    console.log(
      `${color}  Installed v.${dependencyData.installedVersion} -> latest v.${dependencyData.latestVersion} (${daysOutdated} days between versions)${COLOR_GREY}`
    );
  }
};

const listDependencies = () => {
  const filePath = path.join(process.cwd(), "package.json");
  if (!fs.existsSync(filePath)) {
    console.error(`Path not found: ${filePath}`);
    exit(1);
  }

  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync("./package.json"));
  } catch (err) {
    console.error(err);
    exit(1);
  }

  const allDependencies = [
    ...Object.keys(packageJson.devDependencies ?? {}).map((dependencyName) => [
      dependencyName,
      "devDependencies",
    ]),
    ...Object.keys(packageJson.dependencies ?? {}).map((dependencyName) => [
      dependencyName,
      "dependencies",
    ]),
  ];

  Promise.all(
    allDependencies.map(([dependencyName, category]) =>
      checkForNewVersion(dependencyName, category)
    )
  );
};

listDependencies();
