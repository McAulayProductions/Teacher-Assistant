# Teacher-Assistant
const defaultData = {
  settings: {
    teacherName: "Matthew",
    schoolName: "",
    mainMode: "Music Teacher Mode"
  },
  classes: [
    { id: crypto.randomUUID(), name: "Year 8 Music", room: "Music Lab", notes: "GarageBand skills and ensemble rotation" },
    { id: crypto.randomUUID(), name: "Year 10 Music", room: "Studio", notes: "Songwriting and production focus" }
  ],
  lessons: [
    { id: crypto.randomUUID(), day: "Monday", className: "Year 8 Music", topic: "Chord progressions", goal: "Students build a 4-chord loop in GarageBand." },
    { id: crypto.randomUUID(), day: "Wednesday", className: "Year 10 Music", topic: "Recording vocals", goal: "Students record and comp a vocal take." }
  ],
  assessments: [
    { id: crypto.randomUUID(), className: "Year 8 Music", title: "Loop Composition", due: "2026-06-12", status: "Drafting" }
  ],
  resources: [
    { id: crypto.randomUUID(), title: "GarageBand chord loop guide", subject: "Year 8 Music", link: "Shared Drive / Music / Year 8", type: "Worksheet" }
  ]
};

let data = loadData();

const titles = {
  dashboard: ["Dashboard", "Your weekly teaching cockpit."],
  planner: ["Weekly Planner", "Map the week before it ambushes you."],
  classes: ["Classes", "Keep your teaching groups organised."],
  assessments: ["Assessments", "Track what is due, ready, marked, and complete."],
  resources: ["Resources", "Your searchable teaching vault."],
  ai: ["AI Assistant", "Build better prompts faster."],
  settings: ["Settings", "Personalise the workspace."]
};

function loadData() {
  const saved = localStorage.getItem("teacherOSData");
  if (!saved) {
    localStorage.setItem("teacherOSData", JSON.stringify(defaultData));
    return structuredClone(defaultData);
  }
  try {
    return JSON.parse(saved);
  } catch {
    localStorage.setItem("teacherOSData", JSON.stringify(defaultData));
    return structuredClone(defaultData);
  }
}

function saveData() {
  localStorage.setItem("teacherOSData", JSON.stringify(data));
  renderAll();
}

function switchView(view) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active-view"));
  document.getElementById(view).classList.add("active-view");

  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.view === view));
  document.getElementById("pageTitle").textContent = titles[view][0];
  document.getElementById("pageSubtitle").textContent = titles[view][1];
}

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => switchView(btn.dataset.view));
});

document.getElementById("resetDemoBtn").addEventListener("click", () => {
  if (confirm("Reset all Teacher OS demo data?")) {
    data = structuredClone(defaultData);
    saveData();
  }
});

document.getElementById("lessonForm").addEventListener("submit", event => {
  event.preventDefault();
  data.lessons.push({
    id: crypto.randomUUID(),
    day: lessonDay.value,
    className: lessonClass.value.trim(),
    topic: lessonTopic.value.trim(),
    goal: lessonGoal.value.trim()
  });
  event.target.reset();
  saveData();
});

document.getElementById("classForm").addEventListener("submit", event => {
  event.preventDefault();
  data.classes.push({
    id: crypto.randomUUID(),
    name: className.value.trim(),
    room: classRoom.value.trim(),
    notes: classNotes.value.trim()
  });
  event.target.reset();
  saveData();
});

document.getElementById("assessmentForm").addEventListener("submit", event => {
  event.preventDefault();
  data.assessments.push({
    id: crypto.randomUUID(),
    className: assessmentClass.value.trim(),
    title: assessmentTitle.value.trim(),
    due: assessmentDue.value,
    status: assessmentStatus.value
  });
  event.target.reset();
  saveData();
});

document.getElementById("resourceForm").addEventListener("submit", event => {
  event.preventDefault();
  data.resources.push({
    id: crypto.randomUUID(),
    title: resourceTitle.value.trim(),
    subject: resourceSubject.value.trim(),
    link: resourceLink.value.trim(),
    type: resourceType.value
  });
  event.target.reset();
  saveData();
});

document.getElementById("settingsForm").addEventListener("submit", event => {
  event.preventDefault();
  data.settings = {
    teacherName: teacherName.value.trim(),
    schoolName: schoolName.value.trim(),
    mainMode: mainMode.value
  };
  saveData();
});

document.getElementById("promptForm").addEventListener("submit", event => {
  event.preventDefault();
  const type = promptType.value;
  const classText = promptClass.value.trim() || "the class";
  const context = promptContext.value.trim() || "the current unit";
  const constraints = promptConstraints.value.trim() || "make it practical, clear, differentiated, and teacher-ready";

  const taskMap = {
    lesson: "Create a complete lesson plan",
    differentiate: "Differentiate this learning task",
    rubric: "Create a student-friendly rubric",
    parent: "Draft a professional parent communication",
    report: "Draft report comments"
  };

  const prompt = `${taskMap[type]} for ${classText}.

Context:
${context}

Constraints:
${constraints}

Please include:
- clear teacher instructions
- student-facing wording
- differentiation for support and extension
- timing or structure
- success criteria
- practical classroom considerations

Use Australian school language and keep it realistic for a busy teacher.`;

  promptOutput.textContent = prompt;
});

