const defaultData = {
  settings: { teacherName: "Matthew", schoolName: "", mainMode: "Music Teacher Mode" },
  classes: [
    { id: crypto.randomUUID(), name: "Year 8 Music", room: "Music Lab", focus: "GarageBand loops", notes: "Mixed ability practical group" }
  ],
  students: [
    { id: crypto.randomUUID(), name: "Jason", className: "Year 8 Music", notes: "Sample student", portfolio: [] }
  ],
  lessons: [
    { id: crypto.randomUUID(), day: "Monday", className: "Year 8 Music", topic: "Chord progressions", goal: "Students build a 4-chord loop.", status: "Ready" }
  ],
  tasks: [
    { id: crypto.randomUUID(), title: "Email Jason's mother", area: "Parent contact", priority: "Medium", due: "", complete: false }
  ],
  assessments: [
    { id: crypto.randomUUID(), className: "Year 8 Music", title: "Loop Composition", due: "2026-06-12", status: "Drafting" }
  ],
  resources: [
    { id: crypto.randomUUID(), title: "GarageBand chord loop guide", subject: "Year 8 Music", link: "Shared Drive / Music / Year 8", type: "Worksheet" }
  ]
};

let data = loadData();
let recognition = null;

const titles = {
  dashboard: ["Dashboard", "Your weekly teaching command centre."],
  voice: ["Voice", "Hands-busy classroom capture."],
  students: ["Students", "Student notes and evidence portfolios."],
  planner: ["Weekly Planner", "Map the week before it ambushes you."],
  tasks: ["Task Board", "Separate urgent from pretend-urgent."],
  classes: ["Classes", "Keep teaching groups organised."],
  assessments: ["Assessments", "Track what is due, ready, marked, and complete."],
  resources: ["Resources", "Your searchable teaching vault."],
  ai: ["AI Assistant", "Build teacher-ready prompts quickly."],
  settings: ["Settings", "Personalise the workspace."]
};

function loadData() {
  const saved = localStorage.getItem("teacherAssistantDataV12");
  if (!saved) {
    localStorage.setItem("teacherAssistantDataV12", JSON.stringify(defaultData));
    return structuredClone(defaultData);
  }
  try {
    const parsed = JSON.parse(saved);
    return {
      ...structuredClone(defaultData),
      ...parsed,
      settings: { ...defaultData.settings, ...(parsed.settings || {}) },
      classes: parsed.classes || [],
      students: parsed.students || [],
      lessons: parsed.lessons || [],
      tasks: parsed.tasks || [],
      assessments: parsed.assessments || [],
      resources: parsed.resources || []
    };
  } catch {
    return structuredClone(defaultData);
  }
}

function saveData() {
  localStorage.setItem("teacherAssistantDataV12", JSON.stringify(data));
  renderAll();
}

function switchView(view) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active-view"));
  document.getElementById(view).classList.add("active-view");
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.view === view));
  pageTitle.textContent = titles[view][0];
  pageSubtitle.textContent = titles[view][1];
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".nav-btn").forEach(btn => btn.addEventListener("click", () => switchView(btn.dataset.view)));
document.querySelectorAll("[data-jump]").forEach(btn => btn.addEventListener("click", () => switchView(btn.dataset.jump)));

resetDemoBtn.addEventListener("click", () => {
  if (confirm("Reset all Teacher Assistant demo data?")) {
    data = structuredClone(defaultData);
    saveData();
  }
});

function addTask(title, area = "Admin", priority = "Medium", due = "") {
  data.tasks.push({ id: crypto.randomUUID(), title, area, priority, due, complete: false });
}

function findStudentByName(name) {
  const clean = name.toLowerCase().trim();
  return data.students.find(s => s.name.toLowerCase() === clean);
}

function parseNameFromCommand(command) {
  const words = command.replace(/[.,]/g, "").split(/\s+/);
  const lower = words.map(w => w.toLowerCase());
  const stopWords = ["remind","me","to","email","call","contact","mother","father","parent","carer","add","note","for","attach","photo","to","assessment","portfolio","create","relief","lesson"];
  const candidate = words.find((word, index) => /^[A-Z][a-z]+/.test(word) && !stopWords.includes(lower[index]));
  return candidate || "";
}

