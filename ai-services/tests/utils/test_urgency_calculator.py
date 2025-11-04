"""
Tests TDD para Urgency Calculator
Aplicando el ciclo RED -> GREEN -> REFACTOR
"""

import pytest
from utils.urgency_calculator import calculate_urgency_level


class TestUrgencyCalculator:
    """Tests para el calculador de urgencia"""
    
    # Test 1: Debe retornar 'low' para síntomas leves sin factores de riesgo
    def test_returns_low_for_mild_symptoms(self):
        """Test 1: Síntomas leves sin factores de riesgo"""
        symptoms = ['tos', 'congestión nasal']
        result = calculate_urgency_level(symptoms)
        assert result == 'low'
    
    # Test 2: Debe retornar 'medium' para síntomas moderados
    def test_returns_medium_for_moderate_symptoms(self):
        """Test 2: Síntomas moderados"""
        symptoms = ['tos', 'fiebre', 'fatiga']
        severity_scores = [0.5, 0.6, 0.5]
        result = calculate_urgency_level(symptoms, severity_scores)
        assert result == 'medium'
    
    # Test 3: Debe retornar 'high' para síntomas severos
    def test_returns_high_for_severe_symptoms(self):
        """Test 3: Síntomas severos"""
        symptoms = ['dificultad respiratoria', 'fiebre alta']
        severity_scores = [0.8, 0.9]
        result = calculate_urgency_level(symptoms, severity_scores)
        assert result == 'high'
    
    # Test 4: Debe retornar 'critical' para síntomas críticos
    def test_returns_critical_for_critical_symptoms(self):
        """Test 4: Síntomas críticos"""
        symptoms = ['dificultad respiratoria severa', 'dolor torácico', 'confusión']
        severity_scores = [0.95, 0.9, 0.85]
        result = calculate_urgency_level(symptoms, severity_scores)
        assert result == 'critical'
    
    # Test 5: Debe aumentar urgencia con factores de riesgo
    def test_increases_urgency_with_risk_factors(self):
        """Test 5: Factores de riesgo aumentan urgencia"""
        symptoms = ['tos', 'fiebre']
        risk_factors = ['diabetes', 'hipertensión', 'edad avanzada']
        result = calculate_urgency_level(symptoms, risk_factors=risk_factors)
        assert result == 'medium'  # De 'low' a 'medium' por factores de riesgo
    
    # Test 6: Debe considerar edad avanzada como factor de riesgo
    def test_considers_elderly_age_as_risk(self):
        """Test 6: Edad avanzada aumenta urgencia"""
        symptoms = ['tos', 'fiebre']
        result = calculate_urgency_level(symptoms, patient_age=75)
        assert result == 'medium'  # Edad avanzada aumenta urgencia
    
    # Test 7: Debe considerar edad pediátrica como factor de riesgo
    def test_considers_pediatric_age_as_risk(self):
        """Test 7: Edad pediátrica aumenta urgencia"""
        symptoms = ['tos', 'fiebre']
        result = calculate_urgency_level(symptoms, patient_age=3)
        assert result == 'medium'  # Edad pediátrica aumenta urgencia
    
    # Test 8: Debe manejar lista vacía de síntomas
    def test_handles_empty_symptoms_list(self):
        """Test 8: Lista vacía de síntomas"""
        symptoms = []
        result = calculate_urgency_level(symptoms)
        assert result == 'low'
    
    # Test 9: Debe combinar múltiples factores de riesgo
    def test_combines_multiple_risk_factors(self):
        """Test 9: Múltiples factores de riesgo"""
        symptoms = ['tos']
        severity_scores = [0.4]
        risk_factors = ['diabetes', 'hipertensión', 'obesidad']
        result = calculate_urgency_level(
            symptoms, 
            severity_scores=severity_scores, 
            risk_factors=risk_factors
        )
        assert result == 'high'  # Múltiples factores aumentan significativamente

