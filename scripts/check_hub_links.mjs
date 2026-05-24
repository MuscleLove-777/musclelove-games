#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDir, "..", "..");
const hubRoot = path.join(workspaceRoot, "musclelove-games");
const hubIndexPath = path.join(hubRoot, "index.html");
const sitemapPath = path.join(hubRoot, "sitemap.xml");
const utmPath = path.join(workspaceRoot, "utm_links.md");
const xPostsPath = path.join(workspaceRoot, "x_post_templates.md");

const suspiciousHostTokens = ["-theta", "-alpha", "-beta", "-staging", "xxx"];

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function getGamesFromIndex(html) {
  const gamesMatch = html.match(/var GAMES = \[(.*?)\];/s);
  if (!gamesMatch) {
    throw new Error("GAMES array not found in musclelove-games/index.html");
  }
  const uncommented = gamesMatch[1]
    .split(/\r?\n/)
    .filter((line) => !line.trimStart().startsWith("//"))
    .join("\n");

  const gameEntries = [...uncommented.matchAll(/\{[^{}]+\}/g)];
  const games = gameEntries.map((entry) => {
    const block = entry[0];
    const title = block.match(/title:\s*'([^']+)'/)?.[1] ?? "";
    const url = (block.match(/url:\s*'([^']+)'/)?.[1] ?? "").replace(/\/$/, "");
    const img = block.match(/img:\s*'([^']+)'/)?.[1] ?? "";
    return { title, url, img };
  }).filter((g) => g.title && g.url);

  return games;
}

function getUrlsFromUtm(mdText) {
  return [...mdText.matchAll(/\|\s*(https?:\/\/[^|\s]+)\s*\|/g)].map((m) => m[1]);
}

function getUrlsFromXPosts(mdText) {
  return [...mdText.matchAll(/https?:\/\/[^\s]+/g)]
    .map((u) => u[0])
    .filter((u) => u.includes("utm_source=x&utm_medium=social&utm_campaign="));
}

function getGameUrlsFromSitemap(xmlText) {
  const allLocs = [...xmlText.matchAll(/<loc>(https?:\/\/[^<]+)<\/loc>/g)]
    .map((m) => m[1].replace(/\/$/, ""));
  return allLocs.filter((u) => u !== "https://musclelove-games.vercel.app");
}

function unique(arr) {
  return [...new Set(arr)];
}

function compareSet(name, expected, actual, normalize = (v) => v) {
  const a = expected.map(normalize);
  const b = actual.map(normalize);
  const missing = a.filter((x) => !b.includes(x));
  const extra = b.filter((x) => !a.includes(x));
  return { name, missing: unique(missing), extra: unique(extra) };
}

function validate() {
  const indexHtml = readText(hubIndexPath);
  const sitemapXml = readText(sitemapPath);
  const utmMd = readText(utmPath);
  const xPostsMd = readText(xPostsPath);

  const games = getGamesFromIndex(indexHtml);
  const gameUrls = games.map((g) => g.url);

  const errors = [];

  if (gameUrls.length !== unique(gameUrls).length) {
    errors.push("Duplicate game URLs exist in GAMES.");
  }

  for (const game of games) {
    let parsed;
    try {
      parsed = new URL(game.url);
    } catch {
      errors.push(`Invalid URL: ${game.title} -> ${game.url}`);
      continue;
    }
    if (parsed.protocol !== "https:") {
      errors.push(`Non-HTTPS URL: ${game.title} -> ${game.url}`);
    }
    const hostLower = parsed.host.toLowerCase();
    if (suspiciousHostTokens.some((token) => hostLower.includes(token))) {
      errors.push(`Suspicious host token detected: ${game.title} -> ${game.url}`);
    }
    if (!game.img) {
      errors.push(`Missing image path: ${game.title}`);
      continue;
    }
    const imagePath = path.join(hubRoot, game.img);
    if (!fs.existsSync(imagePath)) {
      errors.push(`Missing image file: ${game.title} -> ${game.img}`);
    }
  }

  const utmUrls = getUrlsFromUtm(utmMd);
  const xUrls = getUrlsFromXPosts(xPostsMd);
  const sitemapUrls = getGameUrlsFromSitemap(sitemapXml);

  const utmBaseUrls = utmUrls.map((u) => u.split("?")[0].replace(/\/$/, ""));
  const xBaseUrls = xUrls.map((u) => u.split("?")[0].replace(/\/$/, ""));

  const comparisons = [
    compareSet("UTM links", gameUrls, utmBaseUrls),
    compareSet("X post links", gameUrls, xBaseUrls),
    compareSet("sitemap links", gameUrls, sitemapUrls, (u) => u.replace(/\/$/, "")),
  ];

  for (const cmp of comparisons) {
    if (cmp.missing.length) {
      errors.push(`${cmp.name} missing: ${cmp.missing.join(", ")}`);
    }
    if (cmp.extra.length) {
      errors.push(`${cmp.name} extra: ${cmp.extra.join(", ")}`);
    }
  }

  if (errors.length) {
    console.error("Hub link integrity check failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("Hub link integrity check passed.");
  console.log(`- games: ${gameUrls.length}`);
  console.log(`- utm links: ${utmUrls.length}`);
  console.log(`- x post links: ${xUrls.length}`);
  console.log(`- sitemap game links: ${sitemapUrls.length}`);
}

validate();
