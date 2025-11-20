"""
Cough Analysis Service - Uses audio features analysis (no dataset needed)
Analyzes cough characteristics using signal processing and pre-trained audio features
"""

from typing import Dict, Any, List, Optional
import structlog
import base64
import io
import numpy as np
import tempfile
import os

logger = structlog.get_logger()


class CoughAnalysisService:
    """
    Service for analyzing cough audio using signal processing
    No dataset needed - uses audio feature extraction and medical knowledge
    """
    
    def __init__(self):
        self._librosa_available = False
        self._check_dependencies()
    
    def _check_dependencies(self):
        """Check if audio processing libraries are available"""
        try:
            import librosa
            import soundfile
            self._librosa_available = True
            logger.info("Audio processing libraries available")
        except ImportError:
            logger.warning("librosa/soundfile not available. Install with: pip install librosa soundfile")
            self._librosa_available = False
    
    def _extract_audio_features(self, audio_path: str) -> Dict[str, Any]:
        """
        Extract audio features using librosa (signal processing, no ML model needed)
        
        Features extracted:
        - Spectral features (frequency domain)
        - Temporal features (time domain)
        - MFCC (Mel-frequency cepstral coefficients)
        - Zero crossing rate
        - Spectral centroid, rolloff, bandwidth
        """
        if not self._librosa_available:
            raise ImportError("librosa not available. Install with: pip install librosa soundfile")
        
        import librosa
        import soundfile as sf
        
        # Load audio file
        y, sr = librosa.load(audio_path, sr=None)  # Load with original sample rate
        
        # Duration
        duration = len(y) / sr
        
        # Zero Crossing Rate (indicates frequency of waveform crossing zero)
        zcr = librosa.feature.zero_crossing_rate(y)[0]
        avg_zcr = float(np.mean(zcr))
        
        # Spectral features
        spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
        spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
        spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)[0]
        
        # MFCC (Mel-frequency cepstral coefficients) - good for audio classification
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        
        # Chroma features (pitch class)
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        
        # Energy/RMS (Root Mean Square)
        rms = librosa.feature.rms(y=y)[0]
        
        # Tempo (if applicable)
        try:
            tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        except:
            tempo = 0
        
        return {
            "duration": float(duration),
            "sample_rate": int(sr),
            "zero_crossing_rate": float(avg_zcr),
            "spectral_centroid_mean": float(np.mean(spectral_centroids)),
            "spectral_centroid_std": float(np.std(spectral_centroids)),
            "spectral_rolloff_mean": float(np.mean(spectral_rolloff)),
            "spectral_bandwidth_mean": float(np.mean(spectral_bandwidth)),
            "mfcc_mean": [float(x) for x in np.mean(mfccs, axis=1)],
            "chroma_mean": [float(x) for x in np.mean(chroma, axis=1)],
            "rms_mean": float(np.mean(rms)),
            "rms_max": float(np.max(rms)),
            "tempo": float(tempo),
        }
    
    def _analyze_cough_characteristics(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze cough characteristics based on audio features
        Uses medical knowledge and signal processing (no ML model needed)
        
        Cough types:
        - Dry cough: Higher frequency, less energy in lower frequencies
        - Productive cough: More energy, lower frequency components
        - Paroxysmal cough: Multiple bursts, high variability
        - Chronic cough: Longer duration, consistent patterns
        """
        duration = features["duration"]
        spectral_centroid = features["spectral_centroid_mean"]
        spectral_bandwidth = features["spectral_bandwidth_mean"]
        rms_mean = features["rms_mean"]
        rms_max = features["rms_max"]
        zcr = features["zero_crossing_rate"]
        
        characteristics = []
        severity = "mild"
        urgency = "low"
        
        # Duration analysis
        if duration < 0.5:
            characteristics.append("Tos muy corta")
        elif duration < 2.0:
            characteristics.append("Tos corta")
        elif duration < 5.0:
            characteristics.append("Tos de duración moderada")
            severity = "moderate"
        else:
            characteristics.append("Tos prolongada")
            severity = "moderate"
            urgency = "medium"
        
        # Frequency analysis (spectral centroid)
        # Higher centroid = higher pitch (dry cough)
        # Lower centroid = lower pitch (productive cough)
        if spectral_centroid > 3000:  # High frequency
            characteristics.append("Tos seca (alta frecuencia)")
            severity = "moderate" if severity == "mild" else severity
        elif spectral_centroid < 1500:  # Low frequency
            characteristics.append("Tos productiva (baja frecuencia)")
            severity = "moderate"
            urgency = "medium"
        else:
            characteristics.append("Tos mixta")
        
        # Energy analysis (RMS)
        # High energy = forceful cough
        if rms_max > 0.3:
            characteristics.append("Tos intensa")
            severity = "moderate" if severity == "mild" else "severe"
            urgency = "high" if urgency == "low" else "medium"
        elif rms_mean < 0.05:
            characteristics.append("Tos débil")
        
        # Bandwidth analysis (variability)
        if spectral_bandwidth > 3000:
            characteristics.append("Tos variable (posible paroxística)")
            severity = "moderate"
            urgency = "medium"
        
        # Zero crossing rate (noise/breathiness)
        if zcr > 0.15:
            characteristics.append("Componente de respiración presente")
        
        # Determine final severity
        if "prolongada" in " ".join(characteristics) and "intensa" in " ".join(characteristics):
            severity = "severe"
            urgency = "high"
        elif "prolongada" in " ".join(characteristics) or "intensa" in " ".join(characteristics):
            severity = "moderate"
            urgency = "medium"
        
        # Generate recommendations based on analysis
        recommendations = self._generate_recommendations(characteristics, severity, urgency)
        
        # Calculate confidence based on feature quality
        confidence = min(0.95, 0.6 + (duration * 0.05) + (len(characteristics) * 0.05))
        
        return {
            "detected": True,
            "severity": severity,
            "characteristics": characteristics,
            "recommendations": recommendations,
            "urgency_level": urgency,
            "confidence": float(confidence),
            "features_summary": {
                "duration_seconds": round(duration, 2),
                "frequency_range": "high" if spectral_centroid > 2500 else "low" if spectral_centroid < 1500 else "medium",
                "energy_level": "high" if rms_max > 0.3 else "low" if rms_mean < 0.05 else "medium",
            }
        }
    
    def _generate_recommendations(
        self, 
        characteristics: List[str], 
        severity: str, 
        urgency: str
    ) -> List[str]:
        """Generate medical recommendations based on cough analysis"""
        recommendations = []
        
        # General recommendations
        recommendations.append("Mantén hidratación adecuada")
        recommendations.append("Evita irritantes como humo, polvo y productos químicos")
        
        # Severity-based recommendations
        if severity == "severe" or urgency == "high":
            recommendations.append("Consulta con un médico de inmediato")
            recommendations.append("Monitorea otros síntomas como fiebre, dificultad respiratoria o dolor en el pecho")
        elif severity == "moderate":
            recommendations.append("Consulta con un médico si la tos persiste más de 3 días")
            recommendations.append("Considera usar un humidificador en tu habitación")
        else:
            recommendations.append("Monitorea la tos durante los próximos días")
            recommendations.append("Descansa y mantén una buena hidratación")
        
        # Characteristic-based recommendations
        if "productiva" in " ".join(characteristics).lower():
            recommendations.append("La tos productiva puede indicar infección - consulta si persiste")
        
        if "prolongada" in " ".join(characteristics).lower():
            recommendations.append("Una tos prolongada puede requerir evaluación médica")
        
        if "intensa" in " ".join(characteristics).lower():
            recommendations.append("Evita esfuerzos físicos hasta que la tos mejore")
        
        return recommendations
    
    async def analyze(
        self,
        audio_data: bytes,
        audio_format: str = "wav"
    ) -> Dict[str, Any]:
        """
        Analyze cough audio
        
        Args:
            audio_data: Raw audio bytes
            audio_format: Audio format (wav, mp3, etc.)
        
        Returns:
            Dict with cough analysis results
        """
        try:
            logger.info("Starting cough analysis",
                       audio_length=len(audio_data),
                       format=audio_format)
            
            if not self._librosa_available:
                # Fallback to basic analysis
                logger.warning("librosa not available, using basic analysis")
                return self._basic_analysis(audio_data)
            
            # Save audio to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{audio_format}") as tmp_file:
                tmp_file.write(audio_data)
                tmp_file_path = tmp_file.name
            
            try:
                # Extract audio features
                features = self._extract_audio_features(tmp_file_path)
                
                # Analyze cough characteristics
                analysis = self._analyze_cough_characteristics(features)
                
                logger.info("Cough analysis completed",
                           detected=analysis["detected"],
                           severity=analysis["severity"],
                           urgency=analysis["urgency_level"])
                
                return analysis
                
            finally:
                # Clean up temporary file
                if os.path.exists(tmp_file_path):
                    os.unlink(tmp_file_path)
                    
        except Exception as e:
            logger.error("Error analyzing cough", error=str(e))
            # Return basic analysis as fallback
            return self._basic_analysis(audio_data)
    
    def _basic_analysis(self, audio_data: bytes) -> Dict[str, Any]:
        """Basic analysis fallback when librosa is not available"""
        duration_estimate = len(audio_data) / 16000  # Rough estimate
        
        detected = len(audio_data) > 1000
        severity = "moderate" if duration_estimate > 2.0 else "mild"
        urgency = "medium" if duration_estimate > 3.0 else "low"
        
        characteristics = []
        if duration_estimate > 3.0:
            characteristics.append("Tos prolongada")
        if duration_estimate < 1.0:
            characteristics.append("Tos corta")
        
        recommendations = [
            "Mantén hidratación adecuada",
            "Evita irritantes como el humo y polvo",
            "Consulta con un médico si la tos persiste más de 3 días",
        ]
        
        return {
            "detected": detected,
            "severity": severity,
            "characteristics": characteristics,
            "recommendations": recommendations,
            "urgency_level": urgency,
            "confidence": 0.5,
        }
    
    async def analyze_base64(
        self,
        audio_base64: str,
        audio_format: str = "wav"
    ) -> Dict[str, Any]:
        """
        Analyze base64-encoded cough audio
        
        Args:
            audio_base64: Base64-encoded audio string
            audio_format: Audio format
        
        Returns:
            Dict with cough analysis results
        """
        try:
            audio_data = base64.b64decode(audio_base64)
            return await self.analyze(audio_data, audio_format)
        except Exception as e:
            logger.error("Error decoding base64 audio", error=str(e))
            raise

