window.updateDashboardBadges = function () {
  try {
    const rawTodos = localStorage.getItem('todoTasks');
    const todos = rawTodos ? JSON.parse(rawTodos) : [];
    const pendingTodos = todos.filter(t => !t.completed).length;
    const todoBadge = document.getElementById('todoBadge');
    if (todoBadge) todoBadge.textContent = `${pendingTodos} task${pendingTodos !== 1 ? 's' : ''}`;
    const todoSidebarBadge = document.getElementById('todoSidebarBadge');
    if (todoSidebarBadge) {
      todoSidebarBadge.textContent = pendingTodos;
      todoSidebarBadge.style.display = pendingTodos > 0 ? 'inline-block' : 'none';
    }
  } catch (e) {
    console.error("Error updating todo badges:", e);
  }

  try {
    const rawPlanner = localStorage.getItem('dailyPlanner');
    const planner = rawPlanner ? JSON.parse(rawPlanner) : {};
    const planKeys = Object.keys(planner).length;
    const plannerBadge = document.getElementById('plannerBadge');
    if (plannerBadge) plannerBadge.textContent = `${planKeys} plan${planKeys !== 1 ? 's' : ''}`;
    const plannerSidebarBadge = document.getElementById('plannerSidebarBadge');
    if (plannerSidebarBadge) {
      plannerSidebarBadge.textContent = planKeys;
      plannerSidebarBadge.style.display = planKeys > 0 ? 'inline-block' : 'none';
    }
  } catch (e) {
    console.error("Error updating planner badges:", e);
  }

  try {
    const rawGoals = localStorage.getItem('dailyGoals');
    const goals = rawGoals ? JSON.parse(rawGoals) : [];
    const totalGoals = goals.length;
    const completedGoalsCount = goals.filter(g => g.completed).length;
    const percent = totalGoals === 0 ? 0 : Math.round((completedGoalsCount / totalGoals) * 100);
    const goalsBadge = document.getElementById('goalsBadge');
    if (goalsBadge) goalsBadge.textContent = `${percent}% done`;
    const goalsSidebarBadge = document.getElementById('goalsSidebarBadge');
    if (goalsSidebarBadge) {
      goalsSidebarBadge.textContent = `${percent}%`;
      goalsSidebarBadge.style.display = totalGoals > 0 ? 'inline-block' : 'none';
    }
  } catch (e) {
    console.error("Error updating goals badges:", e);
  }
};

(function navigationModule() {
  const dashboardView = document.getElementById('dashboardView');
  const featureViews = document.querySelectorAll('.feature-view');
  const cards = document.querySelectorAll('.feature-card');
  const backButtons = document.querySelectorAll('[data-back]');
  const navItems = document.querySelectorAll('.nav-item');
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const breadcrumbs = document.getElementById('breadcrumbs');
  let isNavigating = false;

  function updateBreadcrumbs(targetId) {
    if (!breadcrumbs) return;
    if (targetId === 'dashboard') {
      breadcrumbs.innerHTML = `
        <span class="breadcrumb-item">Pages</span>
        <i data-lucide="chevron-right" class="breadcrumb-sep"></i>
        <span class="breadcrumb-item active">Dashboard</span>
      `;
    } else {
      let label = 'Tool';
      if (targetId === 'todoSection') label = 'Todo List';
      else if (targetId === 'plannerSection') label = 'Daily Planner';
      else if (targetId === 'goalsSection') label = 'Daily Goals';
      else if (targetId === 'pomodoroSection') label = 'Pomodoro Timer';
      else if (targetId === 'quoteSection') label = 'Motivation';

      breadcrumbs.innerHTML = `
        <span class="breadcrumb-item">Pages</span>
        <i data-lucide="chevron-right" class="breadcrumb-sep"></i>
        <span class="breadcrumb-item link-item" data-target="dashboard">Dashboard</span>
        <i data-lucide="chevron-right" class="breadcrumb-sep"></i>
        <span class="breadcrumb-item active">${label}</span>
      `;

      const link = breadcrumbs.querySelector('.link-item');
      if (link) {
        link.addEventListener('click', () => showSection('dashboard'));
      }
    }
    lucide.createIcons();
  }

  function showSection(targetId) {
    if (isNavigating) return;
    isNavigating = true;

    navItems.forEach((item) => {
      item.classList.toggle('active', item.dataset.target === targetId);
    });

    updateBreadcrumbs(targetId);

    if (targetId === 'dashboard') {
      featureViews.forEach((view) => view.classList.remove('active'));
      dashboardView.style.display = 'block';
    } else {
      dashboardView.style.display = 'none';
      featureViews.forEach((view) => {
        view.classList.toggle('active', view.id === targetId);
      });
    }

    if (sidebar) sidebar.classList.remove('mobile-open');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => { isNavigating = false; }, 200);
  }

  cards.forEach((card) => {
    card.addEventListener('click', () => showSection(card.dataset.target));
  });

  backButtons.forEach((btn) => {
    btn.addEventListener('click', () => showSection('dashboard'));
  });

  navItems.forEach((item) => {
    item.addEventListener('click', () => showSection(item.dataset.target));
  });

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('mobile-open');
    });

    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('mobile-open') && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
        sidebar.classList.remove('mobile-open');
      }
    });
  }

  window.showSection = showSection;
})();