function processVoiceCommand(command) {
  const text = command.trim();
  const lower = text.toLowerCase();
  let result = "";

  if (!text) return "No command entered.";

  if (lower.includes("remind me to") || lower.startsWith("remind")) {
    const title = text.replace(/remind me to/i, "").replace(/^remind/i, "").trim();
    const area = lower.includes("email") || lower.includes("mother") || lower.includes("parent") || lower.includes("father") ? "Parent contact" : "Admin";
    addTask(title || text, area, "Medium");
    result = `Created task: ${title || text}\nArea: ${area}\nPriority: Medium`;
  } else if (lower.includes("add note") || lower.includes("note for")) {
    const name = parseNameFromCommand(text);
    const student = findStudentByName(name);
    const note = text.replace(/add note for/i, "").replace(/note for/i, "").replace(name, "").replace(/^:/, "").trim();
    if (student) {
      student.portfolio.push({ id: crypto.randomUUID(), title: "Voice note", note: note || text, image: "", date: new Date().toLocaleString() });
      result = `Added note to ${student.name}'s portfolio.`;
    } else {
      addTask(`Create student note: ${text}`, "Portfolio", "Medium");
      result = `Student not found. Created portfolio task instead.`;
    }
  } else if (lower.includes("attach photo")) {
    const name = parseNameFromCommand(text);
    const student = findStudentByName(name);
    if (student) {
      portfolioStudentSelect.value = student.id;
      portfolioTitle.value = "Assessment portfolio photo";
      portfolioNote.value = `Voice instruction: ${text}`;
      switchView("students");
      result = `Ready to attach a photo to ${student.name}. Choose or take a photo, then tap Attach to portfolio.`;
    } else {
      addTask(`Attach photo to student portfolio: ${text}`, "Portfolio", "High");
      result = "Student not found. Created a high-priority portfolio task.";
    }
  } else if (lower.includes("relief lesson")) {
    addTask(text, "Planning", "High");
    promptType.value = "relief";
    promptContext.value = text;
    promptConstraints.value = "Make it low-prep, clear for a relief teacher, and suitable for students to complete independently.";
    result = "Created high-priority planning task and prepared the AI relief lesson prompt.";
  } else {
    addTask(text, "Admin", "Medium");
    result = `Command not recognised perfectly. Created general task: ${text}`;
  }

  saveData();
  return result;
}

processVoiceBtn.addEventListener("click", () => {
  voiceResult.textContent = processVoiceCommand(voiceText.value);
});

clearVoiceBtn.addEventListener("click", () => {
  voiceText.value = "";
  voiceResult.textContent = "No command processed yet.";
});

document.querySelectorAll(".command-example").forEach(btn => {
  btn.addEventListener("click", () => voiceText.value = btn.dataset.command);
});

function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    voiceStatus.textContent = "Voice not supported in this browser";
    return;
  }
  recognition = new SpeechRecognition();
  recognition.lang = "en-AU";
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onstart = () => voiceStatus.textContent = "Listening";
  recognition.onend = () => voiceStatus.textContent = "Idle";
  recognition.onerror = () => voiceStatus.textContent = "Voice error";
  recognition.onresult = event => {
    const transcript = event.results[0][0].transcript;
    voiceText.value = transcript;
    voiceResult.textContent = processVoiceCommand(transcript);
  };
}

startVoiceBtn.addEventListener("click", () => {
  if (!recognition) setupSpeechRecognition();
  if (recognition) recognition.start();
});

stopVoiceBtn.addEventListener("click", () => {
  if (recognition) recognition.stop();
});

lessonForm.addEventListener("submit", e => {
  e.preventDefault();
  data.lessons.push({ id: crypto.randomUUID(), day: lessonDay.value, className: lessonClass.value.trim(), topic: lessonTopic.value.trim(), goal: lessonGoal.value.trim(), status: lessonStatus.value });
  e.target.reset(); saveData();
});

taskForm.addEventListener("submit", e => {
  e.preventDefault();
  addTask(taskTitle.value.trim(), taskArea.value, taskPriority.value, taskDue.value);
  e.target.reset(); saveData();
});

classForm.addEventListener("submit", e => {
  e.preventDefault();
  data.classes.push({ id: crypto.randomUUID(), name: className.value.trim(), room: classRoom.value.trim(), focus: classFocus.value.trim(), notes: classNotes.value.trim() });
  e.target.reset(); saveData();
});

studentForm.addEventListener("submit", e => {
  e.preventDefault();
  data.students.push({ id: crypto.randomUUID(), name: studentName.value.trim(), className: studentClass.value.trim(), notes: studentNotes.value.trim(), portfolio: [] });
  e.target.reset(); saveData();
});

addPortfolioBtn.addEventListener("click", () => {
  const student = data.students.find(s => s.id === portfolioStudentSelect.value);
  if (!student) return alert("Choose a student first.");
  const file = portfolioFile.files[0];
  const entry = { id: crypto.randomUUID(), title: portfolioTitle.value.trim() || "Portfolio evidence", note: portfolioNote.value.trim(), image: "", date: new Date().toLocaleString() };

  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      entry.image = reader.result;
      student.portfolio.push(entry);
      portfolioTitle.value = ""; portfolioNote.value = ""; portfolioFile.value = "";
      saveData();
    };
    reader.readAsDataURL(file);
  } else {
    student.portfolio.push(entry);
    portfolioTitle.value = ""; portfolioNote.value = "";
    saveData();
  }
});

