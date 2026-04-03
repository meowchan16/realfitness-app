const STORAGE_KEY = "forgefit-tracker-data-v3";

const bmiForm = document.getElementById("bmiForm");
const weightInput = document.getElementById("bmiWeight");
const heightInput = document.getElementById("bmiHeight");
const bmiValue = document.getElementById("bmiValue");
const bmiCategory = document.getElementById("bmiCategory");
const bmiNote = document.getElementById("bmiNote");

prefillSavedValues();
bmiForm.addEventListener("submit", handleBmiSubmit);

function prefillSavedValues() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);
    weightInput.value = parsed.metrics?.weight ?? "";
    heightInput.value = parsed.metrics?.height ?? "";
  } catch {
    return;
  }
}

function handleBmiSubmit(event) {
  event.preventDefault();

  const weight = Number(weightInput.value);
  const heightCm = Number(heightInput.value);
  const heightM = heightCm / 100;
  const bmi = weight / (heightM * heightM);
  const category = getBmiCategory(bmi);

  bmiValue.textContent = bmi.toFixed(1);
  bmiCategory.textContent = category;
  bmiNote.textContent = `Based on ${weight.toFixed(1)} kg and ${heightCm.toFixed(
    1,
  )} cm, your BMI is ${bmi.toFixed(1)}.`;
}

function getBmiCategory(bmi) {
  if (bmi < 18.5) {
    return "Underweight";
  }

  if (bmi < 25) {
    return "Normal";
  }

  if (bmi < 30) {
    return "Overweight";
  }

  return "Obese";
}
