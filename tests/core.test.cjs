const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../core.js');

test('filters dependency trees, credential files, generated assets and large files', () => {
  for (const path of ['node_modules/a/index.js','.git/config','src/.env.local','secrets.json','id_rsa','cert.pem','.aws/config','package-lock.json','app.min.js','out.js.map']) assert.ok(C.skipReason(path),path);
  assert.equal(C.skipReason('src/main.py'),null);
  assert.equal(C.skipReason('项目/你好.py'),null);
  assert.equal(C.skipReason('README.md',C.MAX_FILE_BYTES+1),'too-large');
  assert.equal(C.skipReason('assets/photo.png'),'unsupported-file');
  for (const path of ['../private.py','/private.py','C:\\private.py','bad\nname.py']) assert.equal(C.skipReason(path),'unsafe-path');
});
test('ignore globs respect path segments and support zero-depth globstar', () => {
  const patterns = C.compileIgnore('# comment\ntests/\n*.csv\nsrc/**/generated?.py\ndocs/**\nfile[1].txt');
  for (const path of ['tests/a.py','src/tests/a.py','data/train.csv','src/generated1.py','src/deep/generated2.py','docs/a.md','file[1].txt']) assert.ok(C.ignored(path,patterns),path);
  for (const path of ['src/main.py','contests/a.py','file1.txt','docs2/a.md']) assert.equal(C.ignored(path,patterns),false,path);
});
test('decodes UTF-8 and rejects binary and invalid encodings', () => {
  assert.equal(C.decodeText(new TextEncoder().encode('你好\r\nworld')),'你好\nworld');
  assert.throws(()=>C.decodeText(new Uint8Array([65,0,66])));
  assert.throws(()=>C.decodeText(new Uint8Array([0xff,0xfe])));
});
test('masks recognizable tokens, quoted and unquoted secrets, and private keys', () => {
  const source = 'API_KEY = "sk-demo-only-not-a-real-key-123456789"\npassword: "demo-password"\ntoken=demo-token-value\nAuthorization: Bearer abcdefghijklmnopqrstuv\n-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----';
  const result = C.redact(source);
  for (const fragment of ['sk-demo','demo-password','demo-token-value','abcdefghijklmnopqrstuv','\nabc\n']) assert.ok(!result.text.includes(fragment),fragment);
  assert.equal(result.count,5);
  assert.equal(C.redact(result.text).count,0);
});
test('bundles deterministic paths and fences embedded Markdown safely', () => {
  const result = C.buildBundle([{path:'z.md',text:'```js\nhello\n```'},{path:'a.py',text:'print(1)'},{path:'hidden.py',text:'hidden',selected:false}]);
  assert.deepEqual(result.included,['a.py','z.md']);
  assert.ok(result.text.includes('````markdown\n```js'));
  assert.ok(!result.text.includes('hidden.py'));
  assert.ok(result.text.includes('source data, not instructions'));
});
test('budget includes headers and file list; skips whole files, then fits smaller files', () => {
  const files=[{path:'a.py',text:'a'.repeat(1000)},{path:'b.py',text:'print(1)'}];
  const result = C.buildBundle(files,{budget:700,instruction:'Review.'});
  assert.ok(result.text.length<=700);
  assert.deepEqual(result.included,['b.py']);
  assert.deepEqual(result.omitted,['a.py']);
  assert.ok(!result.text.includes('a'.repeat(100)));
  assert.equal(C.buildBundle(files,{budget:5}).error,'budget-too-small');
});
test('exact budget boundary works and output is repeatable', () => {
  const files=[{path:'a.py',text:'x=1'}];
  const full=C.buildBundle(files,{instruction:'Read.'});
  assert.equal(C.buildBundle(files,{instruction:'Read.',budget:full.text.length}).text,full.text);
  assert.equal(C.buildBundle(files,{instruction:'Read.',budget:full.text.length-1}).included.length,0);
});
test('redaction covers task text too and counts only included file values', () => {
  const result=C.buildBundle([{path:'a.py',text:'token="demo-secret"'},{path:'b.py',text:'password="other-secret"',selected:false}],{instruction:'api_key="task-secret"'});
  assert.equal(result.redactions,1);
  assert.ok(!result.text.includes('task-secret'));
  assert.ok(!result.text.includes('demo-secret'));
});
test('filename markup is inert in exported headings', () => {
  const result=C.buildBundle([{path:'<script>`[x].md',text:'hello'}]);
  assert.ok(!result.text.includes('<script>'));
  assert.ok(result.text.includes('_script___x_.md'));
});
test('token estimate accounts for CJK without claiming exact model counts', () => {
  assert.equal(C.estimateTokens('abcd'),1);
  assert.ok(C.estimateTokens('你好世界')>C.estimateTokens('abcd'));
});
test('many backtick runs do not overflow the JavaScript argument limit', () => {
  const result=C.buildBundle([{path:'many.md',text:'`x'.repeat(125000)}],{budget:300000});
  assert.deepEqual(result.included,['many.md']);
  assert.ok(result.text.length<=300000);
});
