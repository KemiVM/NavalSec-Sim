# NAVALSEC

Sistema profesional de monitorización y simulación naval con arquitectura de microservicios y capacidades de ciberdefensa.

<img width="1920" height="905" alt="image" src="https://github.com/user-attachments/assets/3e611539-0183-4851-a2d8-c1f41cf4adca" />

## Descripción

**NAVALSEC** es una plataforma de alta fidelidad para la simulación y gestión de sistemas críticos en entornos marítimos. Diseñada para operadores y entrenamiento técnico, permite supervisar en tiempo real el estado de propulsión, generación eléctrica, seguridad y navegación.

La interfaz incorpora una **estética profesional**, priorizando la legibilidad técnica mediante una iconografía SVG precisa y un sistema de localización bilingüe (Español/Inglés).

## Características

- **Monitorización Multisistema**: Control centralizado sobre el Motor Principal, Generador Auxiliar, Bombas de Achique, Radar Banda-X, Sistema de Gobierno y Contraincendios.
- **Seguridad y Roles de Usuario**:
  - Sistema de Autenticación de persistencia centralizada (FastAPI backend).
  - Gestión Multi-Rol con privilegios escalonados (`admin` y `user`).
  - Panel para promover y degradar administradores dinámicamente.
- **Dashboard Analítico**: Módulo en tiempo real con estadísticas de Uptime, Agentes Activos, e **Histórico de Amenazas Cibernéticas** interceptadas por el servidor.
- **Plataforma de Ciberdefensa (Mobile-Ready)**:
  - Motor de simulación para inyección de **Ataques DDOS RELAY** y **SPOOF SENSOR** desde terminales remotos.
  - Ofuscación de IPs y captura realista de Cabeceras HTTP `X-Forwarded-For` a través del proxy interno para activar las contramedidas y encender el Dashboard en Alerta Roja de manera fidedigna.
  - Micro-interfaz aislada e independiente en `/hacker.html` diseñada exclusivamente para visualización vertical y evasión total de bloqueos de autenticación de React.
- **Simulación Física Realista**: Comportamiento dinámico de sensores con inercia térmica, picos matemáticos controlados y respuesta física coherente al estado de los relés.
- **Guía Técnica Integrada**: Manual profesional "in-game" con procedimientos de recuperación y resolución de problemas (Troubleshooting).

## Stack Tecnológico

### Frontend

- **React 19** + **Vite** (TypeScript)
- **Tailwind CSS** + **Framer Motion** (Animaciones técnicas y transiciones suaves)
- **Recharts**: Evolución de estados a largo plazo y gráficas en vivo.
- **Nginx Reverse Proxy**: Enrutamiento avanzado de APIs estáticas, evasión de caché heurística y proxy pass.

### Backend (Microservicios)

- **Python 3.11** + **FastAPI**
- **Docker & Docker Compose**: Orquestación dinámica y despliegue inmutable.
- **SQLite**: Persistencia de logs de sistemas, histórico de anomalías y DB centralizada de cuentas de usuario cifradas.

## Instalación Rápida

1.  **Clonación**:

    ```bash
    git clone https://github.com/KemiVM/NavalSec-Sim.git
    cd NavalSec-Sim
    ```

2.  **Despliegue de los Microservicios**:

    ```bash
    docker compose up --build -d
    ```

3.  **Acceso (Desde tu PC y tu Móvil vía Wi-Fi local)**:
    - **Interfaz de Comando (PC)**: [http://localhost:8080](http://localhost:8080)
    - **Exploit Terminal Independiente (Móvil)**: `http://TU-IP-WIFI:8080/hacker.html`
    - **Documentación API Backend**: [http://localhost:8001/docs](http://localhost:8001/docs)

## Arquitectura

```
NavalSec-Sim/
├── frontend/           # Interfaz React y Exploits Nativos en HTML Puro (/public)
├── simulacion/         # Núcleo de inercia térmica, físicas y DB de Usuarios
├── datos/              # Gestión de persistencia e histórico gráfico
├── fallos/             # Motor asíncrono de inyección de ataques
└── docker-compose.yml  # Configuración de red y contenedores Nginx
```

## Licencia

Este proyecto se distribuye bajo la **Licencia MIT**. Consulte el archivo `LICENSE` para más detalles.

---

_Desarrollado con rigor técnico para la simulación naval de nueva generación._
