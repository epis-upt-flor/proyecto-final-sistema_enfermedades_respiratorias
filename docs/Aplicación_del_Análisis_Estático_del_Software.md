```
UNIVERSIDAD PRIVADA DE TACNA
FACULTAD DE INGENIERÍA
```
## ESCUELA DE INGENIERÍA DE SISTEMAS

Guía Práctica de Laboratorio

**“** Aplicación del Análisis Estático del

Software **”**

### Que se presenta para el curso:

### “ Construcción de Software I ”

### Docente:

### Mtro. Alberto Johnatan Flor Rodríguez

### TACNA – PERÚ

2025


## Índice General

- Introducción
- Guía de Laboratorio Nº 05 “Aplicación del Análisis Estático del Software”
   - 1. Información sobre el evento práctico
      - 1.1. Título del evento práctico
      - 1.2. Objetivos
      - 1.3. Tiempo de duración (horas)
      - 1.4. Resultados de Aprendizaje (RA)
      - 1.5. Recursos (Equipos, materiales, programas y otros)
   - 2. Procedimiento o Metodología
   - 3. Conclusiones (especifique por lo menos 3)
   - 4. Cuestionario (opcional)
   - 5. Referencias Bibliográficas.............................................................................................
   - 6. Anexos (opcional)


## Introducción

## El análisis estático de software consiste en examinar el código

## fuente sin ejecutarlo, con el fin de detectar errores

## potenciales, violaciones de estilo, código redundante o riesgos

## de seguridad. Esta técnica complementa las pruebas

## dinámicas y permite mejorar la calidad, legibilidad y

## mantenibilidad del software desde las primeras etapas del

## desarrollo.

## Durante este laboratorio, los estudiantes analizarán el código

## de su proyecto final utilizando herramientas de análisis

## estático específicas al lenguaje de programación que emplean

## (como SonarQube, Checkstyle, PMD, ESLint, Pylint, entre

## otros).


## Guía de Laboratorio Nº 05 “Aplicación del Análisis Estático del Software”

### 1. Información sobre el evento práctico

#### 1.1. Título del evento práctico

```
Aplicación del Análisis Estático en el Proyecto Final.
```
#### 1.2. Objetivos

- Aplicar herramientas de análisis estático para detectar problemas de
    calidad en el código.
- Interpretar los resultados y aplicar mejoras sugeridas por la herramienta.
- Integrar el análisis estático en el flujo de trabajo de desarrollo.

#### 1.3. Tiempo de duración (horas)

```
Cuatro (04) horas.
```
#### 1.4. Resultados de Aprendizaje (RA)

- Ejecuta herramientas de análisis estático sobre un proyecto real.
- Identifica y corrige errores o problemas de calidad señalados por la
    herramienta.
- Documenta el proceso de análisis y las mejoras aplicadas.

#### 1.5. Recursos (Equipos, materiales, programas y otros)

- Computadoras personales o de laboratorio
- Proyecto de software desarrollado
- Herramienta de análisis según lenguaje:
    o Java: SonarQube, Checkstyle o PMD
    o JavaScript: ESLint o JSHint
    o Python: Pylint o Bandit
    o C/C++: Cppcheck
- Conexión a internet
- IDE o editor de código con soporte para plugins

### 2. Procedimiento o Metodología

1. Seleccionar una herramienta de análisis estático compatible con el lenguaje del
    proyecto.
2. Configurar el entorno (instalar herramienta o ejecutarla desde CLI o extensión
    del editor).
3. Ejecutar el análisis sobre el código fuente del proyecto.
4. Identificar:
    o Errores sintácticos


```
o Malas prácticas
o Código no utilizado
o Posibles vulnerabilidades (si aplica)
```
5. Corregir al menos 5 hallazgos señalados por la herramienta.
6. Reejecutar el análisis para validar las correcciones.
7. Documentar el proceso con capturas, código antes/después y una tabla
    resumen.
8. Entregar un informe digital con:
    o Nombre del proyecto
    o Herramienta utilizada
    o Problemas detectados
    o Correcciones aplicadas
    o Capturas de evidencia

### 3. Conclusiones (especifique por lo menos 3)

1. El análisis estático permite detectar errores tempranos sin necesidad de
    ejecutar el programa.
2. Herramientas como ESLint, Pylint o SonarQube facilitan la mejora continua del
    código.
3. Incluir el análisis estático en el flujo de desarrollo ayuda a mantener altos
    estándares de calidad en el proyecto.

### 4. Cuestionario (opcional)

1. ¿Qué tipo de errores puede detectar el análisis estático que no se detectan
    fácilmente durante la ejecución?
2. ¿Cuál fue el hallazgo más crítico detectado en tu proyecto y cómo lo resolviste?
3. ¿Por qué es recomendable integrar herramientas de análisis estático en
    pipelines de CI/CD?

### 5. Referencias Bibliográficas.............................................................................................

- MCDONALD, B. “Clean Code in Python”. Packt Publishing. 2021.
- GUTMANN, A. “Software Quality Assurance: From Theory to Implementation”.
    Springer. 2022.
- SONARSOURCE. “SonarQube Documentation”. https://docs.sonarqube.org
- ESLint Documentation. https://eslint.org/docs/latest/

### 6. Anexos (opcional)

```
Presentar además una tabla con los hallazgos y resultados encontrados.
```
