from fastapi.testclient import TestClient

try:
  from ..main import app  # type: ignore
except Exception:
  from ai-services.main import app  # type: ignore

client = TestClient(app)


def test_automl_select_model_smoke():
    payload = {"task_type": "classification", "candidates": ["xgboost", "random_forest"]}
    resp = client.post("/api/v1/automl/select_model", json=payload)
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data.get("status") == "ok"
    assert data.get("selected_model") in ["xgboost", "random_forest", "neural_net"]


def test_automl_tune_smoke():
    payload = {"task_type": "classification", "param_grid": {"max_depth": [3, 5], "n_estimators": [100, 200]}}
    resp = client.post("/api/v1/automl/tune", json=payload)
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data.get("status") == "ok"
    assert isinstance(data.get("best_params"), dict)
    assert "cv_score" in data


def test_automl_feature_select_smoke():
    payload = {"task_type": "classification", "features": ["a", "b", "c", "d"], "k": 2}
    resp = client.post("/api/v1/automl/feature_select", json=payload)
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data.get("status") == "ok"
    assert len(data.get("selected_features", [])) == 2


def test_automl_drift_detect_smoke():
    payload = {"baseline_stats": {"mean": 1.0}, "current_stats": {"mean": 2.2}}
    resp = client.post("/api/v1/automl/drift_detect", json=payload)
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data.get("status") == "ok"
    assert "drift_score" in data and "drift_detected" in data


def test_automl_auto_retrain_smoke():
    payload = {"task_type": "classification", "training_meta": {"epochs": 2}}
    resp = client.post("/api/v1/automl/auto_retrain", json=payload)
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data.get("status") == "ok"
    assert "improved" in data and "model_artifact" in data