assessmentForm.addEventListener("submit", e => {
  e.preventDefault();
  data.assessments.push({ id: crypto.randomUUID(), className: assessmentClass.value.trim(), title: assessmentTitle.value.trim(), due: assessmentDue.value, status: assessmentStatus.value });
  e.target.reset(); saveData();
});

resourceForm.addEventListener("submit", e => {
  e.preventDefault();
  data.resources.push({ id: crypto.randomUUID(), title: resourceTitle.value.trim(), subject: resourceSubject.value.trim(), link: resourceLink.value.trim(), type: resourceType.value });
  e.target.reset(); saveData();
});

settingsForm.addEventListener("submit", e => {
  e.preventDefault();
  data.settings = { teacherName: teacherName.value.trim(), schoolName: schoolName.value.trim(), mainMode: mainMode.value };
  saveData();
});

promptForm.addEventListener("submit", e => {
  e.preventDefault();
  const taskMap = { lesson: "Create a complete lesson plan", relief: "Create a relief lesson plan", differentiate: "Differentiate this learning task", rubric: "Create a student-friendly rubric", parent: "Draft a professional parent communication", report: "Draft report comments" };
  promptOutput.textContent = `${taskMap[promptType.value]} for ${promptClass.value || "the class"}.

Teacher mode:
${data.settings.mainMode}

Context:
${promptContext.value || "the current unit"}

Constraints:
${promptConstraints.value || "Make it practical, clear, differentiated, and teacher-ready."}

Include:
- clear teacher instructions
- student-facing wording
- support and extension
- timing
- success criteria
- Australian school language`;
});

copyPromptBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(promptOutput.textContent);
  copyPromptBtn.textContent = "Copied";
  setTimeout(() => copyPromptBtn.textContent = "Copy", 1200);
});

function deleteItem(collection, id) {
  data[collection] = data[collection].filter(item => item.id !== id);
  saveData();
}
function toggleTask(id) {
  data.tasks = data.tasks.map(t => t.id === id ? { ...t, complete: !t.complete } : t);
  saveData();
}
function deletePortfolio(studentId, entryId) {
  const student = data.students.find(s => s.id === studentId);
  if (student) {
    student.portfolio = student.portfolio.filter(e => e.id !== entryId);
    saveData();
  }
}
window.deleteItem = deleteItem;
window.toggleTask = toggleTask;
window.deletePortfolio = deletePortfolio;

function renderAll() {
  renderDashboard(); renderPlanner(); renderTasks(); renderClasses(); renderAssessments(); renderResources(); renderSettings(); renderStudents();
}

function renderDashboard() {
  const openTasks = data.tasks.filter(t => !t.complete);
  statClasses.textContent = data.classes.length;
  statStudents.textContent = data.students.length;
  statLessons.textContent = data.lessons.length;
  statTasks.textContent = openTasks.length;
  modeBadge.textContent = data.settings.mainMode || "Teacher Mode";
  welcomeTitle.textContent = `${data.settings.teacherName || "Teacher"}, here is the week in one glance.`;

  const highTask = openTasks.find(t => t.priority === "High");
  nextBestAction.textContent = highTask ? `Start here: ${highTask.title}` : "No major fires showing. Add commands, tasks, or evidence to sharpen the radar.";

  priorityStack.innerHTML = openTasks.length
    ? openTasks.slice(0, 5).map(t => `<li>${escapeHtml(t.priority)} priority: ${escapeHtml(t.title)}</li>`).join("")
    : "<li>No open tasks yet.</li>";

  const workload = [
    ["Planning", Math.min(100, data.lessons.length * 15)],
    ["Tasks", Math.min(100, openTasks.length * 18)],
    ["Assessment", Math.min(100, data.assessments.filter(a => a.status !== "Complete").length * 28)],
    ["Portfolios", Math.min(100, data.students.reduce((sum, s) => sum + (s.portfolio?.length || 0), 0) * 18)]
  ];
  workloadRadar.innerHTML = workload.map(([label, value]) => `<div class="radar-row"><span>${label}</span><div class="bar"><span style="width:${value}%"></span></div><span>${value}%</span></div>`).join("");
}

