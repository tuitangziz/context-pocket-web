/* UI has no network requests or external dependencies. */
(() => {
  'use strict';
  const C = window.ContextPocket;
  const $ = id => document.getElementById(id);
  let lang = 'zh', files = [], skipped = [], bundle = null, loading = false, generation = 0, toastTimer;
  const messages = {
    zh: {
      local:'仅在你的浏览器中处理', title:'把代码装进口袋，\n让 AI 更懂你的项目。', subtitle:'选择文件，写下问题，带走一份清晰的上下文。\n不用安装，不用 API Key，也不上传你的代码。', steps:'选代码 · 定任务 · 复制给 AI', files:'项目文件', demo:'试试示例 ↗', pickTitle:'从一个小项目开始', pickHelp:'选择本地文件夹，或添加几个文件', folder:'选择文件夹', addFiles:'选择文件', selectAll:'选中可见', selectNone:'取消可见', empty:'还没有文件\n也可以先试试右上方的示例', importFoot:'自动过滤依赖、构建产物、常见密钥文件。每次选择会替换当前项目。', task:'告诉 AI 你想做什么', presetLabel:'从一个任务开始', instructionLabel:'你的问题 / 任务要求', budgetLabel:'上下文预算（字符）', budgetHint:'按文件路径排序，超出预算的整份文件会跳过；不截断代码。', ignoreLabel:'额外忽略规则', ignoreHint:'每行一个 glob，支持 *、**、?。可从根目录 .contextignore 自动读取。不读取 .gitignore。', privacyTitle:'留在本地，先看再发', privacyText:'自动遮盖常见 API Key 和密码格式，但无法识别所有秘密。复制给 AI 前，请检查右侧预览。', preview:'带走上下文', statFiles:'已打包文件', statTokens:'估算 tokens ≈', statRedactions:'内容遮盖', characters:'字符 · 包含任务和目录', previewLabel:'生成的 Markdown 上下文', copy:'复制上下文', download:'下载 .md ↓', tokenNote:'Token 为粗略估算，不代表模型的真实计数。', clear:'清空项目', footer:'小工具，让每次提问都有上下文。', footerRight:'无追踪 · 无服务器上传 · MIT License', search:'搜索文件…', copied:'已复制，可以粘贴到 AI 对话中。', copyFailed:'浏览器限制了复制。预览已全选，请按 Ctrl+C / ⌘C，或下载文件。', reading:'正在本地读取文件…', loaded:'文件已在本地读取。请检查预览后再分享。', downloaded:'已生成 Markdown 下载。', cleared:'项目已清空。', noMatches:'没有匹配的文件', omitted:'预算不足，未打包：', tooSmall:'任务本身已超出预算，请缩短任务或提高预算。', skipped:'个文件已跳过', loading:'读取中…', noFiles:'没有可打包的文件。请查看跳过原因。', limited:'达到读取上限：最多 2,000 个候选文件 / 20 MiB 原始数据。', failure:'文件读取失败，请重新选择。',
      reasons:{'unsafe-path':'路径不支持','dependency/build':'依赖或构建目录','sensitive-file':'常见敏感文件','generated-file':'生成文件','too-large':'超过 256 KiB','unsupported-file':'不支持的文件类型','binary-or-encoding':'二进制或非 UTF-8','read-error':'无法读取','custom-ignore':'自定义忽略','limit':'达到读取上限','duplicate':'重复路径'}
    },
    en: {
      local:'Processed only in your browser',title:'Pocket your code.\nGive AI the full picture.',subtitle:'Choose files, frame a question, take focused context with you.\nNo installation. No API key. No code uploads.',steps:'Choose code · Set a task · Copy to AI',files:'Project files',demo:'Try a demo ↗',pickTitle:'Start with a small project',pickHelp:'Choose a local folder or a few source files',folder:'Choose folder',addFiles:'Choose files',selectAll:'Select visible',selectNone:'Deselect visible',empty:'No files yet\nTry the demo to see how it works',importFoot:'Dependencies, build output and common secret files are filtered. Each import replaces the current project.',task:'Frame your question',presetLabel:'Start with a task',instructionLabel:'Your question / requirements',budgetLabel:'Context budget (characters)',budgetHint:'Files are sorted by path. Files that do not fit are skipped whole; code is never truncated.',ignoreLabel:'Additional ignore rules',ignoreHint:'One glob per line: *, ** and ?. Root .contextignore is loaded automatically. .gitignore is not read.',privacyTitle:'Local first. Review before sharing.',privacyText:'Common API key and password patterns are masked, but not every secret can be detected. Review the preview before sharing with AI.',preview:'Take your context',statFiles:'Files packed',statTokens:'Estimated tokens ≈',statRedactions:'Values masked',characters:'characters · task + file list included',previewLabel:'Generated Markdown context',copy:'Copy context',download:'Download .md ↓',tokenNote:'Token counts are a rough estimate, not a model tokenizer.',clear:'Clear project',footer:'A small tool for better questions.',footerRight:'No tracking · No code uploads · MIT License',search:'Search files…',copied:'Copied. Paste it into your AI conversation.',copyFailed:'Clipboard unavailable. Preview selected: press Ctrl+C / ⌘C, or download the file.',reading:'Reading files locally…',loaded:'Files loaded locally. Review the preview before sharing.',downloaded:'Markdown download generated.',cleared:'Project cleared.',noMatches:'No matching files',omitted:'Over budget, omitted: ',tooSmall:'Your task alone exceeds the budget. Shorten it or raise the budget.',skipped:'files skipped',loading:'Reading…',noFiles:'No files to pack. Check the skip reasons.',limited:'Import limit reached: 2,000 candidate files / 20 MiB of source data.',failure:'Could not read the files. Please choose them again.',
      reasons:{'unsafe-path':'unsupported path','dependency/build':'dependency / build directory','sensitive-file':'common secret file','generated-file':'generated file','too-large':'over 256 KiB','unsupported-file':'unsupported file type','binary-or-encoding':'binary or non-UTF-8','read-error':'cannot read','custom-ignore':'custom ignore','limit':'import limit','duplicate':'duplicate path'}
    }
  };
  const presets = {
    zh:{explain:['理解项目','请用中文解释这个项目的作用、主要文件之间的关系和运行流程。指出需要补充哪些上下文，不要假设未提供的代码。最后建议一个适合初学者的小改进。'],debug:['排查问题','请帮助排查以下代码中的问题。先区分已确认的问题和待验证的猜测，给出最小修改方案与复现步骤。\n\n遇到的问题：\n预期行为：\n实际行为 / 报错：'],review:['代码审查','请审查提供的代码，优先关注正确性、异常处理和可维护性。每个发现请写明文件路径、影响及最小修改建议。不要为了重构而重构。'],test:['补充测试','请为提供的代码设计少量、有实际价值的测试，覆盖正常输入、边界情况与失败路径。先说明测试目标，再给出可运行的测试代码和运行命令。']},
    en:{explain:['Understand project','Explain what this project does, how the main files relate, and how execution flows. Identify missing context instead of assuming unseen code. Suggest one small beginner-friendly improvement.'],debug:['Debug a problem','Help debug the provided code. Separate confirmed problems from hypotheses. Suggest a minimal fix and reproduction steps.\n\nProblem:\nExpected behavior:\nActual behavior / error:'],review:['Review code','Review the provided code for correctness, error handling and maintainability. For each finding, include the file path, impact and a minimal fix. Avoid unnecessary refactoring.'],test:['Add useful tests','Design a small set of valuable tests for the provided code: normal input, boundary cases and failure paths. Explain each test goal, then provide runnable tests and the command to run them.']}
  };
  const t = key => messages[lang][key];
  const number = n => n.toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US');
  function toast(message) { clearTimeout(toastTimer); $('status').textContent = message; toastTimer = setTimeout(() => { $('status').textContent = ''; }, 4500); }
  function setBusy(busy) {
    loading = busy;
    for (const id of ['choose-folder','choose-files','demo']) $(id).disabled = busy;
    $('file-list').setAttribute('aria-busy', String(busy));
  }
  function applyLanguage(previous) {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = lang === 'zh' ? 'Context Pocket · 把代码装进口袋' : 'Context Pocket · Local code to AI context';
    document.querySelectorAll('[data-i18n]').forEach(element => {
      element.textContent = t(element.dataset.i18n);
      if (['title','subtitle','empty'].includes(element.dataset.i18n)) element.style.whiteSpace = 'pre-line';
    });
    $('language').textContent = lang === 'zh' ? 'EN' : '中文';
    $('search').placeholder = t('search'); $('search').setAttribute('aria-label',t('search'));
    $('preview').placeholder = '# Context Pocket\n\n' + (lang === 'zh' ? '你的下一次 AI 对话，从这里开始。' : 'Your next AI conversation starts here.');
    for (const option of $('preset').options) option.textContent = presets[lang][option.value][0];
    if (!previous || Object.values(presets[previous]).some(p => p[1] === $('instruction').value)) $('instruction').value = presets[lang][$('preset').value][1];
    render();
  }
  function visibleFiles() {
    const patterns = C.compileIgnore($('ignore').value);
    const query = $('search').value.toLowerCase();
    return files.filter(f => !C.ignored(f.path, patterns) && f.path.toLowerCase().includes(query));
  }
  function renderFiles() {
    const list = $('file-list'); list.replaceChildren();
    const visible = visibleFiles();
    if (!visible.length) { const empty = document.createElement('div'); empty.className = 'empty'; empty.textContent = files.length ? t('noMatches') : t('empty'); empty.style.whiteSpace='pre-line'; list.append(empty); }
    for (const file of visible) {
      const row = document.createElement('label'); row.className = 'file-row';
      const checkbox = document.createElement('input'); checkbox.type='checkbox'; checkbox.checked = file.selected;
      checkbox.addEventListener('change', () => { file.selected = checkbox.checked; renderPreview(); });
      const name = document.createElement('span'); name.className = 'file-name'; name.textContent = file.path;
      const size = document.createElement('span'); size.className = 'file-size'; size.textContent = (file.size / 1024).toFixed(1) + 'K';
      row.append(checkbox,name,size); list.append(row);
    }
    $('file-count').textContent = `${visible.length} / ${files.length}`;
    const patterns = C.compileIgnore($('ignore').value);
    const allSkipped = [...skipped, ...files.filter(f => C.ignored(f.path, patterns)).map(f => ({path:f.path,reason:'custom-ignore'}))];
    $('skipped-count').textContent = `${number(allSkipped.length)} ${t('skipped')}`;
    $('skipped-list').replaceChildren();
    for (const item of allSkipped.slice(0, 200)) {
      const li = document.createElement('li'); li.textContent = `${item.path} — ${t('reasons')[item.reason] || item.reason}`; $('skipped-list').append(li);
    }
    if (allSkipped.length > 200) { const li = document.createElement('li'); li.textContent = `… +${number(allSkipped.length - 200)}`; $('skipped-list').append(li); }
  }
  function renderPreview() {
    const patterns = C.compileIgnore($('ignore').value);
    const eligible = files.filter(f => !C.ignored(f.path,patterns));
    const budget = Number($('budget').value);
    bundle = C.buildBundle(eligible, {budget, instruction:$('instruction').value});
    const anySelected = eligible.some(f => f.selected);
    const output = anySelected ? bundle.text : '';
    $('preview').value = output;
    $('included-stat').textContent = number(bundle.included.length);
    $('tokens-stat').textContent = number(output ? bundle.tokens : 0);
    $('redactions-stat').textContent = number(bundle.redactions);
    $('char-count').textContent = `${number(output.length)} / ${number(budget)}`;
    $('budget-meter-fill').style.width = `${output.length / budget * 100}%`;
    const warning = $('budget-warning');
    warning.hidden = !anySelected || (!bundle.omitted.length && !bundle.error);
    warning.textContent = bundle.error ? t('tooSmall') : t('omitted') + bundle.omitted.slice(0,8).join(', ') + (bundle.omitted.length > 8 ? ` … +${bundle.omitted.length-8}` : '');
    $('copy').disabled = $('download').disabled = bundle.included.length === 0;
  }
  function render() { renderFiles(); renderPreview(); }
  async function importFiles(fileList, folderMode) {
    if (!fileList.length || loading) return;
    const request = ++generation;
    setBusy(true); toast(t('reading'));
    files = []; skipped = []; $('ignore').value = ''; $('search').value = ''; render();
    let totalBytes = 0, count = 0, limitReached = false;
    const seen = new Set();
    try {
      const entries = Array.from(fileList).map(file => {
        let path = C.normalizePath(folderMode ? (file.webkitRelativePath || file.name) : file.name);
        if (folderMode && path.includes('/')) path = path.slice(path.indexOf('/') + 1);
        return { file, path };
      }).sort((a,b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
      for (const {file,path} of entries) {
        if (request !== generation) return;
        let reason = C.skipReason(path,file.size);
        if (!reason && seen.has(path)) reason = 'duplicate';
        seen.add(path);
        if (!reason && (count >= C.MAX_FILES || totalBytes + file.size > C.MAX_TOTAL_BYTES)) { reason = 'limit'; limitReached = true; }
        if (reason) { skipped.push({path,reason}); continue; }
        count++; totalBytes += file.size;
        try {
          const bytes = await file.arrayBuffer();
          if (request !== generation) return;
          const text = C.decodeText(bytes);
          files.push({path, text, size:file.size, selected:true});
          if (path === '.contextignore') $('ignore').value = text;
        } catch (error) { skipped.push({path,reason:error.message === 'binary-or-encoding' || error instanceof TypeError ? 'binary-or-encoding' : 'read-error'}); }
      }
      files.forEach(f => { if (f.path === '.contextignore') f.selected = false; });
      render(); toast(limitReached ? t('limited') : files.length ? t('loaded') : t('noFiles'));
    } catch { if (request === generation) toast(t('failure')); }
    finally { if (request === generation) setBusy(false); }
  }
  function loadDemo() {
    ++generation; setBusy(false); $('search').value=''; $('ignore').value='';
    const sample = [
      ['README.md','# Tiny Study Planner\n\nA small Python example for planning weekly study sessions.\n\nRun: `python planner.py`\n'],
      ['planner.py','from dataclasses import dataclass\n\n@dataclass\nclass Session:\n    subject: str\n    minutes: int\n\ndef weekly_minutes(sessions):\n    return sum(session.minutes for session in sessions)\n\nif __name__ == "__main__":\n    sessions = [Session("Python", 45), Session("NumPy", 30)]\n    print(f"This week: {weekly_minutes(sessions)} minutes")\n'],
      ['settings.py','# Deliberately fake example: demonstrates local masking.\nAPI_KEY = "sk-demo-only-not-a-real-key-123456789"\nWEEKLY_TARGET = 180\n'],
      ['tests/test_planner.py','import unittest\nfrom planner import Session, weekly_minutes\n\nclass PlannerTests(unittest.TestCase):\n    def test_total(self):\n        self.assertEqual(weekly_minutes([Session("Python", 45)]), 45)\n\n    def test_empty(self):\n        self.assertEqual(weekly_minutes([]), 0)\n']
    ];
    files = sample.map(([path,text]) => ({path,text,size:new TextEncoder().encode(text).length,selected:true}));
    skipped = [{path:'.env',reason:'sensitive-file'},{path:'__pycache__/planner.pyc',reason:'dependency/build'}];
    render(); toast(t('loaded'));
  }
  $('choose-folder').addEventListener('click',() => $('folder-input').click());
  $('choose-files').addEventListener('click',() => $('files-input').click());
  for (const [id,folderMode] of [['folder-input',true],['files-input',false]]) $(id).addEventListener('change',event => { const chosen = Array.from(event.target.files); event.target.value=''; importFiles(chosen,folderMode); });
  $('demo').addEventListener('click',loadDemo);
  $('search').addEventListener('input',renderFiles);
  $('ignore').addEventListener('input',render);
  $('budget').addEventListener('change',renderPreview);
  $('instruction').addEventListener('input',renderPreview);
  $('preset').addEventListener('change',() => { $('instruction').value = presets[lang][$('preset').value][1]; renderPreview(); });
  $('language').addEventListener('click',() => { const previous=lang; lang = lang === 'zh' ? 'en':'zh'; applyLanguage(previous); });
  for (const [id,value] of [['select-all',true],['select-none',false]]) $(id).addEventListener('click',() => { visibleFiles().forEach(f=>f.selected=value); render(); });
  $('clear').addEventListener('click',() => { ++generation; setBusy(false); files=[]; skipped=[]; $('ignore').value=''; $('search').value=''; render(); toast(t('cleared')); });
  $('copy').addEventListener('click',async () => {
    try { await navigator.clipboard.writeText($('preview').value); toast(t('copied')); }
    catch { $('preview').focus(); $('preview').select(); toast(t('copyFailed')); }
  });
  $('download').addEventListener('click',() => {
    const url = URL.createObjectURL(new Blob([$('preview').value],{type:'text/markdown;charset=utf-8'}));
    const link = document.createElement('a'); link.href=url; link.download='context-pocket.md'; document.body.append(link); link.click(); link.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000); toast(t('downloaded'));
  });
  applyLanguage();
})();
