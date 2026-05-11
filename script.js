const tasks = JSON.parse(localStorage.getItem('ta_v13_tasks') || '[]');

function save() {
  localStorage.setItem('ta_v13_tasks', JSON.stringify(tasks));
  render();
}

function render() {
  const list = document.getElementById('taskList');
  list.innerHTML = tasks.length ? tasks.map(t => `<li>${t}</li>`).join('') : '<li>No tasks yet.</li>';
}

function processCommand(text) {
  if (!text.trim()) return 'No command entered.';
  tasks.unshift(text.trim());
  save();
  return `Processed command:\n\n${text}`;
}

document.getElementById('processBtn').addEventListener('click', () => {
  const text = document.getElementById('commandInput').value;
  document.getElementById('resultBox').textContent = processCommand(text);
});

document.querySelectorAll('.quick').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('commandInput').value = btn.dataset.text;
  });
});

document.getElementById('voiceBtn').addEventListener('click', () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    document.getElementById('resultBox').textContent = 'Voice recognition is not supported in this browser.';
    return;
  }
  const rec = new SR();
  rec.lang = 'en-AU';
  rec.onresult = e => {
    const text = e.results[0][0].transcript;
    document.getElementById('commandInput').value = text;
    document.getElementById('resultBox').textContent = processCommand(text);
  };
  rec.start();
});

render();
