import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Info, Settings, AlertTriangle, ShieldCheck, MonitorPlay, Activity, LayoutDashboard, Radio, Database, Ship, Zap, Droplets, Radar, Navigation, Flame } from "lucide-react"

export function Ayuda() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  return (
    <motion.div 
        className="flex flex-col gap-6 h-full pb-8 max-w-6xl mx-auto w-full"
        variants={container}
        initial="hidden"
        animate="show"
    >
      <div className="flex justify-between items-center bg-card/60 rounded-xl p-6 shadow-sm border mt-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
            <Info className="h-8 w-8 text-primary" />
            Centro de Ayuda NAVALSEC
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Guía exhaustiva, manual de usuario y resolución de problemas del simulador naval.
          </p>
        </div>
      </div>

      <Tabs defaultValue="sistemas" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-8 h-auto p-1 bg-muted/50 rounded-xl">
          <TabsTrigger value="sistemas" className="py-3 text-sm md:text-base font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg flex items-center gap-2">
            <Settings className="h-4 w-4" />
            1. Guía de Sistemas Navales
          </TabsTrigger>
          <TabsTrigger value="manual" className="py-3 text-sm md:text-base font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg flex items-center gap-2">
            <MonitorPlay className="h-4 w-4" />
            2. Manual de la Interfaz
          </TabsTrigger>
          <TabsTrigger value="troubleshooting" className="py-3 text-sm md:text-base font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            3. Solución de Problemas
          </TabsTrigger>
        </TabsList>

        {/* --- PESTAÑA: SISTEMAS NAVALES --- */}
        <TabsContent value="sistemas" className="space-y-6 mt-0">
          <motion.div variants={item}>
            <Card className="shadow-md border-primary/5">
              <CardHeader className="border-b bg-muted/10">
                <CardTitle className="text-2xl">Sistemas Navales Simulados</CardTitle>
                <CardDescription className="text-base text-foreground/80">
                  Comprende la física y operación térmica/mecánica detrás de cada subsistema de la embarcación.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Accordion type="single" collapsible className="w-full space-y-2">
                  <AccordionItem value="item-1" className="border rounded-lg px-4 bg-card hover:bg-muted/30 transition-colors">
                    <AccordionTrigger className="text-lg font-bold hover:no-underline py-4">
                      <span className="flex items-center gap-3"><Ship className="h-5 w-5 text-blue-500" /> Motor Principal (Main Engine)</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                      El corazón propulsor del barco. Este sistema diésel pesado se ve afectado principalmente por dos variables que se simulan volumétrica e inercialmente:
                      <ul className="list-disc pl-6 mt-3 space-y-2">
                        <li><strong>Revoluciones (RPM):</strong> La velocidad de giro. Valores normales rondan las 1000 RPM. Superar las 1200 RPM somete al motor a estrés.</li>
                        <li><strong>Temperatura (°C):</strong> Crece lentamente de forma gradual simulando la inercia térmica del bloque del motor. Una refrigeración deficiente disparará la temperatura por encima de los 100°C forzando el salto del relé térmico para evitar la fusión del bloque.</li>
                      </ul>
                      <em>Riesgo: Un corte abrupto dejará la embarcación a la deriva sin propulsión.</em>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2" className="border rounded-lg px-4 bg-card hover:bg-muted/30 transition-colors">
                    <AccordionTrigger className="text-lg font-bold hover:no-underline py-4">
                      <span className="flex items-center gap-3"><Zap className="h-5 w-5 text-yellow-500" /> Generador Auxiliar (Aux Generator)</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                      Encargado de dotar de corriente eléctrica alterna a toda la infraestructura de la nave.
                      <ul className="list-disc pl-6 mt-3 space-y-2">
                        <li><strong>Voltaje (V):</strong> Oscila de forma sinusoidal buscando mantenerse anclado en los 220V/400V estables según el régimen. Un voltaje inestable fundirá fusibles.</li>
                        <li><strong>Frecuencia (Hz):</strong> Estable a 50/60Hz. Representa la calidad de la onda magnética generada. Si los polos se sobrecargan magnéticamente la frecuencia varía antes del colapso del sistema.</li>
                      </ul>
                      <em>Riesgo: La caída del generador provoca un "Blackout" apagando cuadros principales.</em>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3" className="border rounded-lg px-4 bg-card hover:bg-muted/30 transition-colors">
                    <AccordionTrigger className="text-lg font-bold hover:no-underline py-4">
                      <span className="flex items-center gap-3"><Droplets className="h-5 w-5 text-cyan-500" /> Bombas de Achique (Bilge System)</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                      Gestionan y mantienen seco el fondo y sentina de la embarcación del constante filtrado de aguas oceánicas e internas.
                      <ul className="list-disc pl-6 mt-3 space-y-2">
                        <li><strong>Nivel de Agua (cm):</strong> Monitoriza qué tan inundada está la cámara inferior. Las bombas extraen agua automáticamente a un ratio fijo (ej: 0.5 cm por segundo).</li>
                        <li><strong>Caudal (L/s):</strong> La capacidad de extracción vigente.</li>
                      </ul>
                      <em>La simulación inyecta un volumen residual constante. Si se desactiva la bomba, el nivel ascenderá simulando una vía de agua interna. Superar el umbral máximo representa un riesgo inminente para la flotabilidad de la nave.</em>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4" className="border rounded-lg px-4 bg-card hover:bg-muted/30 transition-colors">
                    <AccordionTrigger className="text-lg font-bold hover:no-underline py-4">
                      <span className="flex items-center gap-3"><Radar className="h-5 w-5 text-green-500" /> Sistema de Radar (Radar System)</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                      Proporciona "conciencia situacional" (visibilidad en millas náuticas) previniendo colisiones.
                      <ul className="list-disc pl-6 mt-3 space-y-2">
                        <li><strong>Rango (nm):</strong> Alcance de las dianas devueltas. Un ataque de interferencia de radiofrecuencia (Jamming) puede truncar dramáticamente esta visibilidad.</li>
                        <li><strong>Frecuencia de Barrido (GHz):</strong> Sensibilidad del aparato. Una bajada indica degradación del emisor magneto-resonante.</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5" className="border rounded-lg px-4 bg-card hover:bg-muted/30 transition-colors">
                    <AccordionTrigger className="text-lg font-bold hover:no-underline py-4">
                      <span className="flex items-center gap-3"><Navigation className="h-5 w-5 text-slate-400" /> Sistema de Gobierno (Steering)</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                      Control hidráulico-mecánico de la pala del timón en popa que direcciona el navío.
                      <ul className="list-disc pl-6 mt-3 space-y-2">
                        <li><strong>Presión Hidráulica (bar):</strong> Requiere más de 120 bares para ser gobernable. Caídas de presión indican fugas en las tuberías y causarán retrasos en el gobierno del puente de mando.</li>
                        <li><strong>Ángulo del Timón (°):</strong> La posición fáctica del deflector.</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-6" className="border rounded-lg px-4 bg-card hover:bg-muted/30 transition-colors">
                    <AccordionTrigger className="text-lg font-bold hover:no-underline py-4">
                      <span className="flex items-center gap-3"><Flame className="h-5 w-5 text-red-500" /> Contraincendios (Fire Suppression)</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                      El sistema de extinción por red de rociadores o agentes químicos.
                      <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm">
                        <strong>Protocolo de Emergencia:</strong> La detección de fuego activa automáticamente el aislamiento eléctrico del sistema afectado. Requiere supervisión humana inmediata.
                      </div>
                      <ul className="list-disc pl-6 mt-3 space-y-2">
                        <li><strong>Presión del Colector (bar):</strong> Similar al gobierno, la red debe estar constantemente presurizada, a punto para saltar.</li>
                        <li><strong>Detectores de Humo y Temperatura:</strong> Son la variable disparadora; al subir saltarán las electroválvulas expulsando el agente en toda la cámara afectada.</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* --- PESTAÑA: MANUAL DEL USUARIO --- */}
        <TabsContent value="manual" className="space-y-6 mt-0">
          <motion.div variants={item}>
             <Card className="shadow-md border-primary/5">
               <CardHeader className="border-b bg-muted/10">
                 <CardTitle className="text-2xl">Manual de Usuario | Interfaces</CardTitle>
               </CardHeader>
               <CardContent className="pt-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2 text-primary mb-3"><LayoutDashboard className="h-5 w-5" /> Tu Dashboard Principal</h3>
                    <p className="text-muted-foreground mb-4">Representa la perspectiva cenital de la unidad naval. Implementa un sistema de <strong>indicadores interactivos (Hotspots)</strong>:</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 bg-muted/20 p-4 rounded-lg">
                      <li><strong>Indicadores Verdes (Frecuencia normal):</strong> Funcionamiento nominal del subsistema.</li>
                      <li><strong>Indicadores Grises (Inactivos):</strong> Desactivación manual del sistema. Esto puede comprometer funciones dependientes (ej. la desactivación del achique provoca inundación).</li>
                      <li><strong>Indicadores Rojos (Frecuencia elevada):</strong> Estado de Disparo (TRIPPED). Indica un fallo crítico o intrusión detectada.</li>
                    </ul>
                    <p className="text-muted-foreground">Si pones el ratón sobre un punto visualizarás una tarjeta opaca con telemetría en vivo, si das click navegarás a su consola de mando.</p>
                  </div>

                  <hr />

                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2 text-primary mb-3"><Radio className="h-5 w-5" /> Sala de Control (Simulación)</h3>
                    <p className="text-muted-foreground mb-4">La Sala de Control o Telemétrica te ofrece <strong>gráficas en tiempo real</strong> de todos los subsistemas actualizándose a 2 Hz.</p>
                    <p className="text-muted-foreground mb-4">Puedes forzar anomalías en estas gráficas manualmente inyectando "Fuerza Bruta" o "Inyección de Señales" pulsando los botones de debajo de la gráfica. Esto corromperá temporalmente los sensores como simulación a una amenaza cibernética o fallo de sensor I/O.</p>
                  </div>

                  <hr />
                  
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2 text-primary mb-3"><Database className="h-5 w-5" /> Historial de Datos</h3>
                    <p className="text-muted-foreground mb-4">La grabadora de vuelo y cuaderno de bitácora del barco. Posee 3 divisiones críticas:</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 bg-muted/20 p-4 rounded-lg">
                      <li><strong>Informes Normales:</strong> Cada 20 segundos el ordenador captura el estado perfecto del barco y lo encripta en logs verdes silenciosos.</li>
                      <li><strong>Advertencias (Amarillas):</strong> Si un sensor entra en un umbral del `90%` del máximo soportable (ej: temperatura motor rozando los 97°C), el sistema interrumpe el reloj de los 20 segundos y <strong>fuerza la inyección de un log inmediato</strong>. Aisla estos logs con el botón amarillo para intuir problemas preventivamente.</li>
                      <li><strong>Críticas (Rojas):</strong> Se almacenan en el momento exacto en el que el relé salta producto del sensor alcanzando su límite máximo absoluto (ej: 100°C extrictos). Son los expedientes de fallo y colapsos.</li>
                    </ul>
                  </div>
               </CardContent>
             </Card>
          </motion.div>
        </TabsContent>

        {/* --- PESTAÑA: TROUBLESHOOTING --- */}
        <TabsContent value="troubleshooting" className="space-y-6 mt-0">
           <motion.div variants={item}>
             <Card className="shadow-md border-primary/5 bg-gradient-to-br from-red-50 to-red-50/10 dark:from-red-950/20 dark:to-background border-red-500/20">
               <CardHeader className="border-b border-red-500/10 bg-red-500/5">
                 <CardTitle className="text-2xl text-red-600 dark:text-red-400 flex items-center gap-2">
                    <Activity className="h-6 w-6" /> Troubleshooting de Emergencia
                 </CardTitle>
                 <CardDescription className="text-base">
                    Manual de procedimientos operativos y reactivos (SOP) ante anomalías del sistema NAVALSEC.
                 </CardDescription>
               </CardHeader>
               <CardContent className="pt-6 space-y-6">
                 <div className="bg-background rounded-xl p-5 shadow-sm border">
                    <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                       <AlertTriangle className="h-5 w-5 text-destructive" /> ¿Por qué han saltado alertas rojas (TRIPPED) globales?
                    </h4>
                    <p className="text-muted-foreground">Un estado `TRIPPED` implica un apagado de emergencia no programado. El sistema "rompió" el cicuito por que uno de los sensores traspasó la barrera límite de supervivencia del equipo (Safe Max / Safe Min). Esto previno que el bloque del motor prendiera fuego o que el generador explotara por un cortocircuito sostenido.</p>
                 </div>

                 <div className="bg-background rounded-xl p-5 shadow-sm border mt-4">
                    <h4 className="font-bold text-lg mb-2 text-primary">¿Cómo recupero mi sistema tras un TRIPPED?</h4>
                    <ul className="list-decimal list-inside text-muted-foreground space-y-2 mt-2">
                        <li>De forma predeterminada, el agente software de abordo de la simulación rearmará el relé térmico/magnético automáticamente pasados 5-7 segundos por considerarlo un fallo transitorio. Verás que la vista vuelve a verde.</li>
                         <li>Si la condición de fallo persiste (por ejemplo, una inundación crítica no evacuada o un vector de suplantación activo de alta frecuencia), el sistema reingresará en estado TRIPPED de forma inmediata, generando notificaciones persistentes.</li>
                        <li><strong>Rearme Manual:</strong> Acceda al panel de Inyección para neutralizar el vector de ataque o reconfigure el relé manualmente desde la Sala de Control tras normalizar las lecturas de los sensores.</li>
                    </ul>
                 </div>

                 <div className="bg-background rounded-xl p-5 shadow-sm border mt-4">
                    <h4 className="font-bold text-lg mb-2 text-yellow-600 dark:text-yellow-500">¿Qué indica una IP 'Desconocida' en un Ciberataque?</h4>
                     <p className="text-muted-foreground">El colector de registros audita todas las peticiones contra una lista de confianza. Si se detecta un paquete cuya firma IP no coincide con la del subsistema origen, el cortafuegos registrará el evento como intrusión. Estas direcciones IP suplantadas pueden monitorizarse en el registro detallado de la Bitácora.</p>
                 </div>
               </CardContent>
             </Card>
           </motion.div>
        </TabsContent>
        
      </Tabs>
    </motion.div>
  )
}
