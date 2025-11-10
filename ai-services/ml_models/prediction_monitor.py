"""
Sistema de Monitoreo de Predicciones ML

Monitorea predicciones del modelo en producción para:
- Tracking de predicciones
- Métricas de rendimiento
- Detección de anomalías
- Análisis de confianza
- Feedback médico

"""

import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Sequence
from pathlib import Path
from collections import defaultdict, deque

try:
    import pandas as pd
    HAS_PANDAS = True
except ImportError:
    HAS_PANDAS = False

try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False

try:
    import structlog
    logger = structlog.get_logger()
except ImportError:
    class SimpleLogger:
        def info(self, *args, **kwargs): pass
        def warning(self, *args, **kwargs): print(f"WARNING: {args}")
        def error(self, *args, **kwargs): print(f"ERROR: {args}")
    logger = SimpleLogger()


class PredictionMonitor:
    """Monitor ML predictions in production"""
    
    def __init__(self, storage_path: str = 'monitoring/predictions'):
        """
        Initialize prediction monitor
        
        Args:
            storage_path: Path to store prediction logs
        """
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
        
        self.predictions_log = []
        self.metrics_cache = {}
        self.window_size = 1000  # Rolling window for metrics
        
        # In-memory metrics (can be persisted to DB)
        self.disease_counts = defaultdict(int)
        self.confidence_distribution = deque(maxlen=self.window_size)
        self.urgency_distribution = defaultdict(int)
        self.error_log = []
        
    def log_prediction(self, 
                      symptoms: List[str],
                      prediction: Dict[str, Any],
                      model_name: str = 'xgboost',
                      patient_id: Optional[str] = None,
                      session_id: Optional[str] = None,
                      patient_metadata: Optional[Dict[str, Any]] = None) -> str:
        """
        Log a prediction for monitoring
        
        Args:
            symptoms: List of input symptoms
            prediction: Prediction result from model
            model_name: Name of model used
            patient_id: Optional patient identifier
            session_id: Optional session identifier
        
        Returns:
            Prediction ID
        """
        prediction_id = f"pred_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
        
        log_entry = {
            'prediction_id': prediction_id,
            'timestamp': datetime.now().isoformat(),
            'model_name': model_name,
            'patient_id': patient_id,
            'session_id': session_id,
            'input': {
                'symptoms': symptoms,
                'symptom_count': len(symptoms)
            },
            'prediction': {
                'disease': prediction.get('disease', 'unknown'),
                'confidence': prediction.get('confidence', 0.0),
                'urgency_level': prediction.get('urgency_level', 'medium'),
                'top_3_predictions': prediction.get('top_3_predictions', [])
            },
            'metadata': {
                'has_explanation': 'explanation' in prediction,
                'explanation_length': len(prediction.get('explanation', '')) if 'explanation' in prediction else 0,
                'patient': patient_metadata or {}
            }
        }
        
        # Store in memory
        self.predictions_log.append(log_entry)
        
        # Update metrics
        disease = prediction.get('disease', 'unknown')
        confidence = prediction.get('confidence', 0.0)
        urgency = prediction.get('urgency_level', 'medium')
        
        self.disease_counts[disease] += 1
        self.confidence_distribution.append(confidence)
        self.urgency_distribution[urgency] += 1
        
        # Persist to file (append mode)
        log_file = self.storage_path / f"predictions_{datetime.now().strftime('%Y%m%d')}.jsonl"
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(json.dumps(log_entry, ensure_ascii=False) + '\n')
        
        logger.info("Prediction logged", 
                   prediction_id=prediction_id,
                   disease=disease,
                   confidence=confidence)
        
        return prediction_id
    
    def log_feedback(self,
                    prediction_id: str,
                    feedback_type: str,  # 'correct', 'incorrect', 'partially_correct'
                    actual_disease: Optional[str] = None,
                    doctor_notes: Optional[str] = None,
                    corrected_prediction: Optional[Dict[str, Any]] = None) -> bool:
        """
        Log medical feedback for a prediction
        
        Args:
            prediction_id: ID of the prediction
            feedback_type: Type of feedback
            actual_disease: Actual disease if known
            doctor_notes: Notes from doctor
            corrected_prediction: Corrected prediction if available
        
        Returns:
            Success status
        """
        feedback_entry = {
            'prediction_id': prediction_id,
            'timestamp': datetime.now().isoformat(),
            'feedback_type': feedback_type,
            'actual_disease': actual_disease,
            'doctor_notes': doctor_notes,
            'corrected_prediction': corrected_prediction
        }
        
        # Store feedback
        feedback_file = self.storage_path / f"feedback_{datetime.now().strftime('%Y%m%d')}.jsonl"
        with open(feedback_file, 'a', encoding='utf-8') as f:
            f.write(json.dumps(feedback_entry, ensure_ascii=False) + '\n')
        
        logger.info("Feedback logged", 
                   prediction_id=prediction_id,
                   feedback_type=feedback_type)
        
        return True

    # --- Analytics helpers -------------------------------------------------

    def calculate_psi(
        self,
        reference: Sequence[float],
        current: Sequence[float],
        bins: int = 10,
        epsilon: float = 1e-6,
    ) -> float:
        """
        Population Stability Index para detectar drift entre distribuciones.

        Returns
        -------
        float
            Valor de PSI (>=0). Valores mayores a 0.2 suelen indicar drift significativo.
        """
        if not HAS_NUMPY:
            raise RuntimeError("NumPy es requerido para calcular PSI.")

        ref = np.asarray(reference, dtype=float)
        cur = np.asarray(current, dtype=float)

        if ref.size == 0 or cur.size == 0:
            raise ValueError("Se requieren muestras en ambas distribuciones para calcular PSI.")

        if bins < 2:
            raise ValueError("`bins` debe ser al menos 2.")

        # Usar percentiles de referencia para definir buckets estables.
        quantiles = np.linspace(0, 100, bins + 1)
        cut_points = np.unique(np.percentile(ref, quantiles))
        if cut_points.size < 2:
            cut_points = np.linspace(ref.min(), ref.max() + epsilon, bins + 1)

        ref_counts, _ = np.histogram(ref, bins=cut_points)
        cur_counts, _ = np.histogram(cur, bins=cut_points)

        ref_ratios = np.clip(ref_counts / max(ref_counts.sum(), epsilon), epsilon, None)
        cur_ratios = np.clip(cur_counts / max(cur_counts.sum(), epsilon), epsilon, None)

        psi = np.sum((cur_ratios - ref_ratios) * np.log(cur_ratios / ref_ratios))
        return float(psi)

    def fairness_metrics(
        self,
        group_field: str,
        high_confidence_threshold: float = 0.7,
    ) -> Dict[str, Any]:
        """
        Calcula métricas de equidad por grupos demográficos en las predicciones registradas.

        Parameters
        ----------
        group_field : str
            Llave dentro de `patient_metadata` (ej. "gender" o "age_band").
        high_confidence_threshold : float
            Umbral para considerar una predicción como de alta confianza.

        Returns
        -------
        dict
            Métricas por grupo con conteos, confianza promedio y distribución de urgencias.
        """
        groups: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        for entry in self.predictions_log:
            patient_meta = entry['metadata'].get('patient') or {}
            group_value = patient_meta.get(group_field)
            if group_value is None:
                continue
            groups[str(group_value)].append(entry)

        metrics: Dict[str, Any] = {}
        for group, entries in groups.items():
            confidences = [e['prediction']['confidence'] for e in entries]
            urgency_counts = defaultdict(int)
            for e in entries:
                urgency_counts[e['prediction']['urgency_level']] += 1

            total = len(entries)
            high_conf = sum(conf >= high_confidence_threshold for conf in confidences)

            if confidences:
                if HAS_NUMPY:
                    avg_conf = float(np.mean(confidences))
                else:
                    avg_conf = float(sum(confidences) / total)
            else:
                avg_conf = 0.0

            metrics[group] = {
                'count': total,
                'avg_confidence': avg_conf,
                'high_confidence_rate': float(high_conf / total) if total else 0.0,
                'urgency_distribution': dict(urgency_counts),
            }

        return metrics
    
    def get_metrics(self, days: int = 1) -> Dict[str, Any]:
        """
        Get monitoring metrics for the last N days
        
        Args:
            days: Number of days to analyze
        
        Returns:
            Dict with metrics
        """
        cutoff_date = datetime.now() - timedelta(days=days)
        
        # Load recent predictions
        recent_predictions = [
            p for p in self.predictions_log 
            if datetime.fromisoformat(p['timestamp']) >= cutoff_date
        ]
        
        if not recent_predictions:
            return {'error': 'No predictions found for the specified period'}
        
        # Calculate metrics
        total_predictions = len(recent_predictions)
        
        confidences = [p['prediction']['confidence'] for p in recent_predictions]
        if HAS_NUMPY:
            avg_confidence = np.mean(confidences) if confidences else 0.0
            median_confidence = np.median(confidences) if confidences else 0.0
        else:
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
            sorted_conf = sorted(confidences)
            n = len(sorted_conf)
            median_confidence = (sorted_conf[n//2] + sorted_conf[(n-1)//2]) / 2 if n > 0 else 0.0
        low_confidence_count = sum(1 for c in confidences if c < 0.7)
        
        # Disease distribution
        disease_dist = defaultdict(int)
        for p in recent_predictions:
            disease_dist[p['prediction']['disease']] += 1
        
        # Urgency distribution
        urgency_dist = defaultdict(int)
        for p in recent_predictions:
            urgency_dist[p['prediction']['urgency_level']] += 1
        
        # Model usage
        model_usage = defaultdict(int)
        for p in recent_predictions:
            model_usage[p['model_name']] += 1
        
        metrics = {
            'period': {
                'days': days,
                'start_date': cutoff_date.isoformat(),
                'end_date': datetime.now().isoformat()
            },
            'summary': {
                'total_predictions': total_predictions,
                'avg_confidence': float(avg_confidence),
                'median_confidence': float(median_confidence),
                'low_confidence_predictions': low_confidence_count,
                'low_confidence_percentage': (low_confidence_count / total_predictions * 100) if total_predictions > 0 else 0
            },
            'distributions': {
                'diseases': dict(sorted(disease_dist.items(), key=lambda x: x[1], reverse=True)[:10]),
                'urgency_levels': dict(urgency_dist),
                'models': dict(model_usage)
            },
            'quality_metrics': {
                'high_confidence_rate': sum(1 for c in confidences if c >= 0.9) / total_predictions * 100 if total_predictions > 0 else 0,
                'medium_confidence_rate': sum(1 for c in confidences if 0.7 <= c < 0.9) / total_predictions * 100 if total_predictions > 0 else 0,
                'low_confidence_rate': low_confidence_count / total_predictions * 100 if total_predictions > 0 else 0
            }
        }
        
        return metrics
    
    def detect_anomalies(self, window_size: int = 100) -> List[Dict[str, Any]]:
        """
        Detect anomalous predictions
        
        Args:
            window_size: Window size for anomaly detection
        
        Returns:
            List of anomalous predictions
        """
        if len(self.predictions_log) < window_size:
            return []
        
        recent = self.predictions_log[-window_size:]
        confidences = [p['prediction']['confidence'] for p in recent]
        
        if not confidences:
            return []
        
        if HAS_NUMPY:
            mean_conf = np.mean(confidences)
            std_conf = np.std(confidences)
        else:
            mean_conf = sum(confidences) / len(confidences)
            variance = sum((x - mean_conf) ** 2 for x in confidences) / len(confidences)
            std_conf = variance ** 0.5
        
        anomalies = []
        for pred in recent:
            conf = pred['prediction']['confidence']
            # Anomaly: very low confidence or very high confidence deviation
            if conf < (mean_conf - 2 * std_conf) or conf < 0.5:
                anomalies.append({
                    'prediction_id': pred['prediction_id'],
                    'timestamp': pred['timestamp'],
                    'confidence': conf,
                    'disease': pred['prediction']['disease'],
                    'reason': 'low_confidence' if conf < 0.5 else 'statistical_anomaly'
                })
        
        return anomalies
    
    def export_for_analysis(self, output_file: str, days: int = 7) -> str:
        """
        Export predictions to CSV for analysis
        
        Args:
            output_file: Output CSV file path
            days: Number of days to export
        
        Returns:
            Path to exported file
        """
        cutoff_date = datetime.now() - timedelta(days=days)
        
        recent_predictions = [
            p for p in self.predictions_log 
            if datetime.fromisoformat(p['timestamp']) >= cutoff_date
        ]
        
        # Flatten structure for CSV
        rows = []
        for pred in recent_predictions:
            row = {
                'prediction_id': pred['prediction_id'],
                'timestamp': pred['timestamp'],
                'model_name': pred['model_name'],
                'disease': pred['prediction']['disease'],
                'confidence': pred['prediction']['confidence'],
                'urgency_level': pred['prediction']['urgency_level'],
                'symptom_count': pred['input']['symptom_count'],
                'symptoms': ', '.join(pred['input']['symptoms'])
            }
            rows.append(row)
        
        if HAS_PANDAS:
            df = pd.DataFrame(rows)
            df.to_csv(output_file, index=False, encoding='utf-8')
            logger.info("Predictions exported", file=output_file, rows=len(df))
        else:
            # Fallback: write CSV manually
            import csv
            if rows:
                with open(output_file, 'w', newline='', encoding='utf-8') as f:
                    writer = csv.DictWriter(f, fieldnames=rows[0].keys())
                    writer.writeheader()
                    writer.writerows(rows)
            logger.info("Predictions exported", file=output_file, rows=len(rows))
        
        return output_file


# Global monitor instance
_monitor_instance = None


def get_monitor() -> PredictionMonitor:
    """Get global monitor instance"""
    global _monitor_instance
    if _monitor_instance is None:
        _monitor_instance = PredictionMonitor()
    return _monitor_instance


if __name__ == "__main__":
    # Test the monitor
    monitor = PredictionMonitor()
    
    # Simulate some predictions
    test_predictions = [
        {
            'disease': 'asma bronquial',
            'confidence': 0.95,
            'urgency_level': 'high',
            'top_3_predictions': []
        },
        {
            'disease': 'neumonía',
            'confidence': 0.88,
            'urgency_level': 'high',
            'top_3_predictions': []
        },
        {
            'disease': 'resfriado común',
            'confidence': 0.45,  # Low confidence
            'urgency_level': 'low',
            'top_3_predictions': []
        }
    ]
    
    for i, pred in enumerate(test_predictions):
        pred_id = monitor.log_prediction(
            symptoms=['tos', 'fiebre', 'fatiga'],
            prediction=pred,
            model_name='xgboost'
        )
        print(f"Logged prediction {i+1}: {pred_id}")
    
    # Get metrics
    metrics = monitor.get_metrics(days=1)
    print("\nMetrics:")
    print(json.dumps(metrics, indent=2, ensure_ascii=False))
    
    # Detect anomalies
    anomalies = monitor.detect_anomalies()
    print(f"\nAnomalies detected: {len(anomalies)}")
    for anomaly in anomalies:
        print(f"  - {anomaly['prediction_id']}: {anomaly['reason']} (confidence: {anomaly['confidence']:.2f})")

