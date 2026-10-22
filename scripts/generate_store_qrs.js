const fs = require('fs');
const https = require('https');
const path = require('path');
const vm = require('vm');

const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'deliverables', 'store-qrs-2026-10-22');
const source = fs.readFileSync(path.join(projectRoot, 'js', 'stores_data.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox);
const stores = sandbox.window.ASO_STORES;
const liffId = '2012148118-mnUKxIUF';

function download(url, destination) {
  return new Promise((resolve, reject) => {
    https.get(url, response => {
      if (response.statusCode !== 200) return reject(new Error(`${response.statusCode} ${url}`));
      const file = fs.createWriteStream(destination);
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const manifest = ['門市代號,門市名稱,LIFF入口網址,QR檔案'];
  for (const store of stores) {
    const liffUrl = `https://liff.line.me/${liffId}/?store=${store.code}`;
    const filename = `${store.code}-${store.shortName}.png`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1200x1200&format=png&data=${encodeURIComponent(liffUrl)}`;
    await download(qrUrl, path.join(outputDir, filename));
    manifest.push(`${store.code},${store.name},${liffUrl},${filename}`);
  }
  fs.writeFileSync(path.join(outputDir, '門市QR清單.csv'), `\ufeff${manifest.join('\n')}\n`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
