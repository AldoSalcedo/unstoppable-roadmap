# PREGUNTAS DE REFLEXIÓN — Week 02 Testing
## Guía de Aprendizaje Diaria: 7 Días

Las preguntas están diseñadas para profundizar tu comprensión y conectar con tu background.
Reflexiona sobre cada una, luego lee la sección relevante en GUIA-CONCEPTOS.md.

---

## DÍA 1: Testing Fundamentals & Vitest

### Conceptos Base
1. **¿Cuál es la razón principal de tener 70% unit tests, 20% integration, y 10% E2E tests?**
   - Piensa en: velocidad, costo, confianza
   - Contexto clínico: ¿cuántos bugs detecta cada tipo?

2. **¿Qué diferencia hay entre "testear la función" y "testear el comportamiento"?**
   - Ejemplo: `expect(validator.results).toBe(true)` vs `expect(screen.getByText('OK')).toBeVisible()`
   - ¿Por qué es importante esta diferencia?

3. **En clínica, cuando validas un resultado de lab:**
   - ¿Cuántas veces verificas antes de reportar?
   - ¿Qué checks haces (rango, histórico, interacciones con otros tests)?
   - ¿Cómo mapeas esto a tests de software?

### Vitest Específico
4. **¿Qué significa "test aislado"? ¿Por qué importa el aislamiento?**
   - Pista: mockear dependencies

5. **¿Cuáles son 3 ventajas de Vitest sobre Jest?**
   - (Revisa RECURSOS.md si no estás seguro)

---

## DÍA 2: React Testing Library & MSW

### React Testing Library
6. **¿Cuál es el orden de prioridad para queries en RTL?**
   - `getByRole` > `getByLabelText` > `getByTestId`
   - ¿Por qué este orden?

7. **Diferencia entre renderizar un componente en un test vs en el navegador:**
   - ¿Qué no testeas cuando haces `render(<Component />)`?
   - (Pista: navegador, DOM real, CSS)

8. **En una clínica, un dashboard muestra 10 pacientes. ¿Cómo escribirías un test?**
   - ¿Qué buscarías en el DOM?
   - ¿Qué mockarías?

### Mock Service Worker
9. **¿Cómo es que MSW intercepta requests sin que cambie tu código?**
   - ¿Dónde pones MSW en el flujo?
   - ¿Qué pasa cuando un handler no está definido?

10. **¿Cuál es la diferencia entre MSW, stubear fetch, y mockear axios?**
    - Contexto: ¿cuál es más realista?

---

## DÍA 3: Playwright E2E Testing

### E2E Philosophy
11. **¿Qué es un "happy path"? ¿Por qué enfocarse en happy paths en E2E?**
    - Ejemplo en clínica: login → buscar paciente → ver resultados
    - ¿Qué NO testeas en E2E?

12. **Si un test E2E toma 5 segundos:**
    - 10 tests = 50 segundos
    - 100 tests = 500 segundos (8+ minutos)
    - ¿Cuántos tests E2E debería tener un proyecto?

13. **"Test flaky" = a veces pasa, a veces no**
    - ¿Qué causa flakiness en E2E?
    - ¿Cómo evitarla? (Pista: waitFor vs sleep)

### Clinical Workflow (Aldo's Context)
14. **En una clínica, ¿cuáles son los flujos CRÍTICOS que DEBEN funcionar?**
    - Login del doctor
    - Búsqueda de paciente
    - Visualización de resultados
    - ¿Cuál es el más crítico? ¿Por qué?

15. **Si hay un bug en "marcar resultado como revisado":**
    - Doctor marca como revisado
    - Pero el backend no lo guarda
    - ¿Cómo lo detectaría un E2E test?
    - ¿Y un unit test? ¿E integration?

---

## DÍA 4: Mocks, Stubs, Spies

### Conceptos
16. **Mock vs Stub vs Spy — resumido:**
    - Mock: ___ (reemplazar completamente)
    - Stub: ___ (implementación falsa)
    - Spy: ___ (observar)
    - (Completa los blancos, luego verifica en GUIA-CONCEPTOS.md)

17. **¿Cuándo es apropriado usar cada uno?**
    - Mock: verifica que se LLAMÓ una función (sin ejecutarla)
    - Stub: verifica que el resultado es correcto
    - Spy: verifica que se loguea correctamente
    - Ejemplo clínico: mockear envío de email de alerta

18. **En un test de validación de laboratorio:**
    - El validador llama a `logger.error()`si hay problema
    - ¿Cómo verificas que se loguea sin que suene alerta real?

---

## DÍA 5: Coverage & CI/CD

