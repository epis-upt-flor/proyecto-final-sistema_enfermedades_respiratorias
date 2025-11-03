"""
Enhanced Chatbot Service with OpenAI Integration
Complete flow: Tokenize → Classify → OpenAI → Respond
"""

import re
import asyncio
from typing import Dict, Any, Optional, List
import structlog
from collections import Counter

logger = structlog.get_logger()


class EnhancedChatbotService:
    """
    Enhanced chatbot service with complete workflow:
    1. Tokenize symptoms
    2. Classify disease
    3. Get OpenAI humanized response
    4. Provide actionable recommendations
    """
    
    def __init__(self):
        self._disease_db = None
        self._openai_api_key = None
        self._openai_model = "gpt-3.5-turbo"
        
        # Try to load ML models
        self._ml_model = None
        self._shap_explainer = None
        self._use_ml = False
        self._load_ml_models()
        
        # Spanish medical stop words to filter
        self.stop_words = {
            'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se',
            'no', 'haber', 'por', 'con', 'su', 'para', 'como', 'estar',
            'tener', 'le', 'lo', 'todo', 'pero', 'más', 'hacer', 'o',
            'poder', 'decir', 'este', 'ir', 'otro', 'ese', 'la', 'si',
            'me', 'ya', 'ver', 'porque', 'dar', 'cuando', 'él', 'muy',
            'sin', 'vez', 'mucho', 'saber', 'qué', 'sobre', 'mi', 'alguno',
            'mismo', 'yo', 'también', 'hasta', 'año', 'dos', 'querer',
            'entre', 'así', 'primero', 'desde', 'grande', 'eso', 'ni',
            'nos', 'llegar', 'pasar', 'tiempo', 'ella', 'sí', 'día',
            'uno', 'bien', 'poco', 'deber', 'entonces', 'poner', 'cosa',
            'tanto', 'hombre', 'parecer', 'nuestro', 'tan', 'donde',
            'ahora', 'parte', 'después', 'vida', 'quedar', 'siempre',
            'creer', 'hablar', 'llevar', 'seguir', 'encontrar', 'llamar',
            'venir', 'pensar', 'sacar', 'luego', 'trabajar', 'mirar',
            'todavía', 'tener'
        }
        
        # Load diseases database
        self._load_disease_database()
    
    def _load_ml_models(self):
        """Try to load ML models for predictions"""
        try:
            from shap_explainer import SHAPDiseaseExplainer
            import os
            
            # Try to load XGBoost first (better performance)
            model_paths = [
                'models/xgboost_model.pkl',
                'ai-services/models/xgboost_model.pkl'
            ]
            
            for path in model_paths:
                if os.path.exists(path):
                    self._shap_explainer = SHAPDiseaseExplainer(path)
                    self._use_ml = True
                    logger.info("ML models loaded", model="XGBoost", path=path)
                    return
            
            # Try Random Forest as fallback
            rf_paths = [
                'models/base_random_forest.pkl',
                'ai-services/models/base_random_forest.pkl'
            ]
            
            for path in rf_paths:
                if os.path.exists(path):
                    self._shap_explainer = SHAPDiseaseExplainer(path)
                    self._use_ml = True
                    logger.info("ML models loaded", model="Random Forest", path=path)
                    return
            
            logger.warning("ML models not found, using pattern matching")
            self._use_ml = False
            
        except Exception as e:
            logger.warning("Could not load ML models", error=str(e))
            self._use_ml = False
    
    def _load_disease_database(self):
        """Load the 124 diseases database"""
        try:
            import os
            
            # Try different possible paths
            possible_paths = [
                'lista_enfermedades_respiratorias.md',
                '../lista_enfermedades_respiratorias.md',
                '../../lista_enfermedades_respiratorias.md',
                'ai-services/lista_enfermedades_respiratorias.md',
                os.path.join(os.path.dirname(__file__), '../../lista_enfermedades_respiratorias.md')
            ]
            
            disease_file = None
            for path in possible_paths:
                if os.path.exists(path):
                    disease_file = path
                    break
            
            if disease_file:
                from data.disease_parser import parse_diseases_markdown, build_disease_database
                
                diseases = parse_diseases_markdown(disease_file)
                
                if diseases:
                    self._disease_db = build_disease_database(diseases)
                    logger.info("disease_database_loaded", 
                              count=len(diseases), 
                              file=disease_file)
                else:
                    logger.warning("disease_database_empty", file=disease_file)
            else:
                logger.warning("disease_file_not_found", tried_paths=possible_paths)
                
        except Exception as e:
            logger.error("error_loading_disease_database", error=str(e))
            import traceback
            traceback.print_exc()
    
    def tokenize_spanish_text(self, text: str) -> List[str]:
        """
        Tokenize Spanish text and extract key medical terms
        Returns clean tokens without stop words
        """
        if not text:
            return []
        
        # Convert to lowercase
        text_lower = text.lower()
        
        # Remove punctuation but keep ñ and accents
        text_clean = re.sub(r'[^\w\sñáéíóúü]', ' ', text_lower)
        
        # Split into tokens
        tokens = text_clean.split()
        
        # Filter out stop words and short tokens (<3 chars)
        filtered_tokens = [
            token for token in tokens 
            if token not in self.stop_words and len(token) >= 3
        ]
        
        return filtered_tokens
    
    def extract_symptom_keywords(self, user_message: str, tokens: List[str]) -> List[Dict[str, Any]]:
        """
        Extract medical keywords that are symptoms from tokens - WITHOUT DUPLICATES
        """
        symptoms_found = []
        seen_symptoms = set()  # Track unique symptoms
        
        message_lower = user_message.lower()
        
        # Common symptom phrases (check these FIRST for priority)
        symptom_phrases = [
            'dolor de garganta', 'dolor de cabeza', 'dolor de pecho', 'dolor de oido',
            'dificultad para respirar', 'falta de aire', 'ahogo', 'opresion en el pecho',
            'dolores musculares', 'dolores corporales', 'dolores de cuerpo',
            'síntomas gastrointestinales', 'malestar estomacal',
            'fiebre alta', 'fiebre moderada', 'fiebre leve',
            'tos seca', 'tos productiva', 'tos con flema',
            'congestion nasal', 'secrecion nasal', 'rinorrea', 'secrecion acuosa',
            'fatiga extrema', 'cansancio extremo', 'agotamiento',
            'picazon nasal', 'picazon en ojos', 'lagrimeo'
        ]
        
        # Check for multi-word symptom phrases first
        for phrase in symptom_phrases:
            if phrase in message_lower and phrase not in seen_symptoms:
                symptoms_found.append({
                    'symptom': phrase,
                    'matched_token': phrase.split()[0],
                    'confidence': 0.9,
                    'possible_diseases': self._get_disease_ids_for_symptom(phrase)
                })
                seen_symptoms.add(phrase)
        
        # Enhanced symptom detection - single words (avoid duplicates)
        symptom_patterns = {
            'estornudos': 'estornudos',
            'congestion': 'congestion nasal',
            'nasal': 'congestion nasal',
            'secrecion': 'secrecion nasal',
            'picazon': 'picazon nasal',
            'lagrimeo': 'lagrimeo',
            'fiebre': 'fiebre',
            'tos': 'tos',
            'dolor': 'dolor de garganta',
            'garganta': 'dolor de garganta',
            'fatiga': 'fatiga',
            'cansancio': 'fatiga',
            'dolores': 'dolores musculares',
            'musculares': 'dolores musculares',
            'gastrointestinales': 'sintomas gastrointestinales',
            'nauseas': 'nauseas',
            'vomito': 'vomito',
            'escalofrios': 'escalofrios'
        }
        
        # Check for single word symptoms (avoid already seen phrases)
        for token in tokens:
            if len(token) >= 3:  # Ignore very short tokens
                # Check if token matches a symptom pattern
                if token in symptom_patterns:
                    symptom_name = symptom_patterns[token]
                    # Only add if we haven't seen it yet
                    if symptom_name not in seen_symptoms:
                        symptoms_found.append({
                            'symptom': symptom_name,
                            'matched_token': token,
                            'confidence': 0.8,
                            'possible_diseases': self._get_disease_ids_for_symptom(symptom_name)
                        })
                        seen_symptoms.add(symptom_name)
        
        return symptoms_found
    
    def _find_symptom_phrase(self, token: str, message: str) -> str:
        """Find the full symptom phrase containing the token"""
        # Look for 2-4 word phrases around the token
        words = message.split()
        for i, word in enumerate(words):
            if token in word.lower():
                # Get surrounding words
                start = max(0, i - 2)
                end = min(len(words), i + 3)
                phrase = ' '.join(words[start:end])
                return phrase
        return token
    
    def _get_disease_ids_for_symptom(self, symptom: str) -> List[int]:
        """Get disease IDs that match this symptom"""
        if not self._disease_db:
            return []
        
        symptom_map = self._disease_db.get('symptom_to_diseases', {})
        disease_ids = set()
        
        for symptom_key, ids in symptom_map.items():
            if symptom.lower() in symptom_key.lower() or symptom_key.lower() in symptom.lower():
                disease_ids.update(ids)
        
        return list(disease_ids) if disease_ids else list(range(1, 125))  # Fallback to all diseases
    
    def _classify_by_patterns(self, user_message: str, symptoms: List[Dict[str, Any]], tokens: List[str]) -> Dict[str, Any]:
        """Classify disease using pattern matching when database is not available"""
        
        message_lower = user_message.lower()
        detected_symptoms = [s.get('symptom', '') for s in symptoms]
        
        # Pattern-based disease identification
        disease_patterns = {
            'rinitis_alergica': {
                'name': 'Rinitis alérgica',
                'symptoms': ['estornudos', 'frecuentes', 'picazon', 'nasal', 'congestion', 'nasal', 'secrecion', 'acuosa', 'lagrimeo', 'picazon', 'ojos'],
                'urgency': 'baja',
                'severity': 'leve',
                'weight': 1
            },
            'resfriado_comun': {
                'name': 'Resfriado común',
                'symptoms': ['congestion', 'nasal', 'estornudos', 'secrecion', 'nasal', 'malestar', 'general', 'dolor', 'garganta', 'leve', 'fiebre', 'leve'],
                'urgency': 'baja',
                'severity': 'leve',
                'weight': 1
            },
            'influenza_b': {
                'name': 'Influenza B',
                'symptoms': ['fiebre', 'dolores', 'musculares', 'tos', 'garganta', 'fatiga', 'gastrointestinales', 'cansancio', 'dolores', 'corporales'],
                'urgency': 'media',
                'severity': 'moderada',
                'weight': 3
            },
            'influenza_h1n1': {
                'name': 'Influenza A (H1N1)',
                'symptoms': ['fiebre', 'alto', 'dolores', 'musculares', 'intensos', 'tos', 'seca', 'escalofrios', 'fatiga', 'extrema'],
                'urgency': 'media',
                'severity': 'alta',
                'weight': 3
            },
            'neumonia': {
                'name': 'Neumonía',
                'symptoms': ['fiebre', 'alto', 'dificultad', 'respirar', 'respiratoria', 'tos', 'torácico', 'pecho', 'escalofrios', 'confusion'],
                'urgency': 'alta',
                'severity': 'alta',
                'weight': 4
            },
            'bronquitis': {
                'name': 'Bronquitis aguda',
                'symptoms': ['tos', 'persistente', 'productiva', 'torácico', 'pecho', 'fiebre', 'leve', 'sibilancias'],
                'urgency': 'baja',
                'severity': 'moderada',
                'weight': 2
            }
        }
        
        scores = {}
        for disease_key, disease_info in disease_patterns.items():
            score = 0
            matched = []
            weight = disease_info.get('weight', 2)
            
            # Count how many symptoms from this disease are in the user's message
            for disease_symptom in disease_info['symptoms']:
                if disease_symptom in message_lower:
                    score += weight
                    matched.append(disease_symptom)
            
            if score > 0:
                scores[disease_key] = {
                    'score': score,
                    'matched': matched,
                    'name': disease_info['name'],
                    'urgency': disease_info['urgency'],
                    'severity': disease_info['severity']
                }
        
        # Get top match - prioritize by score and number of matched symptoms
        if scores:
            # Sort by score and then by number of matched symptoms
            top_key = max(scores.keys(), key=lambda k: (scores[k]['score'], len(scores[k]['matched'])))
            top = scores[top_key]
            
            # Only return diagnosis if confidence is reasonable (at least 3 matches)
            if len(top['matched']) < 3:
                # Return generic diagnosis if confidence is too low
                return {
                    'disease_id': None,
                    'disease_name': 'Infección respiratoria aguda (no especificada)',
                    'category': 'general',
                    'symptoms': detected_symptoms,
                    'matched_symptoms': top['matched'][:3] if top['matched'] else [],
                    'detected_symptoms': detected_symptoms,
                    'urgency': 'baja',
                    'severity': 'leve',
                    'confidence': 0.4,
                    'reasoning': f"Síntomas detectados pero clasificación con baja confianza. Coincidencias: {len(top['matched'])} síntomas"
                }
            
            return {
                'disease_id': hash(top['name']) % 1000,
                'disease_name': top['name'],
                'category': 'INFECCIONES AGUDAS',
                'symptoms': top['matched'],
                'matched_symptoms': top['matched'],
                'detected_symptoms': detected_symptoms,
                'urgency': top['urgency'],
                'severity': top['severity'],
                'confidence': min(top['score'] / 10, 0.9),
                'reasoning': f"Pattern matched {len(top['matched'])} symptoms: {', '.join(top['matched'][:3])}"
            }
        
        # Fallback
        return {
            'disease_id': None,
            'disease_name': 'Enfermedad respiratoria (no especificada)',
            'category': 'general',
            'symptoms': detected_symptoms,
            'matched_symptoms': detected_symptoms,
            'detected_symptoms': detected_symptoms,
            'urgency': 'media',
            'severity': 'moderada',
            'confidence': 0.6,
            'reasoning': 'Symptoms detected but cannot classify precisely'
        }
    
    def classify_disease(self, user_message: str, symptoms: List[Dict[str, Any]], tokens: List[str]) -> Dict[str, Any]:
        """
        Classify which disease(s) the patient likely has based on ALL symptoms
        """
        if not symptoms:
            return {
                'disease_id': None,
                'disease_name': None,
                'confidence': 0.0,
                'reasoning': 'No enough symptoms detected',
                'matched_symptoms': [],
                'urgency': 'baja',
                'severity': 'leve'
            }
        
        # If no disease database loaded, use pattern matching
        if not self._disease_db:
            return self._classify_by_patterns(user_message, symptoms, tokens)
        
        # Extract all symptom names detected
        detected_symptom_names = [s.get('symptom', '') for s in symptoms]
        
        # Get all possible disease IDs from symptoms
        possible_diseases = set()
        for symptom in symptoms:
            possible_diseases.update(symptom.get('possible_diseases', []))
        
        if not possible_diseases:
            return {
                'disease_id': None,
                'disease_name': None,
                'confidence': 0.0,
                'reasoning': 'No diseases found matching symptoms',
                'matched_symptoms': []
            }
        
        # Score diseases by ALL symptom matches
        disease_scores = {}
        
        diseases_list = self._disease_db.get('diseases', [])
        for disease in diseases_list:
            disease_id = disease.get('id')
            disease_name = disease.get('nombre', '')
            disease_symptoms = disease.get('sintomas', [])
            
            if disease_id in possible_diseases:
                # Count ALL symptom matches (not just keywords)
                symptom_matches = 0
                matched_symptoms = []
                
                # Check each detected symptom against disease's symptoms list
                for detected_symptom in detected_symptom_names:
                    for disease_symptom in disease_symptoms:
                        if detected_symptom.lower() in disease_symptom.lower() or disease_symptom.lower() in detected_symptom.lower():
                            symptom_matches += 1
                            matched_symptoms.append(disease_symptom)
                            break
                
                # Count matching keywords for additional context
                keywords = disease.get('keywords', [])
                keyword_matches = sum(
                    1 for keyword in keywords 
                    if any(keyword.lower() in token for token in tokens)
                )
                
                # Enhanced scoring: More weight to symptom matches
                total_score = symptom_matches * 3 + keyword_matches * 1.5
                
                disease_scores[disease_id] = {
                    'score': total_score,
                    'symptom_matches': symptom_matches,
                    'matched_symptoms': list(set(matched_symptoms)),  # Remove duplicates
                    'keyword_matches': keyword_matches,
                    'disease': disease,
                    'detected_symptoms_list': detected_symptom_names
                }
        
        # Get top scoring diseases (top 3)
        if disease_scores:
            sorted_diseases = sorted(disease_scores.items(), key=lambda x: x[1]['score'], reverse=True)
            top_three = sorted_diseases[:3]
            
            top_result = sorted_diseases[0][1]
            
            return {
                'disease_id': sorted_diseases[0][0],
                'disease_name': top_result['disease']['nombre'],
                'category': top_result['disease'].get('categoria', 'unknown'),
                'symptoms': top_result['disease'].get('sintomas', []),
                'matched_symptoms': top_result.get('matched_symptoms', []),
                'detected_symptoms': top_result.get('detected_symptoms_list', []),
                'urgency': top_result['disease'].get('urgencia', 'baja'),
                'severity': top_result['disease'].get('severidad', 'leve'),
                'confidence': min(top_result['score'] / 10, 1.0),
                'reasoning': f"Matched {top_result['symptom_matches']} symptoms: {', '.join(top_result['matched_symptoms'][:3])}",
                'top_3_diseases': [
                    {
                        'id': did,
                        'name': data['disease']['nombre'],
                        'score': data['score'],
                        'matches': data['symptom_matches']
                    }
                    for did, data in top_three
                ]
            }
        
        return {
            'disease_id': None,
            'disease_name': None,
            'confidence': 0.0,
            'reasoning': 'No disease matched',
            'matched_symptoms': []
        }
    
    def _is_greeting(self, message: str) -> bool:
        """Detect if message is a greeting"""
        greetings = ['hola', 'hi', 'buenos días', 'buenas tardes', 'buenas noches', 
                    'saludos', 'buen día', 'hey', 'buenas', 'hello', '¿qué tal?', 'como estas']
        
        message_lower = message.lower().strip()
        
        # Check for greetings
        for greeting in greetings:
            if greeting in message_lower:
                return True
        
        # Check for very short messages (likely greeting)
        if len(message.strip()) < 10 and any(char.isalpha() for char in message):
            return True
        
        return False
    
    def _is_question(self, message: str) -> bool:
        """Detect if message is a general question"""
        question_words = ['qué', 'que', 'cuál', 'cual', 'cómo', 'como', 'por qué', 
                         'porque', 'cuándo', 'cuando', 'dónde', 'donde', 'quién', 'quien']
        
        message_lower = message.lower()
        
        return any(qw in message_lower for qw in question_words) or '?' in message
    
    async def get_openai_response(
        self, 
        user_message: str,
        classified_disease: Dict[str, Any],
        symptoms: List[Dict[str, Any]]
    ) -> str:
        """
        Get humanized response from OpenAI based on classified disease
        """
        # Handle greetings
        if self._is_greeting(user_message):
            return self._get_greeting_response()
        
        # Handle general questions without symptoms
        if self._is_question(user_message) and not symptoms:
            return self._get_general_question_response(user_message)
        
        # If no symptoms detected but user is trying to communicate
        if classified_disease.get('disease_id') is None and not symptoms:
            return self._get_no_symptoms_response(user_message)
        
        disease_name = classified_disease.get('disease_name', 'Una condición respiratoria')
        category = classified_disease.get('category', 'Enfermedad respiratoria')
        urgency = classified_disease.get('urgency', 'baja')
        severity = classified_disease.get('severity', 'leve')
        disease_symptoms = classified_disease.get('symptoms', [])
        
        # Generate humanized response
        response_parts = []
        
        # Natural acknowledgment
        if urgency == 'critica':
            response_parts.append(
                "Me preocupa lo que estás describiendo. Has mencionado síntomas que indican una situación seria."
            )
        elif urgency in ['alta', 'media']:
            response_parts.append(
                "Entiendo que estás preocupado por tus síntomas. Déjame ayudarte a analizarlos."
            )
        else:
            response_parts.append(
                "Gracias por compartir tu situación. He revisado tus síntomas."
            )
        
        # Show ALL detected symptoms first
        detected_symptoms_list = classified_disease.get('detected_symptoms', [])
        matched_symptoms_list = classified_disease.get('matched_symptoms', [])
        
        if detected_symptoms_list:
            response_parts.append(f"\n**He detectado {len(detected_symptoms_list)} síntomas que mencionaste:**\n")
            symptoms_detected = ", ".join(detected_symptoms_list[:8])
            response_parts.append(f"• {symptoms_detected}")
            if len(detected_symptoms_list) > 8:
                response_parts.append(f"• ... y {len(detected_symptoms_list) - 8} más\n")
            else:
                response_parts.append("\n")
        
        # Disease identification (with ML explanation if available)
        ml_explanation = classified_disease.get('ml_explanation')
        ml_top3 = classified_disease.get('top_3_predictions', [])
        has_ml = ml_explanation is not None
        
        if has_ml:
            confidence_pct = classified_disease.get('confidence', 0) * 100
            response_parts.append(
                f"📋 **Posible condición**: {disease_name} (Confianza: {confidence_pct:.0f}%)\n\n"
            )
            
            # Show decision factors
            decision_factors = ml_explanation.get('decision_factors', [])[:3]
            if decision_factors:
                response_parts.append("🎯 **Factores clave en mi análisis:**\n")
                for factor in decision_factors[:3]:
                    feature_name = factor.get('feature', 'Síntoma').replace('_', ' ').title()
                    contribution = factor.get('contribution', 0)
                    response_parts.append(f"   • {feature_name}: contribuyó significativamente al diagnóstico")
                response_parts.append("\n")
            
            # Show top 3 alternatives
            if ml_top3 and len(ml_top3) > 1:
                response_parts.append("🔍 **Otras posibilidades a considerar:**\n")
                for i, alt in enumerate(ml_top3[1:4], 1):
                    alt_name = alt.get('disease', 'Desconocido')
                    alt_conf = alt.get('confidence', 0) * 100
                    response_parts.append(f"   {i}. {alt_name} ({alt_conf:.0f}%)")
                response_parts.append("\n")
        else:
            response_parts.append(
                f"📋 **Posible condición**: {disease_name}\n"
            )
        
        # Show matched symptoms (symptoms from disease that match)
        if matched_symptoms_list:
            matched_text = ", ".join(matched_symptoms_list[:5])
            response_parts.append(
                f"**Coinciden específicamente**: {matched_text}"
            )
            if len(matched_symptoms_list) > 5:
                response_parts.append(f"... y {len(matched_symptoms_list) - 5} síntomas más de esta condición.\n")
            else:
                response_parts.append("\n")
        
        # Disease's full symptoms list (for reference)
        if disease_symptoms and len(matched_symptoms_list) < len(disease_symptoms):
            symptoms_text = "\n".join([f"• {s}" for s in disease_symptoms[:6]])
            response_parts.append(
                f"**Otros síntomas comunes de esta condición:**\n{symptoms_text}\n"
            )
        
        # Urgency indicator
        urgency_emoji = {
            'critica': '🚨',
            'alta': '⚠️',
            'media': '⚡',
            'baja': '💚'
        }.get(urgency, 'ℹ️')
        
        urgency_text = {
            'critica': 'URGENCIA MÉDICA CRÍTICA',
            'alta': 'ATENCIÓN URGENTE REQUERIDA',
            'media': 'CONSULTA MÉDICA RECOMENDADA',
            'baja': 'MONITOREO EN CASA'
        }.get(urgency, 'SEGUIMIENTO RECOMENDADO')
        
        response_parts.append(
            f"\n{urgency_emoji} **{urgency_text}**\n"
        )
        
        # Actionable recommendations
        if urgency == 'critica':
            recommendations = [
                "🚨 Llama al 911 o servicio de emergencias inmediatamente",
                "🏥 Ve al hospital más cercano de inmediato",
                "⚠️ No conduzcas si te sientes mal, pide ayuda",
                "📞 Mantén a alguien informado de tu estado",
                "💊 Prepara información médica relevante"
            ]
        elif urgency == 'alta':
            recommendations = [
                "🏥 Busca atención médica en las próximas 2-4 horas",
                "📋 Ten tus síntomas documentados",
                "💊 Lleva lista de medicamentos actuales",
                "👤 Preferible ir con acompañante",
                "📞 Ten números de emergencia a mano"
            ]
        elif urgency == 'media':
            recommendations = [
                "🕐 Programa cita médica dentro de 24 horas",
                "📝 Mantén un diario de síntomas",
                "🤒 Monitorea temperatura si hay fiebre",
                "💧 Mantente bien hidratado",
                "😴 Descansa lo suficiente"
            ]
        else:
            recommendations = [
                "🏠 Continúa monitoreando en casa",
                "🤒 Si hay fiebre, monitorea temperatura",
                "💧 Hidrátate bien",
                "😴 Descansa adecuadamente",
                "📞 Contacta médico si síntomas empeoran o persisten >3 días"
            ]
        
        recommendations_text = "\n".join([rec for rec in recommendations])
        response_parts.append(f"**Qué hacer ahora:**\n{recommendations_text}\n")
        
        # Add disclaimer
        response_parts.append(
            "\n---\n"
            "⚠️ **IMPORTANTE**: Esta es información general basada en síntomas. "
            "Para un diagnóstico preciso, debes consultar con un profesional de la salud. "
            "No reemplaza la evaluación médica."
        )
        
        return '\n'.join(response_parts)
    
    async def process_user_message(
        self,
        user_message: str,
        conversation_history: Optional[List[Dict[str, Any]]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Complete workflow: Tokenize → Classify → OpenAI → Respond
        """
        try:
            logger.info("Processing message", message_length=len(user_message))
            
            # Handle special cases first (greetings, general questions)
            if self._is_greeting(user_message):
                return {
                    'success': True,
                    'message': self._get_greeting_response(),
                    'analysis': {
                        'message_type': 'greeting',
                        'needs_followup': True
                    }
                }
            
            # Step 1: Tokenize the message
            tokens = self.tokenize_spanish_text(user_message)
            logger.info("Message tokenized", token_count=len(tokens))
            
            # Step 2: Extract symptom keywords
            symptoms = self.extract_symptom_keywords(user_message, tokens)
            logger.info("Symptoms extracted", symptom_count=len(symptoms))
            
            # Handle general questions
            if self._is_question(user_message) and not symptoms:
                return {
                    'success': True,
                    'message': self._get_general_question_response(user_message),
                    'analysis': {
                        'message_type': 'general_question',
                        'needs_followup': True
                    }
                }
            
            # Step 3: Classify disease (use ML if available)
            classified_disease = None
            ml_prediction = None
            
            if self._use_ml and symptoms:
                # Try ML prediction with SHAP
                try:
                    ml_prediction = self._predict_with_ml(user_message, symptoms)
                    if ml_prediction:
                        classified_disease = {
                            'disease_name': ml_prediction.get('disease', 'Infección respiratoria'),
                            'disease_id': hash(ml_prediction.get('disease', 'unknown')),
                            'confidence': ml_prediction.get('confidence', 0.7),
                            'urgency_level': ml_prediction.get('urgency_level', 'medium'),
                            'symptoms': symptoms,
                            'matched_symptoms': ml_prediction.get('top_contributing_features', [])[:5],
                            'detected_symptoms': [s.get('symptom', '') for s in symptoms],
                            'ml_explanation': ml_prediction.get('explanation'),
                            'top_3_predictions': ml_prediction.get('top_3_predictions', [])
                        }
                        logger.info("ML prediction successful", 
                                   disease=classified_disease.get('disease_name'),
                                   confidence=classified_disease.get('confidence'))
                except Exception as e:
                    logger.warning("ML prediction failed, using pattern matching", error=str(e))
            
            # Fallback to pattern matching if ML not used or failed
            if not classified_disease:
                classified_disease = self.classify_disease(user_message, symptoms, tokens)
                logger.info("Disease classified (pattern matching)",
                           disease=classified_disease.get('disease_name'),
                           confidence=classified_disease.get('confidence'))
            
            # Handle case with no symptoms detected
            if classified_disease.get('disease_id') is None and not symptoms:
                return {
                    'success': True,
                    'message': self._get_no_symptoms_response(user_message),
                    'analysis': {
                        'message_type': 'no_symptoms',
                        'needs_followup': True
                    }
                }
            
            # Step 4: Get OpenAI response (humanized)
            ai_response = await self.get_openai_response(
                user_message,
                classified_disease,
                symptoms
            )
            
            # Step 5: Prepare final response
            return {
                'success': True,
                'message': ai_response,
                'tokenization': {
                    'tokens': tokens,
                    'token_count': len(tokens)
                },
                'symptom_extraction': {
                    'symptoms': symptoms,
                    'count': len(symptoms)
                },
                'disease_classification': classified_disease,
                'analysis': {
                    'detected_symptoms': [s.get('symptom') for s in symptoms],
                    'possible_disease': classified_disease.get('disease_name'),
                    'urgency_level': classified_disease.get('urgency'),
                    'severity': classified_disease.get('severity'),
                    'confidence': classified_disease.get('confidence'),
                    'recommendation': self._get_actionable_recommendation(classified_disease)
                }
            }
            
        except Exception as e:
            logger.error("Error processing message", error=str(e))
            return {
                'success': False,
                'message': 'Lo siento, hubo un error procesando tu mensaje. Por favor intenta de nuevo.',
                'error': str(e)
            }
    
    def _get_actionable_recommendation(self, classified_disease: Dict[str, Any]) -> str:
        """Get actionable recommendation based on disease classification"""
        urgency = classified_disease.get('urgency', 'baja')
        severity = classified_disease.get('severity', 'leve')
        
        recommendations = {
            'critica': "Buscar atención médica de EMERGENCIA inmediatamente. "
                       "Esta es una situación que requiere atención médica de URGENCIA.",
            
            'alta': "Buscar atención médica URGENTE en las próximas horas. "
                   "No demores en buscar ayuda profesional.",
            
            'media': "Programar cita médica dentro de las próximas 24 horas. "
                    "Monitorea los síntomas y si empeoran, busca atención antes.",
            
            'baja': "Puedes monitorear los síntomas en casa, pero si persisten "
                   "por más de 3 días o empeoran, consulta con un médico."
        }
        
        return recommendations.get(urgency, recommendations['baja'])
    
    def _get_greeting_response(self) -> str:
        """Get a friendly greeting response"""
        greetings = [
            "¡Hola! 👋\n\nSoy tu asistente médico de Respicare. Estoy aquí para ayudarte con información sobre salud respiratoria, síntomas y orientación médica.\n\n**¿Cuál es tu consulta o problema?** Puedes:\n\n• Describirme tus síntomas\n• Preguntar sobre enfermedades respiratorias\n• Pedir orientación médica general",
            
            "¡Hola! 👋\n\nMe alegra que estés aquí. Soy tu asistente médico de Respicare y estoy para ayudarte.\n\n**¿Cómo puedo ayudarte hoy?** Puedes contarme:\n\n• Tus síntomas respiratorios\n• Dudas sobre enfermedades\n• Qué te preocupa",
            
            "¡Hola! 👋\n\nBienvenido a Respicare. Soy tu asistente médico virtual aquí para ayudarte.\n\n**¿Qué te preocupa?** Comparte conmigo:\n\n• Síntomas que estás experimentando\n• Preguntas sobre salud respiratoria\n• Cualquier duda médica"
        ]
        
        import random
        return random.choice(greetings)
    
    def _get_general_question_response(self, user_message: str) -> str:
        """Get response for general questions without symptoms"""
        
        message_lower = user_message.lower()
        
        # Detect question type
        if any(word in message_lower for word in ['qué es', 'que es', 'define', 'definir']):
            return (
                "¡Claro! Te puedo ayudar con información sobre enfermedades respiratorias.\n\n"
                "**Para darte información más precisa, dime:**\n"
                "• ¿Sobre qué enfermedad específica quieres saber?\n"
                "• ¿Tienes síntomas que quieres que analice?\n"
                "• ¿O qué tipo de información buscas?\n\n"
                "Puedo ayudarte con más de 120 enfermedades respiratorias incluyendo: "
                "asma, neumonía, bronquitis, COVID-19, gripe, EPOC, y más."
            )
        
        elif any(word in message_lower for word in ['para qué', 'para que', 'qué hace', 'que hace']):
            return (
                "Estoy diseñado para ayudarte con:\n\n"
                "🤒 **Análisis de síntomas**: Describe tus síntomas y te ayudo a entender qué podría ser\n"
                "📋 **Información médica**: Te explico sobre enfermedades respiratorias\n"
                "⚠️ **Orientación de urgencia**: Te indico si necesitas atención médica inmediata\n"
                "💡 **Recomendaciones**: Te guío sobre qué hacer según tu situación\n\n"
                "**¿Cómo quieres comenzar?** Describe tus síntomas o hazme una pregunta."
            )
        
        elif any(word in message_lower for word in ['puedes', 'podés', 'sabes', 'puede hacer']):
            return (
                "¡Por supuesto! Puedo ayudarte con:\n\n"
                "✅ Analizar tus síntomas respiratorios\n"
                "✅ Identificar posibles condiciones\n"
                "✅ Indicarte nivel de urgencia\n"
                "✅ Darte recomendaciones de qué hacer\n"
                "✅ Responder preguntas sobre enfermedades\n\n"
                "**¿Qué te gustaría que analice?** Cuéntame tus síntomas o hazme tu pregunta."
            )
        
        else:
            return (
                "Entiendo tu pregunta. Estoy aquí para ayudarte.\n\n"
                "**¿Cómo puedo asistirte?**\n\n"
                "• **Si tienes síntomas**: Descríbelos y te analizo\n"
                "• **Si tienes dudas**: Pregunta sobre enfermedades respiratorias\n"
                "• **Si necesitas orientación**: Te guío sobre qué hacer\n\n"
                "Puedes también consultar las preguntas rápidas disponibles o escribirme tu situación."
            )
    
    def _get_no_symptoms_response(self, user_message: str) -> str:
        """Get response when no symptoms are detected"""
        
        return (
            "Gracias por contactarme. Entiendo tu mensaje, pero no he podido identificar síntomas específicos en lo que describiste.\n\n"
            "**Para poder ayudarte mejor, por favor proporciona:**\n\n"
            "• Síntomas específicos que estás experimentando (ej: tos, fiebre, dificultad respiratoria)\n"
            "• Cuándo comenzaron los síntomas\n"
            "• Intensidad o severidad de los síntomas\n\n"
            "**Ejemplos de cómo describirlo:**\n"
            "• 'Tengo tos seca desde hace 3 días y me duele la garganta'\n"
            "• 'Siento dificultad para respirar y tengo fiebre alta'\n"
            "• 'Me duele el pecho cuando respiro'\n\n"
            "O si prefieres, puedes hacer una pregunta general sobre salud respiratoria."
        )
    
    def _predict_with_ml(self, user_message: str, symptoms: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Use ML model with SHAP for prediction"""
        try:
            # Build symptoms string
            symptom_names = [s.get('symptom', '') for s in symptoms]
            symptoms_text = ', '.join(symptom_names)
            
            # Get patient age from context if available (default 35)
            patient_age = 35
            if symptoms and isinstance(symptoms[0], dict):
                patient_age = symptoms[0].get('patient_age', 35)
            
            # Predict with SHAP
            prediction = self._shap_explainer.explain_prediction(
                symptoms_text, 
                patient_age=patient_age
            )
            
            # Enhance with urgency level
            urgency_keywords = ['dificultad respiratoria', 'cianosis', 'confusion', 'shock', 'coma', 'severa', 'grave']
            detected_text = user_message.lower()
            has_urgency = any(kw in detected_text for kw in urgency_keywords)
            
            if has_urgency:
                prediction['urgency_level'] = 'high'
            elif prediction.get('confidence', 0) > 0.8:
                prediction['urgency_level'] = 'medium'
            else:
                prediction['urgency_level'] = 'low'
            
            return prediction
            
        except Exception as e:
            logger.error("ML prediction error", error=str(e))
            return None

