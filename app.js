/**
 * NutriTrack - Pure Vanilla JavaScript Calorie & Nutrition Tracker
 * Zero backend, persistent localStorage, clean modular design
 */

(function () {
  'use strict';

  // ==========================================================================
  // Storage Keys & Default State
  // ==========================================================================
  const STORAGE_KEYS = {
    GOALS: 'nutritrack_goals',
    ENTRIES: 'nutritrack_entries',
    WATER: 'nutritrack_water'
  };

  const DEFAULT_GOALS = {
    calories: 2000,
    protein: 140,
    carbs: 220,
    fat: 65,
    water: 2500
  };

  // Popular Quick-Fill Food Items
  const PRESET_FOODS = [
    { name: '🥚 Boiled Egg (2 large)', calories: 156, protein: 12, carbs: 1.2, fat: 10, portion: '2 eggs', meal: 'breakfast' },
    { name: '🥣 Oatmeal with Milk', calories: 240, protein: 9, carbs: 42, fat: 4.5, portion: '1 bowl (60g oats)', meal: 'breakfast' },
    { name: '🍗 Grilled Chicken Breast', calories: 195, protein: 36, carbs: 0, fat: 4.2, portion: '180g cooked', meal: 'lunch' },
    { name: '🍚 Cooked White Rice', calories: 205, protein: 4.2, carbs: 45, fat: 0.4, portion: '1 cup (160g)', meal: 'lunch' },
    { name: '🥗 Mixed Garden Salad', calories: 95, protein: 2.5, carbs: 12, fat: 4, portion: '1 large bowl', meal: 'lunch' },
    { name: '🍣 Baked Salmon Fillet', calories: 290, protein: 34, carbs: 0, fat: 16, portion: '170g', meal: 'dinner' },
    { name: '🥔 Roasted Sweet Potato', calories: 130, protein: 2.5, carbs: 30, fat: 0.2, portion: '1 medium (150g)', meal: 'dinner' },
    { name: '🥦 Steamed Broccoli', calories: 55, protein: 4, carbs: 11, fat: 0.6, portion: '1.5 cups', meal: 'dinner' },
    { name: '🍌 Ripe Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, portion: '1 medium', meal: 'snack' },
    { name: '🥛 Greek Yogurt 0%', calories: 120, protein: 17, carbs: 6, fat: 0.5, portion: '1 container (170g)', meal: 'snack' },
    { name: '🥜 Raw Almonds', calories: 165, protein: 6, carbs: 6, fat: 14, portion: '1 small handful (28g)', meal: 'snack' },
    { name: '🥤 Whey Protein Shake', calories: 140, protein: 26, carbs: 3, fat: 2, portion: '1 scoop with water', meal: 'snack' }
  ];

  // App Runtime State
  let state = {
    currentDateStr: getTodayString(),
    goals: loadGoals(),
    entries: loadEntries(),
    waterLog: loadWaterLog()
  };

  // SVG Gauge constant: 2 * PI * 74 = ~464.955
  const GAUGE_CIRCUMFERENCE = 464.955;

  // ==========================================================================
  // Helper Functions
  // ==========================================================================

  function getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function parseDateYMD(str) {
    const parts = str.split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }

  function formatDateFriendly(dateStr) {
    const today = getTodayString();
    if (dateStr === today) {
      return 'Today';
    }

    const d = parseDateYMD(dateStr);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (dateStr === yesterdayStr) {
      return 'Yesterday';
    }

    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function formatFullDateHeader(dateStr) {
    const d = parseDateYMD(dateStr);
    const friendly = formatDateFriendly(dateStr);
    const monthDay = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    return friendly === 'Today' || friendly === 'Yesterday'
      ? `${friendly} • ${monthDay}`
      : `${d.toLocaleDateString(undefined, { weekday: 'long' })}, ${monthDay}`;
  }

  function generateId() {
    return 'item_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================================================
  // LocalStorage Persistence
  // ==========================================================================

  function loadGoals() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GOALS);
      return data ? { ...DEFAULT_GOALS, ...JSON.parse(data) } : { ...DEFAULT_GOALS };
    } catch (e) {
      console.error('Error loading goals from localStorage', e);
      return { ...DEFAULT_GOALS };
    }
  }

  function saveGoals(newGoals) {
    state.goals = { ...state.goals, ...newGoals };
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(state.goals));
  }

  function loadEntries() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading entries from localStorage', e);
      return [];
    }
  }

  function saveEntries(newEntries) {
    state.entries = newEntries;
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(state.entries));
  }

  function loadWaterLog() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WATER);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Error loading water log from localStorage', e);
      return {};
    }
  }

  function saveWaterLog(newLog) {
    state.waterLog = newLog;
    localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(state.waterLog));
  }

  // ==========================================================================
  // Toast Notifications
  // ==========================================================================

  function showToast(message, isError = false) {
    const container = document.getElementById('toastNotification');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'toast-error' : ''}`;
    toast.innerHTML = `
      <span>${escapeHTML(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // ==========================================================================
  // UI Rendering Core
  // ==========================================================================

  function renderAll() {
    renderDateNav();
    renderCalorieDashboard();
    renderMacrosDashboard();
    renderWaterDashboard();
    renderMealCategories();
    renderWeeklyTrendChart();
  }

  // 1. Date Header & Controls
  function renderDateNav() {
    const labelEl = document.getElementById('currentDateLabel');
    const inputEl = document.getElementById('datePickerInput');
    if (labelEl) labelEl.textContent = formatFullDateHeader(state.currentDateStr);
    if (inputEl) inputEl.value = state.currentDateStr;
  }

  // 2. Calorie Gauge & Math Box
  function renderCalorieDashboard() {
    const currentEntries = state.entries.filter(e => e.date === state.currentDateStr);
    const consumed = currentEntries.reduce((acc, curr) => acc + (Number(curr.calories) || 0), 0);
    const target = state.goals.calories;
    const remaining = target - consumed;
    const percent = target > 0 ? Math.round((consumed / target) * 100) : 0;

    // Elements
    const gaugeBar = document.getElementById('calorieGaugeBar');
    const gaugeVal = document.getElementById('gaugeRemainingVal');
    const gaugeLabel = document.getElementById('gaugeRemainingLabel');
    const statusBadge = document.getElementById('calorieStatusBadge');

    const summaryGoal = document.getElementById('summaryGoalVal');
    const summaryConsumed = document.getElementById('summaryConsumedVal');
    const summaryRemaining = document.getElementById('summaryRemainingVal');
    const summaryPercent = document.getElementById('summaryPercentVal');
    const summarySurplusDeficit = document.getElementById('summarySurplusDeficitText');

    if (summaryGoal) summaryGoal.textContent = target.toLocaleString();
    if (summaryConsumed) summaryConsumed.textContent = consumed.toLocaleString();
    if (summaryPercent) summaryPercent.textContent = `${percent}% of daily target`;

    if (remaining >= 0) {
      if (gaugeVal) gaugeVal.textContent = remaining.toLocaleString();
      if (gaugeLabel) gaugeLabel.textContent = 'kcal left';
      if (summaryRemaining) {
        summaryRemaining.textContent = remaining.toLocaleString();
        summaryRemaining.className = 'text-remaining';
      }
      if (summarySurplusDeficit) summarySurplusDeficit.textContent = 'Available to eat';

      if (statusBadge) {
        statusBadge.textContent = 'On Track';
        statusBadge.className = 'status-badge badge-on-track';
      }
    } else {
      const overBy = Math.abs(remaining);
      if (gaugeVal) gaugeVal.textContent = `+${overBy.toLocaleString()}`;
      if (gaugeLabel) gaugeLabel.textContent = 'kcal over budget';
      if (summaryRemaining) {
        summaryRemaining.textContent = `-${overBy.toLocaleString()}`;
        summaryRemaining.className = 'text-over';
      }
      if (summarySurplusDeficit) summarySurplusDeficit.textContent = 'Exceeded daily limit';

      if (statusBadge) {
        statusBadge.textContent = 'Over Budget';
        statusBadge.className = 'status-badge badge-over-budget';
      }
    }

    // Circular Gauge Stroke Animation
    if (gaugeBar) {
      const clampedRatio = Math.min(consumed / target, 1);
      const offset = GAUGE_CIRCUMFERENCE * (1 - clampedRatio);
      gaugeBar.style.strokeDashoffset = offset;

      if (consumed > target) {
        gaugeBar.classList.add('over-budget');
      } else {
        gaugeBar.classList.remove('over-budget');
      }
    }
  }

  // 3. Macronutrients
  function renderMacrosDashboard() {
    const currentEntries = state.entries.filter(e => e.date === state.currentDateStr);
    
    let totalProt = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    currentEntries.forEach(item => {
      totalProt += Number(item.protein) || 0;
      totalCarbs += Number(item.carbs) || 0;
      totalFat += Number(item.fat) || 0;
    });

    // Round to 1 decimal place
    totalProt = Math.round(totalProt * 10) / 10;
    totalCarbs = Math.round(totalCarbs * 10) / 10;
    totalFat = Math.round(totalFat * 10) / 10;

    const goalProt = state.goals.protein || 1;
    const goalCarbs = state.goals.carbs || 1;
    const goalFat = state.goals.fat || 1;

    // Values text
    document.getElementById('protCurrent').textContent = `${totalProt}g`;
    document.getElementById('protTarget').textContent = `${goalProt}g`;
    document.getElementById('protKcal').textContent = `${Math.round(totalProt * 4)} kcal`;

    document.getElementById('carbsCurrent').textContent = `${totalCarbs}g`;
    document.getElementById('carbsTarget').textContent = `${goalCarbs}g`;
    document.getElementById('carbsKcal').textContent = `${Math.round(totalCarbs * 4)} kcal`;

    document.getElementById('fatCurrent').textContent = `${totalFat}g`;
    document.getElementById('fatTarget').textContent = `${goalFat}g`;
    document.getElementById('fatKcal').textContent = `${Math.round(totalFat * 9)} kcal`;

    // Bars width percentage
    const pPct = Math.min(Math.round((totalProt / goalProt) * 100), 100);
    const cPct = Math.min(Math.round((totalCarbs / goalCarbs) * 100), 100);
    const fPct = Math.min(Math.round((totalFat / goalFat) * 100), 100);

    document.getElementById('protBar').style.width = `${pPct}%`;
    document.getElementById('carbsBar').style.width = `${cPct}%`;
    document.getElementById('fatBar').style.width = `${fPct}%`;
  }

  // 4. Hydration / Water
  function renderWaterDashboard() {
    const currentMl = state.waterLog[state.currentDateStr] || 0;
    const targetMl = state.goals.water || 2500;
    const percent = Math.min(Math.round((currentMl / targetMl) * 100), 100);

    document.getElementById('waterCurrentVal').textContent = currentMl.toLocaleString();
    document.getElementById('waterTargetVal').textContent = targetMl.toLocaleString();
    document.getElementById('waterProgressBar').style.width = `${percent}%`;
  }

  // 5. Meal Categories & Item Rows
  function renderMealCategories() {
    const categories = ['breakfast', 'lunch', 'dinner', 'snack'];
    const currentEntries = state.entries.filter(e => e.date === state.currentDateStr);

    categories.forEach(cat => {
      const catEntries = currentEntries.filter(e => e.meal === cat);
      const listEl = document.getElementById(`list${capitalize(cat)}`);
      const calSubtotalEl = document.getElementById(`cal${capitalize(cat)}`);

      const totalKcal = catEntries.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
      if (calSubtotalEl) {
        calSubtotalEl.textContent = `${totalKcal.toLocaleString()} kcal`;
      }

      if (!listEl) return;

      if (catEntries.length === 0) {
        listEl.innerHTML = `
          <div class="meal-empty-state">
            <span>No items logged yet for ${cat}.</span>
            <small>Tap "+ Add" to record a food or beverage.</small>
          </div>
        `;
        return;
      }

      listEl.innerHTML = catEntries.map(item => {
        const p = Number(item.protein) || 0;
        const c = Number(item.carbs) || 0;
        const f = Number(item.fat) || 0;
        const hasMacros = p > 0 || c > 0 || f > 0;

        return `
          <div class="food-item-row" data-id="${item.id}">
            <div class="food-item-info">
              <div class="food-item-name">
                ${escapeHTML(item.name)}
                ${item.portion ? `<span class="food-item-portion">(${escapeHTML(item.portion)})</span>` : ''}
              </div>
              ${hasMacros ? `
                <div class="food-item-macros">
                  ${p > 0 ? `<span class="macro-tag macro-tag-p">P: ${p}g</span>` : ''}
                  ${c > 0 ? `<span class="macro-tag macro-tag-c">C: ${c}g</span>` : ''}
                  ${f > 0 ? `<span class="macro-tag macro-tag-f">F: ${f}g</span>` : ''}
                </div>
              ` : ''}
            </div>

            <div class="food-item-right">
              <span class="food-item-calories">${Number(item.calories).toLocaleString()} <small>kcal</small></span>
              <div class="food-item-actions">
                <button type="button" class="item-action-btn item-action-edit" data-edit-id="${item.id}" title="Edit entry" aria-label="Edit food">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button type="button" class="item-action-btn item-action-delete" data-delete-id="${item.id}" title="Delete entry" aria-label="Delete food">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    });
  }

  // 6. 7-Day Trend Chart
  function renderWeeklyTrendChart() {
    const container = document.getElementById('historyChartContainer');
    const statsContainer = document.getElementById('historyStatsRow');
    if (!container) return;

    // Compute last 7 days ending with currentDate
    const activeDate = parseDateYMD(state.currentDateStr);
    const daysData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(activeDate);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      const dayEntries = state.entries.filter(e => e.date === dateStr);
      const dayKcal = dayEntries.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);

      daysData.push({
        dateStr,
        dayName: d.toLocaleDateString(undefined, { weekday: 'short' }),
        dayNumber: d.getDate(),
        calories: dayKcal,
        isActive: dateStr === state.currentDateStr
      });
    }

    const goal = state.goals.calories;
    const maxDayCalories = Math.max(...daysData.map(d => d.calories), goal * 1.15, 2200);

    // Goal line calculation (percentage from bottom of track)
    const goalLinePercent = Math.min(Math.round((goal / maxDayCalories) * 100), 95);

    // Render Chart HTML
    container.innerHTML = `
      <div class="history-goal-line" style="bottom: calc(${goalLinePercent}% + 36px);">
        <span class="history-goal-tag">Target: ${goal.toLocaleString()} kcal</span>
      </div>
      ${daysData.map(day => {
        const heightPct = day.calories > 0
          ? Math.max(Math.round((day.calories / maxDayCalories) * 100), 5)
          : 0;

        let barClass = 'bar-normal';
        if (day.calories === 0) barClass = 'bar-empty';
        else if (day.calories > goal) barClass = 'bar-exceeded';

        return `
          <div class="history-bar-col ${day.isActive ? 'is-active' : ''}" data-nav-date="${day.dateStr}" title="${day.dateStr}: ${day.calories.toLocaleString()} kcal">
            <div class="history-bar-track">
              ${day.calories > 0 ? `<span class="history-bar-val">${day.calories > 999 ? (day.calories / 1000).toFixed(1) + 'k' : day.calories}</span>` : ''}
              <div class="history-bar-fill ${barClass}" style="height: ${heightPct}%;"></div>
            </div>
            <span class="history-bar-label">${escapeHTML(day.dayName)} ${day.dayNumber}</span>
          </div>
        `;
      }).join('')}
    `;

    // Render Stats Row (Weekly average, logged days)
    if (statsContainer) {
      const loggedDays = daysData.filter(d => d.calories > 0);
      const totalLoggedKcal = loggedDays.reduce((acc, d) => acc + d.calories, 0);
      const averageKcal = loggedDays.length > 0 ? Math.round(totalLoggedKcal / loggedDays.length) : 0;
      const onTargetDays = daysData.filter(d => d.calories > 0 && d.calories <= goal).length;

      statsContainer.innerHTML = `
        <div class="history-stat-chip">
          <span>7-Day Average:</span>
          <strong>${averageKcal.toLocaleString()} kcal/day</strong>
        </div>
        <div class="history-stat-chip">
          <span>Days Logged:</span>
          <strong>${loggedDays.length} / 7 days</strong>
        </div>
        <div class="history-stat-chip">
          <span>Target Met:</span>
          <strong>${onTargetDays} days</strong>
        </div>
      `;
    }
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ==========================================================================
  // Preset Chips Population
  // ==========================================================================

  function populatePresetChips() {
    const container = document.getElementById('presetPillsContainer');
    if (!container) return;

    container.innerHTML = PRESET_FOODS.map((item, idx) => `
      <button type="button" class="preset-chip" data-preset-idx="${idx}">
        ${escapeHTML(item.name)} (${item.calories} kcal)
      </button>
    `).join('');
  }

  function applyPresetFood(index) {
    const item = PRESET_FOODS[index];
    if (!item) return;

    document.getElementById('foodNameInput').value = item.name.replace(/^[^\w\s]+\s*/, ''); // strip leading emoji
    document.getElementById('foodCaloriesInput').value = item.calories;
    document.getElementById('foodPortionInput').value = item.portion || '';
    document.getElementById('foodProteinInput').value = item.protein !== undefined ? item.protein : '';
    document.getElementById('foodCarbsInput').value = item.carbs !== undefined ? item.carbs : '';
    document.getElementById('foodFatInput').value = item.fat !== undefined ? item.fat : '';

    if (item.meal) {
      document.getElementById('foodMealSelect').value = item.meal;
    }
  }

  // ==========================================================================
  // Modal Management
  // ==========================================================================

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      m.classList.remove('open');
      m.setAttribute('aria-hidden', 'true');
    });
    document.body.style.overflow = '';
  }

  // ==========================================================================
  // Food Entry Operations
  // ==========================================================================

  function openAddFoodModal(presetMeal = 'breakfast') {
    const form = document.getElementById('foodEntryForm');
    form.reset();

    document.getElementById('foodModalTitle').textContent = 'Log Food Item';
    document.getElementById('editEntryId').value = '';
    document.getElementById('foodMealSelect').value = presetMeal;
    document.getElementById('foodDateInput').value = state.currentDateStr;
    document.getElementById('saveFoodBtn').textContent = 'Add Food';

    openModal('foodModal');
    setTimeout(() => {
      const nameInput = document.getElementById('foodNameInput');
      if (nameInput) nameInput.focus();
    }, 100);
  }

  function openEditFoodModal(entryId) {
    const item = state.entries.find(e => e.id === entryId);
    if (!item) return;

    document.getElementById('foodModalTitle').textContent = 'Edit Food Item';
    document.getElementById('editEntryId').value = item.id;
    document.getElementById('foodMealSelect').value = item.meal;
    document.getElementById('foodDateInput').value = item.date;
    document.getElementById('foodNameInput').value = item.name;
    document.getElementById('foodPortionInput').value = item.portion || '';
    document.getElementById('foodCaloriesInput').value = item.calories;
    document.getElementById('foodProteinInput').value = item.protein !== undefined && item.protein !== null ? item.protein : '';
    document.getElementById('foodCarbsInput').value = item.carbs !== undefined && item.carbs !== null ? item.carbs : '';
    document.getElementById('foodFatInput').value = item.fat !== undefined && item.fat !== null ? item.fat : '';
    document.getElementById('saveFoodBtn').textContent = 'Update Food';

    openModal('foodModal');
  }

  function handleFoodFormSubmit(e) {
    e.preventDefault();

    const editId = document.getElementById('editEntryId').value.trim();
    const meal = document.getElementById('foodMealSelect').value;
    const date = document.getElementById('foodDateInput').value;
    const name = document.getElementById('foodNameInput').value.trim();
    const portion = document.getElementById('foodPortionInput').value.trim();
    const calories = parseFloat(document.getElementById('foodCaloriesInput').value) || 0;
    const protein = parseFloat(document.getElementById('foodProteinInput').value) || 0;
    const carbs = parseFloat(document.getElementById('foodCarbsInput').value) || 0;
    const fat = parseFloat(document.getElementById('foodFatInput').value) || 0;

    if (!name) {
      showToast('Please enter a food name', true);
      return;
    }

    if (editId) {
      // Update existing item
      const index = state.entries.findIndex(entry => entry.id === editId);
      if (index !== -1) {
        state.entries[index] = {
          ...state.entries[index],
          meal,
          date,
          name,
          portion,
          calories,
          protein,
          carbs,
          fat
        };
        saveEntries(state.entries);
        showToast(`Updated "${name}"`);
      }
    } else {
      // Create new item
      const newItem = {
        id: generateId(),
        meal,
        date,
        name,
        portion,
        calories,
        protein,
        carbs,
        fat,
        createdAt: Date.now()
      };
      state.entries.push(newItem);
      saveEntries(state.entries);
      showToast(`Added "${name}" (${calories} kcal)`);
    }

    closeModal('foodModal');
    // If the added item is on a different date, switch to that date
    if (state.currentDateStr !== date) {
      state.currentDateStr = date;
    }
    renderAll();
  }

  function deleteFoodItem(id) {
    const item = state.entries.find(e => e.id === id);
    const itemName = item ? item.name : 'Food item';
    
    state.entries = state.entries.filter(e => e.id !== id);
    saveEntries(state.entries);
    showToast(`Removed "${itemName}"`);
    renderAll();
  }

  // ==========================================================================
  // Goals Configuration Operations
  // ==========================================================================

  function openGoalsModal() {
    document.getElementById('goalCaloriesInput').value = state.goals.calories;
    document.getElementById('goalProteinInput').value = state.goals.protein;
    document.getElementById('goalCarbsInput').value = state.goals.carbs;
    document.getElementById('goalFatInput').value = state.goals.fat;
    document.getElementById('goalWaterInput').value = state.goals.water;

    openModal('goalsModal');
  }

  function handleGoalsFormSubmit(e) {
    e.preventDefault();

    const calories = parseInt(document.getElementById('goalCaloriesInput').value, 10) || DEFAULT_GOALS.calories;
    const protein = parseInt(document.getElementById('goalProteinInput').value, 10) || DEFAULT_GOALS.protein;
    const carbs = parseInt(document.getElementById('goalCarbsInput').value, 10) || DEFAULT_GOALS.carbs;
    const fat = parseInt(document.getElementById('goalFatInput').value, 10) || DEFAULT_GOALS.fat;
    const water = parseInt(document.getElementById('goalWaterInput').value, 10) || DEFAULT_GOALS.water;

    saveGoals({ calories, protein, carbs, fat, water });
    closeModal('goalsModal');
    showToast('Daily nutrition goals updated');
    renderAll();
  }

  function setGoalPreset(calories, protein, carbs, fat, water) {
    document.getElementById('goalCaloriesInput').value = calories;
    document.getElementById('goalProteinInput').value = protein;
    document.getElementById('goalCarbsInput').value = carbs;
    document.getElementById('goalFatInput').value = fat;
    document.getElementById('goalWaterInput').value = water;
  }

  // ==========================================================================
  // Hydration Operations
  // ==========================================================================

  function adjustWater(amount) {
    const current = state.waterLog[state.currentDateStr] || 0;
    const updated = Math.max(0, current + amount);
    state.waterLog[state.currentDateStr] = updated;
    saveWaterLog(state.waterLog);
    renderWaterDashboard();

    if (amount > 0) {
      showToast(`+${amount}ml water logged 💧`);
    }
  }

  // ==========================================================================
  // Sample Data & Backup / Restore
  // ==========================================================================

  function loadSampleRealisticData() {
    const today = getTodayString();
    
    // Yesterday
    const yestDate = new Date();
    yestDate.setDate(yestDate.getDate() - 1);
    const yest = `${yestDate.getFullYear()}-${String(yestDate.getMonth() + 1).padStart(2, '0')}-${String(yestDate.getDate()).padStart(2, '0')}`;

    // 2 Days Ago
    const twoAgoDate = new Date();
    twoAgoDate.setDate(twoAgoDate.getDate() - 2);
    const twoAgo = `${twoAgoDate.getFullYear()}-${String(twoAgoDate.getMonth() + 1).padStart(2, '0')}-${String(twoAgoDate.getDate()).padStart(2, '0')}`;

    const sampleItems = [
      // Today
      { id: generateId(), date: today, meal: 'breakfast', name: 'Scrambled Eggs with Avocado & Toast', portion: '2 eggs + 1 slice', calories: 360, protein: 18, carbs: 22, fat: 20, createdAt: Date.now() },
      { id: generateId(), date: today, meal: 'breakfast', name: 'Black Coffee with Oat Milk', portion: '250ml', calories: 45, protein: 1, carbs: 7, fat: 1.5, createdAt: Date.now() },
      { id: generateId(), date: today, meal: 'lunch', name: 'Grilled Chicken Quinoa Bowl', portion: '1 large bowl', calories: 520, protein: 42, carbs: 54, fat: 12, createdAt: Date.now() },
      { id: generateId(), date: today, meal: 'snack', name: 'Greek Yogurt with Blueberries', portion: '170g', calories: 160, protein: 16, carbs: 18, fat: 2, createdAt: Date.now() },
      { id: generateId(), date: today, meal: 'dinner', name: 'Pan-seared Salmon & Steamed Broccoli', portion: '200g salmon', calories: 460, protein: 38, carbs: 10, fat: 28, createdAt: Date.now() },

      // Yesterday
      { id: generateId(), date: yest, meal: 'breakfast', name: 'Rolled Oats with Honey & Banana', portion: '1 bowl', calories: 340, protein: 10, carbs: 64, fat: 5, createdAt: Date.now() },
      { id: generateId(), date: yest, meal: 'lunch', name: 'Turkey Breast Whole Wheat Wrap', portion: '1 wrap', calories: 480, protein: 35, carbs: 48, fat: 14, createdAt: Date.now() },
      { id: generateId(), date: yest, meal: 'snack', name: 'Handful of Mixed Almonds', portion: '30g', calories: 175, protein: 6, carbs: 6, fat: 15, createdAt: Date.now() },
      { id: generateId(), date: yest, meal: 'dinner', name: 'Lean Beef Stir-fry with Jasmine Rice', portion: '300g total', calories: 610, protein: 45, carbs: 65, fat: 18, createdAt: Date.now() },

      // 2 Days Ago
      { id: generateId(), date: twoAgo, meal: 'breakfast', name: 'Protein Pancakes with Maple Syrup', portion: '3 small', calories: 410, protein: 28, carbs: 52, fat: 9, createdAt: Date.now() },
      { id: generateId(), date: twoAgo, meal: 'lunch', name: 'Tuna Salad with Olive Oil & Greens', portion: '1 plate', calories: 390, protein: 36, carbs: 8, fat: 22, createdAt: Date.now() },
      { id: generateId(), date: twoAgo, meal: 'dinner', name: 'Grilled Chicken Breast & Roasted Potatoes', portion: '1 plate', calories: 540, protein: 44, carbs: 55, fat: 12, createdAt: Date.now() },
      { id: generateId(), date: twoAgo, meal: 'snack', name: 'Dark Chocolate (85%) & Apple', portion: '2 squares + 1 apple', calories: 210, protein: 3, carbs: 32, fat: 10, createdAt: Date.now() }
    ];

    // Hydration sample
    const sampleWater = {
      ...state.waterLog,
      [today]: 1750,
      [yest]: 2250,
      [twoAgo]: 2500
    };

    saveEntries([...state.entries, ...sampleItems]);
    saveWaterLog(sampleWater);

    closeModal('dataModal');
    showToast('Loaded 3 days of realistic balanced meals');
    renderAll();
  }

  function exportData() {
    const backupObj = {
      app: 'NutriTrack',
      version: 1,
      exportedAt: new Date().toISOString(),
      goals: state.goals,
      entries: state.entries,
      waterLog: state.waterLog
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nutritrack-backup-${getTodayString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Backup JSON downloaded');
  }

  function importData(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const imported = JSON.parse(event.target.result);
        if (!imported || (!imported.entries && !imported.goals)) {
          throw new Error('Invalid NutriTrack file format');
        }

        if (imported.goals) saveGoals(imported.goals);
        if (Array.isArray(imported.entries)) saveEntries(imported.entries);
        if (imported.waterLog) saveWaterLog(imported.waterLog);

        closeModal('dataModal');
        showToast('Backup restored successfully!');
        renderAll();
      } catch (err) {
        showToast('Error importing file: invalid format', true);
      }
    };
    reader.readAsText(file);
  }

  function clearAllData() {
    if (window.confirm('Are you sure you want to delete ALL logged food entries and hydration records? This cannot be undone.')) {
      state.entries = [];
      state.waterLog = {};
      saveEntries([]);
      saveWaterLog({});
      closeModal('dataModal');
      showToast('All logs have been cleared');
      renderAll();
    }
  }

  // ==========================================================================
  // Event Listeners & Initialization
  // ==========================================================================

  function bindEvents() {
    // Date Navigation
    document.getElementById('prevDateBtn').addEventListener('click', () => {
      const d = parseDateYMD(state.currentDateStr);
      d.setDate(d.getDate() - 1);
      state.currentDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      renderAll();
    });

    document.getElementById('nextDateBtn').addEventListener('click', () => {
      const d = parseDateYMD(state.currentDateStr);
      d.setDate(d.getDate() + 1);
      state.currentDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      renderAll();
    });

    document.getElementById('todayQuickBtn').addEventListener('click', () => {
      state.currentDateStr = getTodayString();
      renderAll();
    });

    document.getElementById('datePickerInput').addEventListener('change', (e) => {
      if (e.target.value) {
        state.currentDateStr = e.target.value;
        renderAll();
      }
    });

    const dateDisplayBtn = document.getElementById('dateDisplayBtn');
    const datePickerInput = document.getElementById('datePickerInput');
    if (dateDisplayBtn && datePickerInput) {
      dateDisplayBtn.parentElement.addEventListener('click', () => {
        try {
          if (datePickerInput.showPicker) {
            datePickerInput.showPicker();
          }
        } catch (err) {
          // Fallback handled by browser native click
        }
      });
    }

    // Navigation Modals
    document.getElementById('quickAddFoodBtn').addEventListener('click', () => openAddFoodModal('breakfast'));
    document.getElementById('openGoalsBtn').addEventListener('click', openGoalsModal);
    document.getElementById('openDataBtn').addEventListener('click', () => openModal('dataModal'));

    // Category Add Buttons (delegated)
    document.addEventListener('click', (e) => {
      const addMealBtn = e.target.closest('[data-add-meal]');
      if (addMealBtn) {
        const meal = addMealBtn.getAttribute('data-add-meal');
        openAddFoodModal(meal);
        return;
      }

      // Edit item
      const editBtn = e.target.closest('[data-edit-id]');
      if (editBtn) {
        const id = editBtn.getAttribute('data-edit-id');
        openEditFoodModal(id);
        return;
      }

      // Delete item
      const deleteBtn = e.target.closest('[data-delete-id]');
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-delete-id');
        deleteFoodItem(id);
        return;
      }

      // Modal close triggers
      const closeTrigger = e.target.closest('[data-close-modal]');
      if (closeTrigger) {
        const modalId = closeTrigger.getAttribute('data-close-modal');
        closeModal(modalId);
        return;
      }

      // Preset food pill clicked
      const presetPill = e.target.closest('[data-preset-idx]');
      if (presetPill) {
        const idx = parseInt(presetPill.getAttribute('data-preset-idx'), 10);
        applyPresetFood(idx);
        return;
      }

      // History bar clicked
      const historyBar = e.target.closest('[data-nav-date]');
      if (historyBar) {
        const targetDate = historyBar.getAttribute('data-nav-date');
        if (targetDate) {
          state.currentDateStr = targetDate;
          renderAll();
        }
        return;
      }
    });

    // Water tracker buttons
    document.querySelectorAll('[data-water]').forEach(btn => {
      btn.addEventListener('click', () => {
        const amount = parseInt(btn.getAttribute('data-water'), 10) || 0;
        adjustWater(amount);
      });
    });

    // Food Entry Form
    document.getElementById('foodEntryForm').addEventListener('submit', handleFoodFormSubmit);

    // Goals Form
    document.getElementById('goalsForm').addEventListener('submit', handleGoalsFormSubmit);

    // Goal Presets
    document.getElementById('presetDeficitBtn').addEventListener('click', () => setGoalPreset(1600, 140, 140, 53, 2500));
    document.getElementById('presetMaintainBtn').addEventListener('click', () => setGoalPreset(2000, 140, 220, 65, 2500));
    document.getElementById('presetBulkingBtn').addEventListener('click', () => setGoalPreset(2600, 185, 310, 70, 3000));
    document.getElementById('presetKetoBtn').addEventListener('click', () => setGoalPreset(1800, 120, 30, 135, 2800));

    // Data Management
    document.getElementById('loadSampleDataBtn').addEventListener('click', loadSampleRealisticData);
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    document.getElementById('importDataBtn').addEventListener('click', () => {
      document.getElementById('importFileInput').click();
    });
    document.getElementById('importFileInput').addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        importData(e.target.files[0]);
      }
    });
    document.getElementById('clearAllDataBtn').addEventListener('click', clearAllData);

    // Close modal on click backdrop
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal.id);
        }
      });
    });

    // Close modal on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    });
  }

  // ==========================================================================
  // Application Entry Point
  // ==========================================================================

  function init() {
    populatePresetChips();
    bindEvents();
    renderAll();
  }

  // Start when DOM is fully parsed
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
