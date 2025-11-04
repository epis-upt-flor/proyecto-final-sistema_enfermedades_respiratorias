# UNIVERSIDAD PRIVADA DE TACNA
## FACULTAD DE INGENIERÍA
### ESCUELA DE INGENIERÍA DE SISTEMAS

Guía Práctica de Laboratorio
**“** Desarrollo Basado en Pruebas TDD **”**

### Que se presenta para el curso: “ Construcción de Software I ”

### Docente: Mtro. Alberto Johnatan Flor Rodríguez

### TACNA – PERÚ

2025


## Índice General

- Introducción
- Guía de Laboratorio Nº 04 “Desarrollo Basado en Pruebas TDD”
   - 1. Información sobre el evento práctico
      - 1.1. Título del evento práctico
      - 1.2. Objetivos
      - 1.3. Tiempo de duración (horas)
      - 1.4. Resultados de Aprendizaje (RA)
      - 1.5. Recursos (Equipos, materiales, programas y otros)
   - 2. Procedimiento o Metodología
   - 3. Conclusiones (especifique por lo menos 3)
   - 4. Cuestionario (opcional)
   - 5. Referencias Bibliográficas
   - 6. Anexos (opcional)


## Introducción

 El Desarrollo Basado en Pruebas (TDD, Test-Driven Development) es una técnica de programación que propone  escribir primero las pruebas antes de implementar el código.
 Su principal beneficio es asegurar que el software cumpla los requisitos funcionales desde el inicio, facilitando la detección temprana de errores, la mejora del diseño y el mantenimiento continuo.
 En esta sesión práctica, los estudiantes aplicarán el ciclo TDD —Red, Verde, Refactor— sobre funcionalidades reales de  su proyecto final. Se espera que utilicen herramientas de
pruebas automatizadas apropiadas para el lenguaje en uso
(JUnit, Pytest, etc.), y documenten los resultados de la
sesión.


## Guía de Laboratorio Nº 04 “Desarrollo Basado en Pruebas TDD”

### 1. Información sobre el evento práctico

#### 1.1. Título del evento práctico

```
Aplicación del Desarrollo Basado en Pruebas (TDD) en Funcionalidades del
Proyecto Final.
```
#### 1.2. Objetivos

- Comprender el ciclo de desarrollo TDD y aplicarlo correctamente.
- Diseñar pruebas automatizadas antes de implementar las funciones.
- Evaluar y mejorar la calidad del código desarrollado a partir de los
    resultados de las pruebas.

#### 1.3. Tiempo de duración (horas)

```
Cuatro (04) horas.
```
#### 1.4. Resultados de Aprendizaje (RA)

- Aplica el ciclo TDD en el desarrollo de funcionalidades concretas.
- Implementa pruebas automatizadas con herramientas adecuadas.
- Mejora el código a través de refactorizaciones controladas por pruebas.

#### 1.5. Recursos (Equipos, materiales, programas y otros)

- Computadoras personales o de laboratorio
- Entorno de desarrollo (IDE: IntelliJ, VS Code, PyCharm, etc.)
- Herramienta de pruebas (JUnit, Pytest, Mocha, etc.)
- Proyecto final implementado (avance mínimo requerido: estructura
    básica)
- Guía del ciclo TDD (impresa o digital)

### 2. Procedimiento o Metodología

1. Elegir junto al docente una funcionalidad simple y aislada del proyecto (ej.
    cálculo de total, validación de usuario, etc.).
2. Aplicar el ciclo TDD:
    o RED: Escribir una prueba que inicialmente falle.
    o GREEN: Escribir el código mínimo necesario para que la prueba pase.
    o REFACTOR: Mejorar el diseño del código manteniendo las pruebas
       exitosas.
3. Crear al menos 3 casos de prueba distintos para la funcionalidad.
4. Ejecutar las pruebas y documentar los resultados (errores, aciertos, mejoras
    aplicadas).
5. Comentar en el equipo cómo el enfoque TDD impactó el diseño del código.
6. Elaborar un reporte de laboratorio que incluya:


```
o Descripción de la funcionalidad probada.
o Código de las pruebas.
o Capturas del resultado de las pruebas.
o Código implementado tras aplicar TDD.
o Lecciones aprendidas.
```
### 3. Conclusiones (especifique por lo menos 3)

1. TDD permite desarrollar funcionalidades con una validación continua desde su
    origen.
2. Las pruebas automatizadas se convierten en documentación viva del
    comportamiento esperado del sistema.
3. La práctica TDD favorece diseños simples, desacoplados y fáciles de
    mantener.

### 4. Cuestionario (opcional)

1. ¿Qué beneficios aporta escribir la prueba antes que el código?
2. ¿Qué dificultades encontraron al aplicar el ciclo TDD en su proyecto?
3. ¿Cómo puede integrarse TDD con una metodología ágil como Scrum?

### 5. Referencias Bibliográficas.............................................................................................

- BECK, K. “Test-Driven Development: By Example”. Addison-Wesley. 2021.
- OSHEROVE, R. “The Art of Unit Testing: With Examples in Java and .NET”.
    Manning Publications. 2022.
- FREEMAN, S., & PRYCE, N. “Growing Object-Oriented Software, Guided by
    Tests”. Addison-Wesley. 2020.

### 6. Anexos (opcional)

- Código de prueba y código correspondiente (por lenguaje)
- Plantilla de reporte de resultados
- Mapa del ciclo TDD (Red-Green-Refactor)


