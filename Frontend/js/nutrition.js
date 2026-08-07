let nutritionList = [];

document.addEventListener("DOMContentLoaded", async () => {
    await loadNutritionData();

    const selectEl = document.getElementById("nutritionFoodSelect");
    if (selectEl) {
        selectEl.addEventListener("change", updateNutritionDisplay);
    }
});

async function loadNutritionData() {
    const selectEl = document.getElementById("nutritionFoodSelect");
    if (!selectEl) return;

    try {
        nutritionList = await apiCall('/nutrition/').catch(() => []);
        if (!nutritionList || nutritionList.length === 0) {
            selectEl.innerHTML = `<option value="">No nutrition data available</option>`;
            return;
        }

        selectEl.innerHTML = nutritionList.map((item, index) => `
            <option value="${index}">${item.item_name}</option>
        `).join('');

        updateNutritionDisplay();
    } catch (err) {
        console.error("Error loading nutrition data:", err);
    }
}

function updateNutritionDisplay() {
    const selectEl = document.getElementById("nutritionFoodSelect");
    if (!selectEl || nutritionList.length === 0) return;

    const index = parseInt(selectEl.value) || 0;
    const item = nutritionList[index];

    if (item) {
        document.getElementById("nutCalories").textContent = item.calories || 0;
        document.getElementById("nutProtein").textContent = item.protein || 0;
        document.getElementById("nutCarbs").textContent = item.carbohydrates || 0;
        document.getElementById("nutFat").textContent = item.fat || 0;
    }
}