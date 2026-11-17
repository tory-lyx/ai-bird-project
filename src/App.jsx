
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5113/api/Bird";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState("home");

  async function loadHistory() {
    try {
      const response = await axios.get(`${API}/history`);
      setHistory(response.data);
    } catch (err) {
      console.error("Помилка завантаження історії:", err);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  function handleFile(event) {
    const selected = event.target.files[0];

    if (!selected) return;

    if (!["image/jpeg", "image/png"].includes(selected.type)) {
      setError("Дозволені тільки JPG, JPEG та PNG.");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
    setError("");
  }

  async function analyzeBird() {
    if (!file) {
      setError("Спочатку вибери фотографію птаха.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${API}/analyze`,
        formData
      );

      setResult(response.data);
      loadHistory();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        "Не вдалося виконати аналіз. Перевір, чи працюють сервери."
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteRecord(id) {
    if (!window.confirm("Видалити цей запис?")) return;

    try {
      await axios.delete(`${API}/${id}`);
      loadHistory();
    } catch (err) {
      setError("Не вдалося видалити запис.");
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo" onClick={() => setPage("home")}>
          <span className="logo-icon">🐦</span>
          <div>
            <h2>AI Bird Lab</h2>
            <small>Інтелектуальний світ птахів</small>
          </div>
        </div>

        <nav>
          <button
            className={page === "home" ? "active" : ""}
            onClick={() => setPage("home")}
          >
            Головна
          </button>
          <button
            className={page === "history" ? "active" : ""}
            onClick={() => {
              setPage("history");
              loadHistory();
            }}
          >
            Історія
          </button>
        </nav>
      </header>

      {page === "home" ? (
        <main>
          <section className="hero">
            <div className="hero-content">
              <span className="eyebrow">РОЗУМНЕ РОЗПІЗНАВАННЯ ПТАХІВ</span>
              <h1>
                Відкрий дивовижний
                <br />
                світ <span>птахів</span>
              </h1>
              <p>
                Завантаж фотографію птаха та дозволь штучному
                інтелекту визначити його вид.
              </p>
              <button
                className="main-button"
                onClick={() =>
                  document.getElementById("upload").scrollIntoView({
                    behavior: "smooth"
                  })
                }
              >
                Почати аналіз →
              </button>
            </div>
            <div className="hero-decoration">🦜</div>
          </section>

          <section className="upload-section" id="upload">
            <div className="section-heading">
              <span className="eyebrow">AI ANALYSIS</span>
              <h2>Розпізнай свого птаха</h2>
              <p>Завантаж зображення у форматі JPG або PNG</p>
            </div>

            <div className="upload-card">
              <label className="upload-area">
                {preview ? (
                  <img src={preview} alt="Попередній перегляд" />
                ) : (
                  <>
                    <span className="upload-icon">📷</span>
                    <h3>Перетягни фото сюди</h3>
                    <p>або натисни, щоб вибрати файл</p>
                    <small>JPG, JPEG, PNG</small>
                  </>
                )}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  onChange={handleFile}
                  hidden
                />
              </label>

              {file && (
                <p className="file-name">📎 {file.name}</p>
              )}

              <button
                className="main-button analyze-button"
                onClick={analyzeBird}
                disabled={loading || !file}
              >
                {loading ? "Аналізуємо..." : "🔍 Розпізнати птаха"}
              </button>

              {error && <p className="error">{error}</p>}
            </div>
          </section>

          {result && (
            <section className="result-section">
              <span className="eyebrow">РЕЗУЛЬТАТ АНАЛІЗУ</span>
              <h2>Ми знайшли можливі види!</h2>

              <div className="result-card">
                <img src={preview} alt="Проаналізований птах" />
                <div className="result-content">
                  <h3>{result.predictions?.[0]?.species || result.species || "Птах"}</h3>
                  <p>Найімовірніший результат моделі</p>

                  {(result.predictions || []).map((item, index) => (
                    <div className="prediction" key={index}>
                      <div>
                        <span>{index + 1}. {item.species}</span>
                        <strong>
                          {(item.confidence * 100).toFixed(2)}%
                        </strong>
                      </div>
                      <div className="progress">
                        <div
                          style={{
                            width: `${item.confidence * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="notice">
                Результат є прогнозом штучного інтелекту,
                а не гарантованим визначенням виду.
              </p>
            </section>
          )}

          <section className="features">
            <div>
              <span>🤖</span>
              <h3>Штучний інтелект</h3>
              <p>Розпізнавання видів за допомогою Hugging Face.</p>
            </div>
            <div>
              <span>📚</span>
              <h3>Історія аналізів</h3>
              <p>Збереження результатів у центральній базі даних.</p>
            </div>
            <div>
              <span>🌿</span>
              <h3>Світ птахів</h3>
              <p>Досліджуй різноманіття пташиного світу.</p>
            </div>
          </section>
        </main>
      ) : (
        <main className="history-section">
          <span className="eyebrow">YOUR COLLECTION</span>
          <h1>Історія аналізів</h1>
          <p>Тут зберігаються результати твоїх досліджень.</p>

          {history.length === 0 ? (
            <div className="empty">
              <span>🪺</span>
              <h3>Поки що записів немає</h3>
              <p>Проаналізуй першого птаха!</p>
            </div>
          ) : (
            <div className="history-grid">
              {history.map((item) => (
                <article className="history-card" key={item.id}>
                  <div className="history-icon">🐦</div>
                  <h3>{item.predictedSpecies || item.PredictedSpecies}</h3>
                  <p>{item.imageName || item.ImageName}</p>
                  <p>
                    Впевненість:{" "}
                    {item.confidence != null
                      ? `${(item.confidence * 100).toFixed(2)}%`
                      : "Немає даних"}
                  </p>
                  <small>
                    {item.analysisDate || item.AnalysisDate}
                  </small>
                  <button
                    className="delete-button"
                    onClick={() => deleteRecord(item.id ?? item.Id)}
                  >
                    Видалити
                  </button>
                </article>
              ))}
            </div>
          )}
        </main>
      )}

      <footer>
        <h3>🐦 AI Bird Lab</h3>
        <p>Інтелектуальна система аналізу птахів</p>
        <small>Навчальний проєкт © 2026</small>
      </footer>
    </div>
  );
}

export default App;