(function todoModule() {
  const STORAGE_KEY = 'todoTasks';
  const form = document.getElementById('todoForm');
  const input = document.getElementById('todoInput');
  const list = document.getElementById('todoList');
  const emptyState = document.getElementById('todoEmpty');

  let tasks = loadTasks();

  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function render() {
    list.innerHTML = '';
    emptyState.style.display = tasks.length === 0 ? 'flex' : 'none';

    tasks.forEach((task) => {
      const li = document.createElement('li');
      li.className = 'item-row';
      li.dataset.id = task.id;
      if (task.completed) li.classList.add('completed');
      if (task.important) li.classList.add('important');

      li.innerHTML = `
        <button class="item-check" data-action="toggle" aria-label="Toggle complete">
          <i data-lucide="check"></i>
        </button>
        <span class="item-text">${escapeHtml(task.text)}</span>
        <input type="text" class="edit-input" value="${escapeHtml(task.text)}">
        <div class="item-actions">
          <button class="icon-btn edit-btn" data-action="edit" aria-label="Edit task">
            <i data-lucide="pencil"></i>
          </button>
          <button class="icon-btn star-btn ${task.important ? 'star-active' : ''}" data-action="important" aria-label="Mark important">
            <i data-lucide="star"></i>
          </button>
          <button class="icon-btn delete-btn" data-action="delete" aria-label="Delete task">
            <i data-lucide="trash-2"></i>
          </button>
          <button class="icon-btn save-btn" data-action="save" aria-label="Save changes">
            <i data-lucide="check"></i>
          </button>
          <button class="icon-btn cancel-btn" data-action="cancel" aria-label="Cancel editing">
            <i data-lucide="x"></i>
          </button>
        </div>
      `;
      list.appendChild(li);
    });

    lucide.createIcons();
  }

  function addTask(text) {
    tasks.push({
      id: Date.now().toString(),
      text,
      completed: false,
      important: false,
    });
    saveTasks();
    render();
    window.updateDashboardBadges();
  }

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const row = btn.closest('.item-row');
    const id = row.dataset.id;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    if (btn.dataset.action === 'toggle') {
      task.completed = !task.completed;
      saveTasks();
      render();
    }
    else if (btn.dataset.action === 'important') {
      task.important = !task.important;
      saveTasks();
      render();
    }
    else if (btn.dataset.action === 'delete') {
      tasks = tasks.filter((t) => t.id !== id);
      saveTasks();
      render();
    }
    else if (btn.dataset.action === 'edit') {
      render(); // Reset other active edits
      const activeRow = list.querySelector(`[data-id="${id}"]`);
      if (activeRow) {
        activeRow.classList.add('editing');
        const inputEl = activeRow.querySelector('.edit-input');
        if (inputEl) {
          inputEl.focus();
          const val = inputEl.value;
          inputEl.value = '';
          inputEl.value = val;
        }
      }
      return;
    }
    else if (btn.dataset.action === 'save') {
      const inputEl = row.querySelector('.edit-input');
      const value = inputEl ? inputEl.value.trim() : '';
      if (value) {
        task.text = value;
        saveTasks();
      }
      render();
    }
    else if (btn.dataset.action === 'cancel') {
      render();
    }

    window.updateDashboardBadges();
  });

  list.addEventListener('keydown', (e) => {
    const inputEl = e.target.closest('.edit-input');
    if (!inputEl) return;

    const row = inputEl.closest('.item-row');
    const id = row.dataset.id;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      const value = inputEl.value.trim();
      if (value) {
        task.text = value;
        saveTasks();
        render();
        window.updateDashboardBadges();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      render();
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    addTask(value);
    input.value = '';
    input.focus();
  });

  render();
})();

