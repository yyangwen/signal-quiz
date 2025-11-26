// ========== 全局变量 ==========
let allQuestions = [];
let currentChapter = '';
let orderMode = 'sequential';
let questionPool = [];
let currentIndex = 0;
let wrongQuestions = JSON.parse(localStorage.getItem('wrongQuestions') || '[]');

// ========== DOM 元素 ==========
const chapterSelect = document.getElementById('chapterSelect');
const orderSelect = document.getElementById('orderSelect');
const startBtn = document.getElementById('startBtn');
const showWrongBtn = document.getElementById('showWrongBtn');

const mainContent = document.getElementById('mainContent');
const questionArea = document.getElementById('questionArea');
const wrongArea = document.getElementById('wrongArea');

const questionText = document.getElementById('questionText');
const answerBox = document.getElementById('answerBox');
const answerText = document.getElementById('answerText');

const nextBtn = document.getElementById('nextBtn');
const showAnswerBtn = document.getElementById('showAnswerBtn');
const addToWrongBtn = document.getElementById('addToWrongBtn');

const wrongCount = document.getElementById('wrongCount');
const wrongList = document.getElementById('wrongList');
const clearWrongBtn = document.getElementById('clearWrongBtn');
const backBtn = document.getElementById('backBtn');

// ========== 初始化章节选项 ==========
function initChapters() {
  const chapters = [
    { file: 'chapter1.json', name: '第一章 随机信号' },
    { file: 'chapter2.json', name: '第二章 参数估计理论' },
    { file: 'chapter4.json', name: '第四章 现代谱估计' },
    { file: 'chapter5.json', name: '第五章 自适应滤波器' },
    { file: 'chapter6.json', name: '第六章 高阶统计分析' },
    { file: 'chapter7.json', name: '第七章 时频分析与时频分布' },
    { file: 'chapter9.json', name: '第九章 盲信号分离' }
  ];

  chapters.forEach(ch => {
    const option = document.createElement('option');
    option.value = ch.file;
    option.textContent = ch.name;
    chapterSelect.appendChild(option);
  });

  // 默认选中第一个
  chapterSelect.value = chapters[0].file;
}

// ========== 加载题目 ==========
async function loadChapter(file) {
  try {
    const res = await fetch(`chapters/${file}`);
    if (!res.ok) throw new Error('文件加载失败');
    allQuestions = await res.json();
    alert(`✅ 成功加载【${allQuestions[0]?.chapter || '未知'}】，共 ${allQuestions.length} 道题`);
  } catch (err) {
    alert('❌ 加载失败，请检查 chapters/ 目录下的 JSON 文件是否存在');
    console.error(err);
  }
}

// ========== 开始复习 ==========
function startQuiz() {
  currentChapter = chapterSelect.selectedOptions[0].text;
  orderMode = orderSelect.value;

  questionPool = [...allQuestions];
  if (orderMode === 'random') {
    questionPool.sort(() => Math.random() - 0.5);
  }

  currentIndex = 0;
  showQuestion();
  showElement(questionArea);
  hideElement(wrongArea);
  hideElement(answerBox);
}

// ========== 显示题目 ==========
function showQuestion() {
  if (currentIndex >= questionPool.length) {
    alert("🎉 本轮复习完成！");
    return;
  }

  const q = questionPool[currentIndex];
  questionText.textContent = q.question;
  answerText.textContent = q.answers.join('； ');
  addToWrongBtn.dataset.id = q.id;
}

// ========== 下一题 ==========
nextBtn.addEventListener('click', () => {
  currentIndex++;
  hideElement(answerBox);
  showQuestion();
});

// ========== 查看答案 ==========
showAnswerBtn.addEventListener('click', () => {
  showElement(answerBox);
});

// ========== 加入错题本 ==========
addToWrongBtn.addEventListener('click', () => {
  const qid = parseInt(addToWrongBtn.dataset.id);
  const exists = wrongQuestions.some(q => q.id === qid && q.chapter === currentChapter);

  if (!exists) {
    const q = questionPool[currentIndex];
    wrongQuestions.push({ ...q, from: currentChapter });
    localStorage.setItem('wrongQuestions', JSON.stringify(wrongQuestions));
    alert("✅ 已加入错题本");
  } else {
    alert("ℹ️ 这道题已在错题本中");
  }
});

// ========== 查看错题本 ==========
showWrongBtn.addEventListener('click', () => {
  updateWrongList();
  showElement(wrongArea);
  hideElement(questionArea);
});

// ========== 更新错题列表 ==========
function updateWrongList() {
  wrongList.innerHTML = '';
  wrongCount.textContent = wrongQuestions.length;

  if (wrongQuestions.length === 0) {
    const item = document.createElement('li');
    item.textContent = "暂无错题";
    wrongList.appendChild(item);
    return;
  }

  wrongQuestions.forEach((q, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>[${q.from}] 第${q.id}题</strong>
      <p>${q.question}</p>
      <p><strong>答案：</strong>${q.answers.join('； ')}</p>
    `;
    wrongList.appendChild(li);
  });
}

// ========== 清空错题本 ==========
clearWrongBtn.addEventListener('click', () => {
  if (confirm("确定要清空所有错题吗？")) {
    wrongQuestions = [];
    localStorage.removeItem('wrongQuestions');
    updateWrongList();
  }
});

// ========== 返回复习 ==========
backBtn.addEventListener('click', () => {
  showElement(questionArea);
  hideElement(wrongArea);
});

// ========== 工具函数 ==========
function showElement(el) {
  el.classList.remove('hidden');
}
function hideElement(el) {
  el.classList.add('hidden');
}

// ========== 初始化 ==========
window.onload = () => {
  initChapters();

  startBtn.addEventListener('click', async () => {
    const file = chapterSelect.value;
    await loadChapter(file);
    if (allQuestions.length > 0) startQuiz();
  });

  // 初始更新错题数
  updateWrongList();
};
