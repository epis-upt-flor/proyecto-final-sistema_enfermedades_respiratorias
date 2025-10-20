# Diagramas UML - RespiCare MDSD

Este directorio contiene los diagramas PlantUML que documentan visualmente la arquitectura Model-Driven del proyecto RespiCare.

## 📊 Diagramas Disponibles

### 1. Domain Model (`domain-model.puml`)

**Descripción:** Representa el modelo de dominio completo (Platform Independent Models)

**Incluye:**
- Entidades de dominio (UserEntity, MedicalHistoryEntity)
- Value Objects (SymptomValueObject, LocationValueObject)
- Enumeraciones (UserRole, SymptomSeverity, SyncStatus)
- Relaciones entre modelos
- Reglas de negocio documentadas
- Aggregates

**Cuándo usar:**
- Para entender el modelo de dominio
- Al diseñar nuevas entidades
- Durante onboarding de desarrolladores
- En revisiones de arquitectura

### 2. MDSD Transformations (`mdsd-transformations.puml`)

**Descripción:** Muestra el flujo completo de transformaciones entre modelos

**Incluye:**
- Platform Independent Models (PIM)
- Platform Specific Models (PSM) - Persistencia
- Platform Specific Models (PSM) - API
- Capa de transformación (Repositories, Mappers)
- Flujo bidireccional de transformaciones

**Cuándo usar:**
- Para entender cómo fluyen los datos entre capas
- Al implementar nuevos repositories
- Para debugging de problemas de transformación
- En documentación técnica

### 3. Clean Architecture MDSD (`clean-architecture-mdsd.puml`)

**Descripción:** Mapeo de Clean Architecture a conceptos MDSD

**Incluye:**
- Capas de Clean Architecture
- Regla de dependencias
- Mapeo a PIM/PSM
- Flujo de transformaciones por capa
- Separación de responsabilidades

**Cuándo usar:**
- Para comprender la arquitectura general
- Al agregar nuevas capas o servicios
- Durante training de arquitectura
- En documentación de proyecto

## 🚀 Generar Diagramas

### Requisitos

```bash
# Instalar PlantUML (Ubuntu/Debian)
sudo apt-get install plantuml graphviz

# Instalar PlantUML (macOS)
brew install plantuml graphviz

# Instalar PlantUML (Windows)
# Descargar desde: https://plantuml.com/download
```

### Generar Todos los Diagramas

```bash
# Desde el directorio raíz del proyecto
npm run diagrams:generate

# O manualmente
cd docs/diagrams
plantuml *.puml -o output
```

### Generar un Diagrama Específico

```bash
cd docs/diagrams
plantuml domain-model.puml -o output
```

### Formatos de Salida

```bash
# PNG (default)
plantuml *.puml -tpng -o output

# SVG (vectorial, recomendado para web)
plantuml *.puml -tsvg -o output

# PDF
plantuml *.puml -tpdf -o output

# ASCII art (para terminal)
plantuml *.puml -ttxt -o output
```

## 📁 Estructura de Directorios

```
docs/diagrams/
├── README.md                        # Este archivo
├── domain-model.puml                # Modelo de dominio
├── mdsd-transformations.puml        # Transformaciones MDSD
├── clean-architecture-mdsd.puml     # Arquitectura limpia
└── output/                          # Diagramas generados
    ├── domain-model.png
    ├── mdsd-transformations.png
    └── clean-architecture-mdsd.png
```

## 🎨 Personalización

### Temas Disponibles

PlantUML incluye varios temas:

```plantuml
!theme plain       # Simple blanco y negro
!theme cerulean    # Azul
!theme superhero   # Oscuro
!theme spacelab    # Espacial
```

Para cambiar el tema, edita la segunda línea de cualquier archivo `.puml`:

```plantuml
@startuml Domain Model
!theme cerulean    # Cambia esto
...
@enduml
```

### Colores Personalizados

```plantuml
skinparam class {
    BackgroundColor<<PIM>> LightBlue
    BackgroundColor<<PSM>> LightYellow
    BorderColor Black
    ArrowColor DarkGreen
}
```

