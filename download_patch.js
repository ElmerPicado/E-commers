const fs = require('fs');
const https = require('https');

https.get('https://github.com/ElmerPicado/E-commers/commit/6dda69942883ab7a5f97fcb5affceb763be452da.patch', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('patch.diff', data);
    console.log('Downloaded patch.diff');
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
