import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";

function getBmiDetails(heightCm, weightKg) {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
    return {
      bmi: "--",
      status: "Add valid values",
      message: "Enter a valid height and weight to calculate BMI.",
      extraWeight: "0.0"
    };
  }

  const heightMeters = heightCm / 100;
  const bmi = weightKg / (heightMeters * heightMeters);
  let status = "Normal";
  let message = "You are in the healthy range.";

  if (bmi < 18.5) {
    status = "Underweight";
    message = "You are below the normal range and may need to gain healthy weight.";
  } else if (bmi >= 25 && bmi < 30) {
    status = "Overweight";
    message = "You are above the normal range and can work toward a healthier target.";
  } else if (bmi >= 30) {
    status = "Obese";
    message = "Your BMI is well above the normal range and should be improved carefully.";
  }

  const healthyMax = 24.9 * (heightMeters * heightMeters);
  const extraWeight = Math.max(weightKg - healthyMax, 0);

  return {
    bmi: bmi.toFixed(1),
    status,
    message,
    extraWeight: extraWeight.toFixed(1)
  };
}

function BmiPage() {
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(72);

  useEffect(() => {
    document.title = "RealFitness BMI";
  }, []);

  const result = useMemo(() => getBmiDetails(height, weight), [height, weight]);

  return (
    <section className="simple-page-shell">
      <div className="simple-page-card">
        <PageHeader
          eyebrow="BMI Check"
          title="Check body mass index using height and weight."
          description="Use this quick calculator to understand whether you are below, inside, or above the healthy BMI range."
        />

        <div className="metric-grid">
          <label className="metric-card">
            <span>Height (cm)</span>
            <input
              type="number"
              value={height}
              min="100"
              max="250"
              onChange={(event) => setHeight(Number(event.target.value))}
            />
          </label>
          <label className="metric-card">
            <span>Weight (kg)</span>
            <input
              type="number"
              value={weight}
              min="20"
              max="250"
              onChange={(event) => setWeight(Number(event.target.value))}
            />
          </label>
        </div>

        <div className="result-card">
          <span className="feature-label">Your Result</span>
          <h2>BMI: {result.bmi}</h2>
          <p className="result-status">{result.status}</p>
          <p>{result.message}</p>
          <p>
            Approximate extra weight above the healthy range: <strong>{result.extraWeight} kg</strong>
          </p>
        </div>
      </div>
    </section>
  );
}

export default BmiPage;
