from fastapi.testclient import TestClient

try:
  from main import app  # type: ignore
except Exception:
  import sys
  import os
  sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
  from main import app  # type: ignore

client = TestClient(app)


def test_rl_configure_train_act_smoke():
    resp = client.post("/api/v1/rl/configure", json={"env_name": "clinical-optimizer", "config": {"gamma": 0.99}})
    assert resp.status_code == 200, resp.text
    resp = client.post("/api/v1/rl/train", json={"env_name": "clinical-optimizer", "episodes": 3})
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data.get("status") == "ok" and "avg_reward" in data
    resp = client.post("/api/v1/rl/act", json={"env_name": "clinical-optimizer", "state": {"patient_age": 45}})
    assert resp.status_code == 200, resp.text
    assert "action" in resp.json()


def test_federated_register_round_model_smoke():
    resp = client.post("/api/v1/federated/register_clients", json={"clients": ["c1", "c2"]})
    assert resp.status_code == 200, resp.text
    resp = client.post("/api/v1/federated/run_round", json={"client_updates": [{"acc": 0.8}, {"acc": 0.9}]})
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data.get("status") == "ok" and "global_acc" in data
    resp = client.get("/api/v1/federated/global_model")
    assert resp.status_code == 200, resp.text
    assert resp.json().get("status") == "success"