(function plannerModule() {
  const STORAGE_KEY = 'dailyPlanner';
  const container = document.getElementById('plannerList');
  const START_HOUR = 6;
  const END_HOUR = 22;

  let planData = loadPlan();
  let saveTimeout = null;

  function loadPlan() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function savePlanDebounced() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(planData));
      window.updateDashboardBadges();
    }, 400);
  }

  function formatHour(hour) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:00 ${period}`;
  }

  function render() {
    container.innerHTML = '';
    const currentHour = new Date().getHours();

    for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
      const key = String(hour).padStart(2, '0');
      const row = document.createElement('div');
      row.className = 'planner-row';
      if (hour === currentHour) row.classList.add('current-hour');

      row.innerHTML = `
        <span class="planner-time">${formatHour(hour)}</span>
        <input
          type="text"
          class="planner-input"
          data-hour="${key}"
          placeholder="Add a plan..."
          value="${escapeHtml(planData[key] || '')}"
        >
      `;
      container.appendChild(row);
    }
  }

  container.addEventListener('input', (e) => {
    const inputEl = e.target.closest('.planner-input');
    if (!inputEl) return;
    const hour = inputEl.dataset.hour;
    const value = inputEl.value;

    if (value.trim() === '') {
      delete planData[hour];
    } else {
      planData[hour] = value;
    }
    savePlanDebounced();
  });

  setInterval(render, 60 * 1000);
  render();
})();

(function goalsModule() {
  const STORAGE_KEY = 'dailyGoals';
  const form = document.getElementById('goalForm');
  const input = document.getElementById('goalInput');
  const list = document.getElementById('goalsList');
  const emptyState = document.getElementById('goalsEmpty');
  const progressBar = document.getElementById('goalsProgressBar');
  const progressText = document.getElementById('goalsProgressText');

  let goals = loadGoals();

  function loadGoals() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveGoals() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }

  function updateProgress() {
    const completedCount = goals.filter((g) => g.completed).length;
    const total = goals.length;
    const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);

    progressBar.style.width = `${percent}%`;
    progressText.textContent = `${completedCount} of ${total} completed`;
  }

  function render() {
    list.innerHTML = '';
    emptyState.style.display = goals.length === 0 ? 'flex' : 'none';

    goals.forEach((goal) => {
      const li = document.createElement('li');
      li.className = 'item-row';
      li.dataset.id = goal.id;
      if (goal.completed) li.classList.add('completed');

      li.innerHTML = `
        <button class="item-check" data-action="toggle" aria-label="Toggle complete">
          <i data-lucide="check"></i>
        </button>
        <span class="item-text">${escapeHtml(goal.text)}</span>
        <input type="text" class="edit-input" value="${escapeHtml(goal.text)}">
        <div class="item-actions">
          <button class="icon-btn edit-btn" data-action="edit" aria-label="Edit goal">
            <i data-lucide="pencil"></i>
          </button>
          <button class="icon-btn delete-btn" data-action="delete" aria-label="Delete goal">
            <i data-lucide="trash-2"></i>
          </button>
          <button class="icon-btn save-btn" data-action="save" aria-label="Save changes">
            <i data-lucide="check"></i>
          </button>
          <button class="icon-btn cancel-btn" data-action="cancel" aria-label="Cancel editing">
            <i data-lucide="x"></i>
          </button>
        </div>
      `;
      list.appendChild(li);
    });

    updateProgress();
    lucide.createIcons();
  }

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const row = btn.closest('.item-row');
    const id = row.dataset.id;
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;

    if (btn.dataset.action === 'toggle') {
      goal.completed = !goal.completed;
      saveGoals();
      render();
    }
    else if (btn.dataset.action === 'delete') {
      goals = goals.filter((g) => g.id !== id);
      saveGoals();
      render();
    }
    else if (btn.dataset.action === 'edit') {
      render(); // Reset other active edits
      const activeRow = list.querySelector(`[data-id="${id}"]`);
      if (activeRow) {
        activeRow.classList.add('editing');
        const inputEl = activeRow.querySelector('.edit-input');
        if (inputEl) {
          inputEl.focus();
          const val = inputEl.value;
          inputEl.value = '';
          inputEl.value = val;
        }
      }
      return;
    }
    else if (btn.dataset.action === 'save') {
      const inputEl = row.querySelector('.edit-input');
      const value = inputEl ? inputEl.value.trim() : '';
      if (value) {
        goal.text = value;
        saveGoals();
      }
      render();
    }
    else if (btn.dataset.action === 'cancel') {
      render();
    }

    window.updateDashboardBadges();
  });

  list.addEventListener('keydown', (e) => {
    const inputEl = e.target.closest('.edit-input');
    if (!inputEl) return;

    const row = inputEl.closest('.item-row');
    const id = row.dataset.id;
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      const value = inputEl.value.trim();
      if (value) {
        goal.text = value;
        saveGoals();
        render();
        window.updateDashboardBadges();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      render();
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (!value) return;

    goals.push({ id: Date.now().toString(), text: value, completed: false });
    saveGoals();
    render();
    window.updateDashboardBadges();
    input.value = '';
    input.focus();
  });

  render();
})();

(function pomodoroModule() {
  const display = document.getElementById('pomodoroDisplay');
  const label = document.getElementById('pomodoroLabel');
  const startBtn = document.getElementById('pomodoroStart');
  const pauseBtn = document.getElementById('pomodoroPause');
  const resetBtn = document.getElementById('pomodoroReset');
  const modeButtons = document.querySelectorAll('.mode-btn');

  let totalSeconds = 25 * 60;
  let remainingSeconds = totalSeconds;
  let intervalId = null;
  let currentLabel = 'Work Session';

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  function updateDisplay() {
    const timeStr = formatTime(remainingSeconds);
    display.textContent = timeStr;

    const pomodoroBadge = document.getElementById('pomodoroBadge');
    if (pomodoroBadge) {
      pomodoroBadge.textContent = intervalId ? timeStr : 'Idle';
    }

    const pomodoroSidebarBadge = document.getElementById('pomodoroSidebarBadge');
    if (pomodoroSidebarBadge) {
      pomodoroSidebarBadge.textContent = intervalId ? timeStr : 'Focus';
      pomodoroSidebarBadge.style.display = intervalId ? 'inline-block' : 'none';
    }
  }

  function tick() {
    remainingSeconds--;
    updateDisplay();

    if (remainingSeconds <= 0) {
      clearInterval(intervalId);
      intervalId = null;
      notifySessionEnd();
    }
  }

  function notifySessionEnd() {
    label.textContent = 'Session complete!';
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const oscillator = ctx.createOscillator();
      oscillator.frequency.value = 880;
      oscillator.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.4);
    } catch {}
    setTimeout(() => { label.textContent = currentLabel; }, 3000);
    updateDisplay();
  }

  function startTimer() {
    if (intervalId !== null) return;
    intervalId = setInterval(tick, 1000);
    updateDisplay();
  }

  function pauseTimer() {
    clearInterval(intervalId);
    intervalId = null;
    updateDisplay();
  }

  function resetTimer() {
    clearInterval(intervalId);
    intervalId = null;
    remainingSeconds = totalSeconds;
    updateDisplay();
  }

  startBtn.addEventListener('click', startTimer);
  pauseBtn.addEventListener('click', pauseTimer);
  resetBtn.addEventListener('click', resetTimer);

  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      modeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const minutes = parseInt(btn.dataset.minutes, 10);
      totalSeconds = minutes * 60;
      currentLabel = minutes === 25 ? 'Work Session' : 'Break Session';
      label.textContent = currentLabel;

      resetTimer();
    });
  });

  updateDisplay();
})();

(function quoteModule() {
  const quoteCard = document.getElementById('quoteCard');
  const quoteText = document.getElementById('quoteText');
  const quoteAuthor = document.getElementById('quoteAuthor');
  const newQuoteBtn = document.getElementById('newQuoteBtn');

  const FALLBACK_QUOTES = [
    { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
    { text: 'Small steps every day add up to big results.', author: 'Unknown' },
    { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Unknown' },
    { text: 'Focus on progress, not perfection.', author: 'Unknown' },
    { text: 'Well done is better than well said.', author: 'Benjamin Franklin' },
  ];

  function setLoadingState() {
    quoteCard.classList.add('loading');
  }

  function clearLoadingState() {
    quoteCard.classList.remove('loading');
  }

  function showQuote(text, author) {
    quoteText.textContent = `"${text}"`;
    quoteAuthor.textContent = author ? `— ${author}` : '';
  }

  function showFallbackQuote() {
    const random = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
    showQuote(random.text, random.author);
  }

  async function fetchQuote() {
    setLoadingState();
    newQuoteBtn.disabled = true;

    try {
      const response = await fetch('https://api.quotable.io/random');
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      showQuote(data.content, data.author);
    } catch (err) {
      showFallbackQuote();
    } finally {
      clearLoadingState();
      newQuoteBtn.disabled = false;
    }
  }

  newQuoteBtn.addEventListener('click', fetchQuote);
  fetchQuote();
})();

(function weatherModule() {
  const tempEl = document.getElementById('weatherTemp');
  const conditionEl = document.getElementById('weatherCondition');
  const locationEl = document.getElementById('weatherLocation');
  const windEl = document.getElementById('weatherWind');
  const iconEl = document.getElementById('weatherIcon');

  const FALLBACK_LOCATION = { name: 'New Delhi', lat: 28.6139, lon: 77.209 };

  const WEATHER_CODE_MAP = {
    0: { text: 'Clear sky', icon: 'sun' },
    1: { text: 'Mainly clear', icon: 'cloud-sun' },
    2: { text: 'Partly cloudy', icon: 'cloud-sun' },
    3: { text: 'Overcast', icon: 'cloud' },
    45: { text: 'Fog', icon: 'cloud-fog' },
    48: { text: 'Fog', icon: 'cloud-fog' },
    51: { text: 'Light drizzle', icon: 'cloud-drizzle' },
    61: { text: 'Rain', icon: 'cloud-rain' },
    71: { text: 'Snow', icon: 'snowflake' },
    80: { text: 'Rain showers', icon: 'cloud-rain' },
    95: { text: 'Thunderstorm', icon: 'zap' },
  };

  function describeWeatherCode(code) {
    return WEATHER_CODE_MAP[code] || { text: 'Weather unavailable', icon: 'cloud' };
  }

  async function fetchWeather(lat, lon, locationName) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Weather request failed');

      const data = await response.json();
      const current = data.current_weather;
      const description = describeWeatherCode(current.weathercode);

      tempEl.textContent = `${Math.round(current.temperature)}°C`;
      conditionEl.textContent = description.text;
      windEl.textContent = `${Math.round(current.windspeed)} km/h`;
      locationEl.textContent = locationName;

      iconEl.setAttribute('data-lucide', description.icon);
      lucide.createIcons();
    } catch (err) {
      conditionEl.textContent = 'Weather unavailable';
      tempEl.textContent = '--°C';
      locationEl.textContent = locationName;
    }
  }

  function useFallbackLocation() {
    fetchWeather(FALLBACK_LOCATION.lat, FALLBACK_LOCATION.lon, FALLBACK_LOCATION.name);
  }

  function init() {
    if (!navigator.geolocation) {
      useFallbackLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeather(latitude, longitude, 'Your Location');
      },
      () => {
        useFallbackLocation();
      },
      { timeout: 8000 }
    );
  }

  init();
})();

(function dateTimeModule() {
  const timeEl = document.getElementById('timeDisplay');
  const dateEl = document.getElementById('dateDisplay');
  const hourHand = document.getElementById('hourHand');
  const minuteHand = document.getElementById('minuteHand');
  const secondHand = document.getElementById('secondHand');

  function updateDateTime() {
    const now = new Date();

    const timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const dateString = now.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    if (timeEl) timeEl.textContent = timeString;
    if (dateEl) dateEl.textContent = dateString;
  }

  function updateAnalogClock() {
    const now = new Date();
    const ms = now.getMilliseconds();
    const secs = now.getSeconds() + ms / 1000;
    const mins = now.getMinutes() + secs / 60;
    const hours = (now.getHours() % 12) + mins / 60;

    const secsAngle = secs * 6;
    const minsAngle = mins * 6;
    const hoursAngle = hours * 30;

    if (secondHand) secondHand.style.transform = `rotate(${secsAngle}deg)`;
    if (minuteHand) minuteHand.style.transform = `rotate(${minsAngle}deg)`;
    if (hourHand) hourHand.style.transform = `rotate(${hoursAngle}deg)`;

    requestAnimationFrame(updateAnalogClock);
  }

  updateDateTime();
  setInterval(updateDateTime, 1000);
  updateAnalogClock();
})();

(function dynamicBackgroundModule() {
  const bgLayer = document.getElementById('dynamicBackground');

  const GRADIENTS = {
    morning: 'linear-gradient(160deg, #ffe8c9 0%, #fef6e4 60%)',
    afternoon: 'linear-gradient(160deg, #cfe8ff 0%, #f3f5f9 60%)',
    evening: 'linear-gradient(160deg, #ffd3c2 0%, #f7e2e9 60%)',
    night: 'linear-gradient(160deg, #1e2640 0%, #0b1220 60%)',
  };

  function getTimeCategory(hour) {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  function applyBackground() {
    const hour = new Date().getHours();
    const category = getTimeCategory(hour);
    bgLayer.style.background = GRADIENTS[category];
  }

  applyBackground();
  setInterval(applyBackground, 10 * 60 * 1000);
})();

(function themeModule() {
  const toggleBtn = document.getElementById('themeToggle');
  const icon = toggleBtn.querySelector('i');
  const root = document.documentElement;
  const bgVideo = document.getElementById('bgVideo');
  const bgVideoDark = document.getElementById('bgVideoDark');
  const sidebarBgVideo = document.getElementById('sidebarBgVideo');
  const sidebarBgVideoDark = document.getElementById('sidebarBgVideoDark');

  function syncIcon() {
    const theme = root.getAttribute('data-theme');
    icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
    lucide.createIcons();
  }

  function syncVideoBackground() {
    const theme = root.getAttribute('data-theme') || 'light';
    if (theme === 'light') {
      if (bgVideo) {
        bgVideo.play().catch((err) => {
          console.log("Main video auto-play prevented or failed: ", err);
        });
      }
      if (sidebarBgVideo) {
        sidebarBgVideo.play().catch((err) => {
          console.log("Sidebar video auto-play prevented or failed: ", err);
        });
      }
      if (bgVideoDark) bgVideoDark.pause();
      if (sidebarBgVideoDark) sidebarBgVideoDark.pause();
    } else {
      if (bgVideoDark) {
        bgVideoDark.play().catch((err) => {
          console.log("Dark video auto-play prevented or failed: ", err);
        });
      }
      if (sidebarBgVideoDark) {
        sidebarBgVideoDark.play().catch((err) => {
          console.log("Sidebar dark video auto-play prevented or failed: ", err);
        });
      }
      if (bgVideo) bgVideo.pause();
      if (sidebarBgVideo) sidebarBgVideo.pause();
    }
  }

  toggleBtn.addEventListener('click', () => {
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    syncIcon();
    syncVideoBackground();
  });

  syncIcon();
  syncVideoBackground();

  document.addEventListener('click', () => {
    syncVideoBackground();
  }, { once: true });
})();

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  window.updateDashboardBadges();
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