## 📖 Sintaxis PlantUML

### Clases

```plantuml
class UserEntity {
  - id: string
  - name: string
  --
  + isValid(): boolean
  + canAccess(): boolean
}
```

### Relaciones

```plantuml
' Composición
MedicalHistory *-- Symptom

' Agregación
User o-- MedicalHistory

' Asociación
User --> MedicalHistory : creates

' Herencia
Doctor --|> User

' Implementación
MongoRepository ..|> Repository
```

### Notas

```plantuml
note right of UserEntity
  Business Rules:
  • Email must be unique
  • Password min 8 chars
end note
```

### Paquetes

```plantuml
package "Domain Layer" {
  class UserEntity
  class MedicalHistory
}
```

## 🔄 Actualización Automática

Los diagramas se regeneran automáticamente en:

1. **CI/CD Pipeline** - En cada push que modifique modelos de dominio
2. **Pre-commit Hook** - Antes de cada commit (opcional)
3. **Comando Manual** - `npm run diagrams:generate`

## 📋 Checklist de Actualización

Cuando modifiques modelos de dominio:

- [ ] Actualizar archivo `.puml` correspondiente
- [ ] Regenerar diagramas: `npm run diagrams:generate`
- [ ] Verificar que el diagrama se ve correctamente
- [ ] Commit archivos `.puml` (NO los `.png`)
- [ ] CI/CD regenerará imágenes automáticamente

## 🎓 Recursos de Aprendizaje

### PlantUML

- [Documentación Oficial](https://plantuml.com/)
- [Referencia Rápida](https://plantuml.com/guide)
- [Galería de Ejemplos](https://real-world-plantuml.com/)
- [Editor Online](https://www.plantuml.com/plantuml/uml/)

### UML

- [UML Class Diagrams](https://www.uml-diagrams.org/class-diagrams-overview.html)
- [UML Relationship Types](https://www.visual-paradigm.com/guide/uml-unified-modeling-language/uml-aggregation-vs-composition/)

### MDSD

- [Model-Driven Architecture Guide](https://www.omg.org/mda/)
- [Platform Independent Models](https://en.wikipedia.org/wiki/Platform-independent_model)

## 🛠️ Tips y Trucos

### 1. Preview en VS Code

Instalar extensión: `PlantUML` de jebbs

```json
// .vscode/settings.json
{
  "plantuml.render": "PlantUMLServer",
  "plantuml.server": "https://www.plantuml.com/plantuml"
}
```

### 2. Generar en Watch Mode

```bash
# Regenerar automáticamente al guardar
watch -n 2 "plantuml *.puml -o output"
```

### 3. Incluir en Documentación

```markdown
# Mi Documentación

![Domain Model](diagrams/output/domain-model.png)

El diagrama muestra...
```

### 4. Optimizar para Web

```bash
# SVG comprimido
plantuml *.puml -tsvg -o output
svgo output/*.svg
```

## 🐛 Troubleshooting

### Error: "Cannot find Java"

PlantUML requiere Java:

```bash
# Ubuntu/Debian
sudo apt-get install default-jre

# macOS
brew install java
```

### Error: "Graphviz not found"

```bash
# Ubuntu/Debian
sudo apt-get install graphviz

# macOS
brew install graphviz

# Windows
# Descargar desde: https://graphviz.org/download/
```

### Diagrama no se genera correctamente

1. Verificar sintaxis: `plantuml -checkonly archivo.puml`
2. Probar en [editor online](https://www.plantuml.com/plantuml/uml/)
3. Revisar logs: `plantuml -verbose archivo.puml`

## 📞 Soporte

Para problemas con diagramas:

- 📧 Email: dev@respicare.com
- 💬 Discord: #documentation
- 🐛 Issues: GitHub Issues con tag `documentation`

---

**Última actualización:** Octubre 2025  
**Mantenido por:** Equipo de Arquitectura RespiCare

