const date = new Date("2026-09-22T06:47:00Z");
for (const locale of ["en-US-u-ca-islamic-umalqura", "ar-SA-u-ca-islamic-umalqura", "en-US-u-ca-islamic"]){
  const parts = new Intl.DateTimeFormat(locale,{day:"numeric",month:"numeric",year:"numeric"}).formatToParts(date);
  console.log(locale, parts.map(p=>`${p.type}=${p.value}`).join(" "));
}
