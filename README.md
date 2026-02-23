# 🚢 NAVALSEC - Ship Simulator V3.0

Sistema profesional de monitorización y simulación naval con arquitectura de microservicios y capacidades de ciberdefensa.

<img width="1920" height="905" alt="image" src="https://github.com/user-attachments/assets/3e611539-0183-4851-a2d8-c1f41cf4adca" />

## 📋 Descripción

**NAVALSEC** es una plataforma de alta fidelidad para la simulación y gestión de sistemas críticos en entornos marítimos. Diseñada para operadores y entrenamiento técnico, permite supervisar en tiempo real el estado de propulsión, generación eléctrica, seguridad y navegación.

La interfaz ha sido refinada para ofrecer una estética de nivel industrial, eliminando informalidades y priorizando la legibilidad técnica mediante una iconografía SVG precisa y un sistema de localización bilingüe (Español/Inglés).

## ✨ Características de Vanguardia

- **Monitorización Multisistema**: Control centralizado sobre el Motor Principal, Generador Auxiliar, Bombas de Achique, Radar Banda-X, Sistema de Gobierno y Contraincendios.
- **Configuración Avanzada**: Panel de "Parámetros" para el ajuste dinámico de intervalos de refresco de UI y frecuencia de registro en el servidor.
- **Seguridad y Ciberdefensa**:
  - Gestión de **Lista Blanca de IPs** en tiempo real.
  - Detección inteligente de ataques: las anomalías de red son filtradas para distinguir entre intervenciones autorizadas y posibles ciberataques.
- **Personalización de Interfaz**: Sistema de persistencia local para ocultar sistemas o reordenar tarjetas del Dashboard y Simulación según la prioridad operativa.
- **Guía Técnica Integrada**: Manual profesional "in-game" con procedimientos de recuperación y resolución de problemas (Troubleshooting).
- **Simulación Física Realista**: Comportamiento dinámico de sensores con inercia térmica y respuesta física coherente al estado de los relés.

## 🛠️ Stack Tecnológico

### Frontend

- **React 19** + **Vite** (TypeScript)
- **Tailwind CSS** + **Framer Motion** (Animaciones técnicas)
- **Settings API**: Persistencia local de preferencias de usuario.
- **Lucide Icons**: Iconografía técnica profesional.

### Backend (Microservicios)

- **Python 3.11** + **FastAPI**
- **Docker & Docker Compose**: Orquestación completa.
- **SQLite**: Persistencia de logs e histórico de anomalías.

## 🚀 Instalación Rápida

1.  **Clonación**:

    ```bash
    git clone https://github.com/tu-usuario/navalsec-sim.git
    cd navalsec-sim
    ```

2.  **Despliegue**:

    ```bash
    docker compose up --build
    ```

3.  **Acceso**:
    - **Interfaz de Usuario**: [http://localhost:3000](http://localhost:3000)
    - **Documentación API**: [http://localhost:8001/docs](http://localhost:8001/docs)

## 📂 Arquitectura

```
navalsec-sim/
├── frontend/           # Interfaz React (Dashboard & Control)
├── simulacion/         # Núcleo de física y lógica de sistemas
├── datos/              # Gestión de persistencia e histórico
├── fallos/             # Motor de inyección de anomalías
└── docker-compose.yml  # Configuración de red y contenedores
```

## 📄 Licencia

Este proyecto se distribuye bajo la **Licencia MIT**. Consulte el archivo `LICENSE` para más detalles.

---

Desarrollado con rigor técnico para la próxima generación de simulación naval.