function renderPlanner() {
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
  weeklyPlanner.innerHTML = days.map(day => {
    const lessons = data.lessons.filter(l => l.day === day);
    return `<div class="day-column"><h4>${day}</h4>${lessons.length ? lessons.map(l => `<div class="lesson-card"><strong>${escapeHtml(l.className)}</strong><div>${escapeHtml(l.topic)}</div><div class="meta">${escapeHtml(l.goal || "No goal added")}</div><span class="status-pill">${escapeHtml(l.status || "Planned")}</span><div class="card-actions"><button class="small-btn delete-btn" onclick="deleteItem('lessons','${l.id}')">Delete</button></div></div>`).join("") : `<p class="muted">No lessons yet.</p>`}</div>`;
  }).join("");
}

function renderTasks() {
  taskList.innerHTML = data.tasks.length ? data.tasks.map(t => `<div class="item-card priority-${t.priority.toLowerCase()}"><strong>${escapeHtml(t.title)}</strong><div class="meta">${escapeHtml(t.area)} · ${escapeHtml(t.priority)} priority${t.due ? " · Due " + escapeHtml(t.due) : ""}</div><span class="status-pill">${t.complete ? "Complete" : "Open"}</span><div class="card-actions"><button class="small-btn complete-btn" onclick="toggleTask('${t.id}')">${t.complete ? "Reopen" : "Complete"}</button><button class="small-btn delete-btn" onclick="deleteItem('tasks','${t.id}')">Delete</button></div></div>`).join("") : `<p class="muted">No tasks yet.</p>`;
}

function renderStudents() {
  portfolioStudentSelect.innerHTML = data.students.length
    ? data.students.map(s => `<option value="${s.id}">${escapeHtml(s.name)} — ${escapeHtml(s.className || "No class")}</option>`).join("")
    : `<option value="">No students yet</option>`;

  studentList.innerHTML = data.students.length ? data.students.map(s => `
    <div class="item-card">
      <strong>${escapeHtml(s.name)}</strong>
      <div class="meta">${escapeHtml(s.className || "No class")} · ${escapeHtml(s.notes || "No notes")}</div>
      <h4>Portfolio</h4>
      ${(s.portfolio || []).length ? s.portfolio.map(e => `
        <div class="portfolio-entry">
          <strong>${escapeHtml(e.title)}</strong>
          <div class="meta">${escapeHtml(e.date)}</div>
          <div>${escapeHtml(e.note || "")}</div>
          ${e.image ? `<img src="${e.image}" alt="Portfolio evidence">` : ""}
          <div class="card-actions"><button class="small-btn delete-btn" onclick="deletePortfolio('${s.id}','${e.id}')">Delete evidence</button></div>
        </div>
      `).join("") : `<p class="muted">No portfolio evidence yet.</p>`}
      <div class="card-actions"><button class="small-btn delete-btn" onclick="deleteItem('students','${s.id}')">Delete student</button></div>
    </div>
  `).join("") : `<p class="muted">No students yet.</p>`;
}

function renderClasses() {
  classList.innerHTML = data.classes.length ? data.classes.map(c => `<div class="item-card"><strong>${escapeHtml(c.name)}</strong><div>${escapeHtml(c.focus || "No current focus")}</div><div class="meta">${escapeHtml(c.room || "No room")} · ${escapeHtml(c.notes || "No notes")}</div><div class="card-actions"><button class="small-btn delete-btn" onclick="deleteItem('classes','${c.id}')">Delete</button></div></div>`).join("") : `<p class="muted">No classes yet.</p>`;
}
function renderAssessments() {
  assessmentList.innerHTML = data.assessments.length ? data.assessments.map(a => `<div class="item-card"><strong>${escapeHtml(a.title)}</strong><div>${escapeHtml(a.className)}</div><div class="meta">Due: ${escapeHtml(a.due)} · Status: ${escapeHtml(a.status)}</div><div class="card-actions"><button class="small-btn delete-btn" onclick="deleteItem('assessments','${a.id}')">Delete</button></div></div>`).join("") : `<p class="muted">No assessments yet.</p>`;
}
function renderResources() {
  resourceList.innerHTML = data.resources.length ? data.resources.map(r => `<div class="item-card"><strong>${escapeHtml(r.title)}</strong><div>${escapeHtml(r.subject || "No subject")} · ${escapeHtml(r.type)}</div><div class="meta">${escapeHtml(r.link || "No link added")}</div><div class="card-actions"><button class="small-btn delete-btn" onclick="deleteItem('resources','${r.id}')">Delete</button></div></div>`).join("") : `<p class="muted">No resources yet.</p>`;
}
function renderSettings() {
  teacherName.value = data.settings.teacherName || "";
  schoolName.value = data.settings.schoolName || "";
  mainMode.value = data.settings.mainMode || "Music Teacher Mode";
  modeBadge.textContent = data.settings.mainMode || "Teacher Mode";
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[char]));
}

setupSpeechRecognition();
renderAll();
