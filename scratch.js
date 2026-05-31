const fs = require('fs');
const content = fs.readFileSync('public/images/logo.svg', 'utf8');
const match = content.match(/href="data:image\/png;base64,([^"]+)"/);
if (match) {
  fs.writeFileSync('public/images/logo.png', Buffer.from(match[1], 'base64'));
  console.log('Successfully extracted logo.png');
} else {
  console.log('Could not find base64 string in logo.svg');
}
