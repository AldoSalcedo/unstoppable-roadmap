# Preguntas de Comprensión — Week 17: Context Engineering

Responde estas preguntas al final de cada día. Si no puedes responderlas sin mirar el código, vuelve a leer el material del día.

---

## Día 1: Mental Models

1. ¿Cuál es la diferencia entre un token y una palabra? Da un ejemplo con la frase "análisis de laboratorio".
2. ¿Qué pasa exactamente cuando un prompt supera el context window del modelo?
3. ¿Por qué temperatura = 0 no significa que el output siempre será idéntico?
4. ¿Por qué importa la *posición* de las instrucciones dentro del contexto?
5. Si tienes un presupuesto de 1000 tokens para el contexto del usuario, ¿qué información priorizas en un sistema de análisis clínico?

---

## Día 2: System Prompts

1. ¿Cuáles son los 4 pilares de un system prompt efectivo? Define cada uno.
2. Escribe un system prompt de 3 líneas para un asistente de triaje hospitalario. Ahora escribe una versión mejorada con los 4 pilares. ¿Qué cambió?
3. ¿Por qué "eres un médico experto" es un rol peor que "eres un médico de urgencias con 10 años de experiencia en hospitales de tercer nivel en México"?
4. ¿Qué constraint incluirías en el system prompt de un asistente clínico para prevenir que dé diagnósticos definitivos?
5. ¿Cuándo NO deberías incluir instrucciones de formato en el system prompt?

---

## Día 3: Few-Shot Prompting

1. ¿Cuántos ejemplos son "few"? ¿Cuándo es suficiente uno? ¿Cuándo necesitas cinco?
2. Explica qué es un ejemplo negativo y por qué es tan valioso como uno positivo.
3. ¿Qué es chain-of-thought prompting? ¿En qué tipo de tareas clínicas lo usarías?
4. Si tienes 3 slots para ejemplos en un prompt de análisis de lab, ¿qué casos elegirías cubrir y por qué?
5. ¿Cómo verificas que tus ejemplos no están causando que el modelo sea demasiado rígido?

---

## Día 4: Context Window Management

1. ¿Qué es truncación silenciosa y por qué es peligrosa en un sistema clínico?
2. ¿Cuál es la diferencia entre chunking por caracteres y chunking semántico? ¿Cuándo importa?
3. Describe la estrategia de ventana deslizante en tus propias palabras.
4. ¿Cómo decides qué partes del historial médico de un paciente incluir cuando no caben todas?
5. ¿Qué información deberías siempre preservar sin importar el tamaño del contexto?

---

## Día 5: Evals

1. ¿Por qué "se ve bien" no es un eval?
2. Explica el patrón LLM-as-judge con tus palabras. ¿Cuáles son sus limitaciones?
3. ¿Qué es un golden dataset? ¿Cuántos casos necesitas como mínimo?
4. ¿Qué es regression testing de prompts y por qué lo harías antes de cambiar un prompt en producción?
5. Diseña una rubric de 3 criterios para evaluar notas clínicas generadas por IA.

---

## Día 6: Failure Modes

1. Define hallucination en IA. ¿Por qué es especialmente peligrosa en contexto clínico?
2. ¿Qué es sycophancy? Da un ejemplo donde le preguntas al modelo si su propia respuesta es correcta.
3. Diseña un ataque de prompt injection simple contra un asistente clínico. ¿Cómo lo mitigarías?
4. ¿Qué hace Zod en el contexto de validación de outputs de LLM? ¿Por qué no confiar solo en el modelo?
5. ¿Cómo le pedirías al modelo que exprese incertidumbre en lugar de inventar?

---

## Día 7: Sprint de Integración

1. ¿Qué ventaja tiene un `PromptRegistry` centralizado sobre prompts dispersos en el código?
2. ¿Cómo haría tu CI-style eval runner para que falle el build si la calidad baja?
3. ¿Qué aprendiste esta semana que cambió cómo piensas sobre los LLMs?
4. ¿Cuál fue el ejercicio más difícil? ¿Por qué?
5. Si tuvieras que enseñarle Context Engineering a un junior developer en 5 minutos, ¿qué le dirías?