document.getElementById("copyPromptBtn").addEventListener("click", async () => {
  await navigator.clipboard.writeText(promptOutput.textContent);
  copyPromptBtn.textContent = "Copied";
  setTimeout(() => copyPromptBtn.textContent = "Copy", 1200);
});

function deleteItem(collection, id) {
  data[collection] = data[collection].filter(item => item.id !== id);
  saveData();
}

window.deleteItem = deleteItem;

function renderAll() {
  renderDashboard();
  renderPlanner();
  renderClasses();
  renderAssessments();
  renderResources();
  renderSettings();
}

function renderDashboard() {
  statClasses.textContent = data.classes.length;
  statLessons.textContent = data.lessons.length;
  statAssessments.textContent = data.assessments.length;
  statResources.textContent = data.resources.length;

  const focusItems = [
    ...data.lessons.slice(0, 3).map(l => `${l.day}: ${l.className} — ${l.topic}`),
    ...data.assessments.slice(0, 2).map(a => `Assessment: ${a.title} due ${a.due}`)
  ];

  todayFocus.innerHTML = focusItems.length
    ? focusItems.map(item => `<li>${escapeHtml(item)}</li>`).join("")
    : "<li>No focus items yet. Add lessons and assessments.</li>";

  const workload = [
    ["Planning", Math.min(100, data.lessons.length * 15)],
    ["Assessment", Math.min(100, data.assessments.length * 25)],
    ["Resources", Math.min(100, data.resources.length * 12)]
  ];

  workloadRadar.innerHTML = workload.map(([label, value]) => `
    <div class="radar-row">
      <span>${label}</span>
      <div class="bar"><span style="width:${value}%"></span></div>
      <span>${value}%</span>
    </div>
  `).join("");
}

function renderPlanner() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  weeklyPlanner.innerHTML = days.map(day => {
    const lessons = data.lessons.filter(l => l.day === day);
    return `
      <div class="day-column">
        <h4>${day}</h4>
        ${lessons.length ? lessons.map(l => `
          <div class="lesson-card">
            <strong>${escapeHtml(l.className)}</strong>
            <div>${escapeHtml(l.topic)}</div>
            <div class="meta">${escapeHtml(l.goal || "No goal added")}</div>
            <div class="card-actions">
              <button class="small-btn delete-btn" onclick="deleteItem('lessons','${l.id}')">Delete</button>
            </div>
          </div>
        `).join("") : `<p class="muted">No lessons yet.</p>`}
      </div>
    `;
  }).join("");
}

function renderClasses() {
  classList.innerHTML = data.classes.length ? data.classes.map(c => `
    <div class="item-card">
      <strong>${escapeHtml(c.name)}</strong>
      <div class="meta">${escapeHtml(c.room || "No room")} · ${escapeHtml(c.notes || "No notes")}</div>
      <div class="card-actions">
        <button class="small-btn delete-btn" onclick="deleteItem('classes','${c.id}')">Delete</button>
      </div>
    </div>
  `).join("") : `<p class="muted">No classes yet.</p>`;
}

function renderAssessments() {
  assessmentList.innerHTML = data.assessments.length ? data.assessments.map(a => `
    <div class="item-card">
      <strong>${escapeHtml(a.title)}</strong>
      <div>${escapeHtml(a.className)}</div>
      <div class="meta">Due: ${escapeHtml(a.due)} · Status: ${escapeHtml(a.status)}</div>
      <div class="card-actions">
        <button class="small-btn delete-btn" onclick="deleteItem('assessments','${a.id}')">Delete</button>
      </div>
    </div>
  `).join("") : `<p class="muted">No assessments yet.</p>`;
}

function renderResources() {
  resourceList.innerHTML = data.resources.length ? data.resources.map(r => `
    <div class="item-card">
      <strong>${escapeHtml(r.title)}</strong>
      <div>${escapeHtml(r.subject || "No subject")} · ${escapeHtml(r.type)}</div>
      <div class="meta">${escapeHtml(r.link || "No link added")}</div>
      <div class="card-actions">
        <button class="small-btn delete-btn" onclick="deleteItem('resources','${r.id}')">Delete</button>
      </div>
    </div>
  `).join("") : `<p class="muted">No resources yet.</p>`;
}

function renderSettings() {
  teacherName.value = data.settings.teacherName || "";
  schoolName.value = data.settings.schoolName || "";
  mainMode.value = data.settings.mainMode || "Music Teacher Mode";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

renderAll();
