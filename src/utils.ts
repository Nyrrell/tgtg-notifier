export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const getApkVersion = async (): Promise<string> => {
  const defaultApkVersion = '23.6.11';
  let apkVersion = '';

  const apk = await fetch('https://play.google.com/store/apps/details?id=com.app.tgtg&hl=en&gl=US').then((res) =>
    res.text()
  );
  const regExp = /AF_initDataCallback\({key:\s*'ds:5'.*? data:([\s\S]*?), sideChannel:.+<\/script/gm;

  const match = regExp.exec(apk);

  if (match) {
    const data = JSON.parse(match[1]);
    apkVersion = data[1][2][140][0][0][0];
  }

  return apkVersion ? apkVersion : defaultApkVersion;
};