### Cobertura
19. **4 tipos de cobertura. ¿Cuál es la diferencia?**
    - Line coverage: ___
    - Branch coverage: ___
    - Function coverage: ___
    - Statement coverage: ___

20. **Si tienes 80% line coverage pero 40% branch coverage:**
    - ¿Qué significa?
    - ¿Cuál es más importante?
    - Ejemplo: `if (value > 100) return true; else return false;`

21. **¿Qué significa "cobertura nunca alcanza 100%"?**
    - ¿Qué código generalmente no se testa?
    - ¿Debería testearse?

### CI/CD & Confianza
22. **En una clínica, ¿por qué importan los tests en CI/CD?**
    - Regulación: GDPR, HIPAA
    - Auditoría: "¿Quién cambió qué y cuándo?"
    - Seguridad: "¿Cómo sé que el cambio no rompe nada?"

23. **Si un developer hace push sin pasar tests:**
    - ¿Debería llegar a producción?
    - ¿Cómo lo previenen los tests?

---

## DÍA 6: Performance Testing

### Benchmarking
24. **¿Cuál es la diferencia entre "test de performance" y "test normal"?**
    - Test normal: ¿funciona? (booleano: sí/no)
    - Test performance: ¿qué tan rápido? (numérico: X ms)

25. **En clínica: validar 10,000 resultados de lab**
    - ¿Cuánto tiempo máximo debería tomar?
    - ¿Quién nota si es lento? (doctor, paciente)
    - ¿Cómo lo mides en un test?

---

## DÍA 7: Integration & Estrategia

### Pensamiento Estratégico
26. **Si pudieras escribir SOLO UN TEST para un validador de lab:**
    - ¿Sería unit, integration, o E2E?
    - ¿Por qué?

27. **Si tuvieras 8 horas para testear una nueva feature clínica:**
    - ¿Cuánto tiempo dedicarías a unit vs integration vs E2E?
    - ¿Qué tests escribirías primero?

28. **Escala: de 0 a 10, ¿cuán importante es el testing para un healthcare app?**
    - 0 = innecesario (no, nunca!)
    - 10 = absolutamente crítico
    - Justifica tu respuesta

### Conexión Personal
29. **De tu background en QBP (laboratorio clínico):**
    - ¿Cuántas veces encontraste un "bug" manual en tus análisis?
    - ¿Cómo podrías haber prevenido el error con testing?
    - (Ejemplo: intercambio de muestras, malinterpretación de rango)

30. **De tu background en Auditoría:**
    - En auditoría, verificas que registros sean completos y correctos
    - ¿Cómo es esto similar a testing en software?
    - ¿Qué aprovecharías de auditoría para testing?

31. **De tu background en Ventas/UX:**
    - Un cliente clínico pregunta: "¿Qué pruebas hacen ustedes?"
    - ¿Cómo vendes la cobertura de testing como un beneficio?
    - (Pista: confianza, seguridad, regulación)

---

## RESPUESTAS GUÍA

### DÍA 1
1. Velocidad (unit < integration < E2E), Costo (unit < integration < E2E), Cobertura (muchos unit detectan bugs temprano)
2. Comportamiento = lo que el usuario ve/hace; Detalles = cómo se implementa. Si cambias detalles, los tests no deberían fallar.
3. Rango normal, comparación con valores previos, interacciones entre tests. Mapeo: cada validación = test case.

### DÍA 2
6. Accesibilidad (getByRole respeta semántica HTML)
7. Más rápido, ES modules nativo, mejor DX
9. MSW actúa como proxy HTTP-level, no depende de cómo haces fetch
11. Happy path = flujo exitoso (login → resultado). E2E es lento, así que solo para críticos.
12. ~5-10 E2E tests por proyecto (máximo)

### DÍA 5
19. Line: líneas de código ejecutadas. Branch: ramas if/else. Function: funciones llamadas. Statement: statements ejecutados.
20. Hay branches (if/else) no testeadas. Branch coverage > line coverage siempre.

### DÍA 7
28. 9-10. Healthcare = vidas en juego. Una bug podría resultar en mala diagnosis = daño legal.

---

## PATRÓN DE REFLEXIÓN

Para cada pregunta:
1. **Responde primero** — sin mirar GUIA-CONCEPTOS
2. **Lee la sección relevante** — confirma o corrige tu respuesta
3. **Escribe un ejemplo clínico** — aplica el concepto a tu contexto
4. **Comparte tu pensamiento** — si trabajas en equipo, discute

---

## PRÓXIMA SEMANA

Week 03: Clean Architecture
- ¿Cómo el testing impacta el diseño?
- Escribir código que es fácil de testear
- Dependency Injection para testabilidad
