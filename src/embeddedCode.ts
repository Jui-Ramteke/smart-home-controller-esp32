export const COMPLETE_INO_CODE = `/*
 * =========================================================================================
 * PROJECT: Industry-Grade Smart Home Controller (ESP32 / Arduino C++)
 * =========================================================================================
 * MODULES:
 *  - Sensor Module: PIR (GPIO 13), LDR (GPIO 34 ADC1), DHT22 (GPIO 4)
 *  - Actuators: Room Light Relay (GPIO 2), Fan Relay (GPIO 15)
 *  - Security Alarm: Active Piezo Buzzer (GPIO 25), Red Alert LED (GPIO 32)
 *  - System Status: Green Heartbeat LED (GPIO 33)
 *  - Manual Overrides: Auto/Manual Switch (GPIO 14), Light Sw (GPIO 27), Fan Sw (GPIO 26), Security Sw (GPIO 12)
 *  - Display: SSD1306 128x64 I2C OLED (SDA=21, SCL=22)
 *  - Serial Telemetry: 115200 Baud UART
 *
 * AUTOMATION RULES IMPLEMENTED:
 *  - Rule 1: Auto Light = (Motion == DETECTED && Room == DARK) -> ON; OFF after timeout without motion
 *  - Rule 2: Auto Fan = (Temperature > 28.0°C) -> ON; (Temperature < 26.5°C) -> OFF (Hysteresis)
 *  - Rule 3: Security = (Security Mode == ON && Motion == DETECTED) -> Buzzer + Red Alert + OLED Warning
 *  - Rule 4: Manual Override = User manual switches take absolute priority over automatic rules
 * =========================================================================================
 */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>

// --------------------------- PIN DEFINITIONS ---------------------------
#define PIN_PIR           13   // PIR Motion Sensor (Digital IN)
#define PIN_LDR           34   // LDR Sensor (ADC1_CH6, 0-4095)
#define PIN_DHT           4    // DHT22 Data Pin
#define DHTTYPE           DHT22

#define PIN_SW_MANUAL     14   // Toggle Switch: 0=Auto, 1=Manual Override (Pull-down)
#define PIN_SW_LIGHT      27   // Manual Light Push/Toggle (Pull-down)
#define PIN_SW_FAN        26   // Manual Fan Push/Toggle (Pull-down)
#define PIN_SW_SECURITY   12   // Security Arm/Disarm Switch (Pull-down)

#define PIN_RELAY_LIGHT   2    // Room Light Relay (Active HIGH)
#define PIN_RELAY_FAN     15   // Fan Relay (Active HIGH)
#define PIN_BUZZER        25   // Piezo Buzzer / Alarm (Active HIGH/PWM)
#define PIN_LED_RED       32   // Red Alert LED
#define PIN_LED_GREEN     33   // Green Heartbeat / Status LED

#define SCREEN_WIDTH      128
#define SCREEN_HEIGHT     64
#define OLED_RESET        -1
#define SCREEN_ADDRESS    0x3C

// --------------------------- CALIBRATION & THRESHOLDS -------------------
const int   LDR_DARK_THRESHOLD   = 2000;   // ADC values > 2000 indicate DARK room
const float TEMP_THRESHOLD_ON    = 28.0;   // Fan turns ON when Temp > 28°C
const float TEMP_THRESHOLD_OFF   = 26.5;   // Fan turns OFF when Temp < 26.5°C (1.5°C Hysteresis)
const unsigned long LIGHT_TIMEOUT_MS = 10000; // Light off delay after motion stops (10s for demo)

// --------------------------- GLOBAL OBJECTS & STATES ------------------
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
DHT dht(PIN_DHT, DHTTYPE);

struct SensorData {
  bool motionDetected;
  int  ldrRaw;
  bool isDark;
  float temperature;
  float humidity;
  bool securityArmed;
  bool manualOverrideActive;
  bool manualLightState;
  bool manualFanState;
};

struct ActuatorData {
  bool lightRelay;
  bool fanRelay;
  bool buzzer;
  bool redLed;
  bool greenLed;
  bool alarmTriggered;
};

SensorData sensors;
ActuatorData actuators;

unsigned long lastMotionTime = 0;
unsigned long lastSerialPrint = 0;
unsigned long lastDisplayUpdate = 0;
unsigned long lastHeartbeat = 0;
bool heartbeatState = false;

// --------------------------- SETUP -------------------------------------
void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.println(F("\\n=================================================="));
  Serial.println(F("  ESP32 SMART HOME CONTROLLER - SYSTEM BOOT"));
  Serial.println(F("=================================================="));

  // Configure Digital Inputs with Internal Pull-downs
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_LDR, INPUT);
  pinMode(PIN_SW_MANUAL, INPUT_PULLDOWN);
  pinMode(PIN_SW_LIGHT, INPUT_PULLDOWN);
  pinMode(PIN_SW_FAN, INPUT_PULLDOWN);
  pinMode(PIN_SW_SECURITY, INPUT_PULLDOWN);

  // Configure Outputs
  pinMode(PIN_RELAY_LIGHT, OUTPUT);
  pinMode(PIN_RELAY_FAN, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_LED_GREEN, OUTPUT);

  // Safe initial actuator state
  digitalWrite(PIN_RELAY_LIGHT, LOW);
  digitalWrite(PIN_RELAY_FAN, LOW);
  digitalWrite(PIN_BUZZER, LOW);
  digitalWrite(PIN_LED_RED, LOW);
  digitalWrite(PIN_LED_GREEN, HIGH);

  // Initialize DHT22
  dht.begin();

  // Initialize OLED Display (I2C)
  Wire.begin(21, 22);
  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("[ERROR] SSD1306 OLED allocation failed!"));
  } else {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(10, 15);
    display.println(F("SMART HOME CONTROLLER"));
    display.setCursor(20, 35);
    display.println(F("Initializing..."));
    display.display();
    delay(1000);
  }

  Serial.println(F("[SYSTEM] Hardware initialization complete. Starting Control Loop."));
}

// --------------------------- SENSOR MODULE -----------------------------
void readSensors() {
  // 1. PIR Sensor
  sensors.motionDetected = (digitalRead(PIN_PIR) == HIGH);
  if (sensors.motionDetected) {
    lastMotionTime = millis();
  }

  // 2. LDR Analog Reading (Multi-sample averaging for clean signal)
  int ldrSum = 0;
  for (int i = 0; i < 5; i++) {
    ldrSum += analogRead(PIN_LDR);
    delayMicroseconds(200);
  }
  sensors.ldrRaw = ldrSum / 5;
  sensors.isDark = (sensors.ldrRaw >= LDR_DARK_THRESHOLD);

  // 3. DHT22 Temperature & Humidity (with fallback validation)
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  if (!isnan(t) && !isnan(h)) {
    sensors.temperature = t;
    sensors.humidity = h;
  }

  // 4. Switches / Control inputs
  sensors.manualOverrideActive = (digitalRead(PIN_SW_MANUAL) == HIGH);
  sensors.manualLightState     = (digitalRead(PIN_SW_LIGHT) == HIGH);
  sensors.manualFanState       = (digitalRead(PIN_SW_FAN) == HIGH);
  sensors.securityArmed        = (digitalRead(PIN_SW_SECURITY) == HIGH);
}

// --------------------------- AUTOMATION RULES MODULE -------------------
void executeRules() {
  // ----------------------------------------------------
  // RULE 3 & SECURITY HANDLING (Runs in Auto and Manual)
  // ----------------------------------------------------
  if (sensors.securityArmed && sensors.motionDetected) {
    actuators.alarmTriggered = true;
    actuators.buzzer = true;
    actuators.redLed = true;
  } else {
    // If security disarmed or no active intruder
    if (!sensors.securityArmed) {
      actuators.alarmTriggered = false;
      actuators.buzzer = false;
      actuators.redLed = false;
    }
  }

  // ----------------------------------------------------
  // RULE 4: MANUAL OVERRIDE MODE
  // ----------------------------------------------------
  if (sensors.manualOverrideActive) {
    // User switches directly drive the relays
    actuators.lightRelay = sensors.manualLightState;
    actuators.fanRelay   = sensors.manualFanState;
    return; // Skip automatic algorithms
  }

  // ----------------------------------------------------
  // RULE 1: AUTOMATIC LIGHT CONTROL
  // ----------------------------------------------------
  if (sensors.motionDetected && sensors.isDark) {
    actuators.lightRelay = true;
  } else if (!sensors.motionDetected) {
    // Check timeout
    if (millis() - lastMotionTime > LIGHT_TIMEOUT_MS) {
      actuators.lightRelay = false;
    }
  }

  // ----------------------------------------------------
  // RULE 2: AUTOMATIC FAN CONTROL (Hysteresis)
  // ----------------------------------------------------
  if (sensors.temperature >= TEMP_THRESHOLD_ON) {
    actuators.fanRelay = true;
  } else if (sensors.temperature <= TEMP_THRESHOLD_OFF) {
    actuators.fanRelay = false;
  }
}

// --------------------------- ACTUATOR DRIVER ---------------------------
void applyOutputs() {
  digitalWrite(PIN_RELAY_LIGHT, actuators.lightRelay ? HIGH : LOW);
  digitalWrite(PIN_RELAY_FAN,   actuators.fanRelay   ? HIGH : LOW);
  digitalWrite(PIN_BUZZER,      actuators.buzzer     ? HIGH : LOW);
  digitalWrite(PIN_LED_RED,     actuators.redLed     ? HIGH : LOW);

  // Heartbeat LED toggle every 500ms
  if (millis() - lastHeartbeat >= 500) {
    lastHeartbeat = millis();
    heartbeatState = !heartbeatState;
    digitalWrite(PIN_LED_GREEN, heartbeatState ? HIGH : LOW);
  }
}

// --------------------------- OLED DISPLAY MODULE -----------------------
void updateDisplay() {
  if (millis() - lastDisplayUpdate < 250) return; // Refresh at 4 Hz
  lastDisplayUpdate = millis();

  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Header Banner
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("SMART HOME ["));
  display.print(sensors.manualOverrideActive ? F("MANUAL") : F("AUTO"));
  display.print(F("]"));

  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Row 1: Temp & Light Lux
  display.setCursor(0, 14);
  display.print(F("Temp: "));
  display.print(sensors.temperature, 1);
  display.print((char)247); // Degree symbol
  display.print(F("C"));

  display.setCursor(75, 14);
  display.print(sensors.isDark ? F("[DARK]") : F("[BRIGHT]"));

  // Row 2: PIR Motion & Mode
  display.setCursor(0, 26);
  display.print(F("Motion: "));
  display.print(sensors.motionDetected ? F("DETECTED") : F("NONE"));

  // Row 3: Actuator Relays
  display.setCursor(0, 38);
  display.print(F("Light: "));
  display.print(actuators.lightRelay ? F("ON ") : F("OFF"));
  display.setCursor(68, 38);
  display.print(F("Fan: "));
  display.print(actuators.fanRelay ? F("ON ") : F("OFF"));

  // Row 4: Security Status / Intruder Alert Banner
  display.setCursor(0, 50);
  if (actuators.alarmTriggered) {
    display.fillRect(0, 48, 128, 16, SSD1306_WHITE);
    display.setTextColor(SSD1306_BLACK, SSD1306_WHITE);
    display.setCursor(14, 52);
    display.print(F("!! INTRUDER ALERT !!"));
  } else {
    display.print(F("Security: "));
    display.print(sensors.securityArmed ? F("ARMED (SAFE)") : F("DISARMED"));
  }

  display.display();
}

// --------------------------- SERIAL MONITOR MODULE ---------------------
void printSerialTelemetry() {
  if (millis() - lastSerialPrint < 1000) return; // 1 Hz stream
  lastSerialPrint = millis();

  // Print exact industry-standard format
  Serial.print(F("Temperature: "));
  Serial.print((int)round(sensors.temperature));
  Serial.print(F(" C | "));

  Serial.print(F("Room: "));
  Serial.print(sensors.isDark ? F("DARK") : F("BRIGHT"));
  Serial.print(F(" | "));

  Serial.print(F("Motion: "));
  Serial.print(sensors.motionDetected ? F("DETECTED") : F("CLEAR"));
  Serial.print(F(" | "));

  Serial.print(F("Light: "));
  Serial.print(actuators.lightRelay ? F("ON") : F("OFF"));
  Serial.print(F(" | "));

  Serial.print(F("Fan: "));
  Serial.print(actuators.fanRelay ? F("ON") : F("OFF"));
  Serial.print(F(" | "));

  Serial.print(F("Security: "));
  if (actuators.alarmTriggered) {
    Serial.println(F("ALARM TRIP!"));
  } else if (sensors.securityArmed) {
    Serial.println(F("ARMED (SAFE)"));
  } else {
    Serial.println(F("DISARMED"));
  }
}

// --------------------------- MAIN LOOP ---------------------------------
void loop() {
  readSensors();
  executeRules();
  applyOutputs();
  updateDisplay();
  printSerialTelemetry();
}
`;

export const WOKWI_DIAGRAM_JSON = `{
  "version": 1,
  "author": "Smart Home IoT Engineer",
  "editor": "wokwi",
  "parts": [
    { "type": "board-esp32-devkit-c-v4", "id": "esp", "top": 0, "left": 0, "attrs": {} },
    { "type": "wokwi-pir-motion-sensor", "id": "pir1", "top": -160, "left": -180, "attrs": {} },
    { "type": "wokwi-photoresistor-sensor", "id": "ldr1", "top": -160, "left": 120, "attrs": {} },
    { "type": "wokwi-dht22", "id": "dht1", "top": -160, "left": -30, "attrs": { "temperature": "29", "humidity": "55" } },
    { "type": "wokwi-relay-module", "id": "relay_light", "top": 240, "left": -200, "attrs": {} },
    { "type": "wokwi-relay-module", "id": "relay_fan", "top": 240, "left": -40, "attrs": {} },
    { "type": "wokwi-buzzer", "id": "bz1", "top": 240, "left": 130, "attrs": { "hasLocalSound": "1" } },
    { "type": "wokwi-led", "id": "led_red", "top": 240, "left": 230, "attrs": { "color": "red" } },
    { "type": "wokwi-led", "id": "led_green", "top": 240, "left": 290, "attrs": { "color": "green" } },
    { "type": "board-ssd1306", "id": "oled1", "top": -160, "left": 280, "attrs": { "i2cAddress": "0x3c" } },
    { "type": "wokwi-slide-switch", "id": "sw_manual", "top": 80, "left": -260, "attrs": {} },
    { "type": "wokwi-slide-switch", "id": "sw_light", "top": 130, "left": -260, "attrs": {} },
    { "type": "wokwi-slide-switch", "id": "sw_fan", "top": 180, "left": -260, "attrs": {} },
    { "type": "wokwi-slide-switch", "id": "sw_sec", "top": 30, "left": -260, "attrs": {} }
  ],
  "connections": [
    [ "esp:GND.1", "pir1:GND", "black", [ "v0" ] ],
    [ "esp:3V3", "pir1:VCC", "red", [ "v0" ] ],
    [ "esp:13", "pir1:OUT", "green", [ "v0" ] ],

    [ "esp:GND.1", "ldr1:GND", "black", [ "v0" ] ],
    [ "esp:3V3", "ldr1:VCC", "red", [ "v0" ] ],
    [ "esp:34", "ldr1:AO", "orange", [ "v0" ] ],

    [ "esp:GND.1", "dht1:GND", "black", [ "v0" ] ],
    [ "esp:3V3", "dht1:VCC", "red", [ "v0" ] ],
    [ "esp:4", "dht1:SDA", "blue", [ "v0" ] ],

    [ "esp:GND.1", "oled1:GND", "black", [ "v0" ] ],
    [ "esp:3V3", "oled1:VCC", "red", [ "v0" ] ],
    [ "esp:22", "oled1:SCL", "cyan", [ "v0" ] ],
    [ "esp:21", "oled1:SDA", "yellow", [ "v0" ] ],

    [ "esp:2", "relay_light:IN", "purple", [ "v0" ] ],
    [ "esp:15", "relay_fan:IN", "blue", [ "v0" ] ],
    [ "esp:25", "bz1:1", "red", [ "v0" ] ],
    [ "esp:GND.2", "bz1:2", "black", [ "v0" ] ],

    [ "esp:32", "led_red:A", "red", [ "v0" ] ],
    [ "esp:GND.2", "led_red:C", "black", [ "v0" ] ],
    [ "esp:33", "led_green:A", "green", [ "v0" ] ],
    [ "esp:GND.2", "led_green:C", "black", [ "v0" ] ],

    [ "esp:14", "sw_manual:2", "magenta", [ "v0" ] ],
    [ "esp:27", "sw_light:2", "orange", [ "v0" ] ],
    [ "esp:26", "sw_fan:2", "blue", [ "v0" ] ],
    [ "esp:12", "sw_sec:2", "red", [ "v0" ] ]
  ]
}`;

export const WOKWI_TOML = `[wokwi]
version = 1
firmware = ".pio/build/esp32dev/firmware.bin"
elf = ".pio/build/esp32dev/firmware.elf"
`;

export const WOKWI_LIBRARIES_TXT = `# Wokwi ESP32 Arduino Libraries list
# Add these in the Library Manager or libraries.txt tab in Wokwi
Adafruit SSD1306
Adafruit GFX Library
DHT sensor library
Adafruit Unified Sensor
`;

export const PLATFORMIO_INI = `; PlatformIO Project Configuration for ESP32 Smart Home Controller
; Use this with Wokwi VS Code Extension (F1 > Wokwi: Start Simulator)

[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
monitor_speed = 115200

lib_deps =
    adafruit/Adafruit SSD1306@^2.5.9
    adafruit/Adafruit GFX Library@^1.11.9
    adafruit/DHT sensor library@^1.4.6
    adafruit/Adafruit Unified Sensor@^1.1.14
`;

export const WOKWI_README_MD = `# ESP32 Industry-Grade Smart Home Controller
### Complete Wokwi Hardware Simulation Project

This project contains complete, production-ready Arduino C++ firmware and Wokwi schematic files to simulate an industrial IoT Smart Home controller on the ESP32.

---

## 📁 Included Files
1. \`sketch.ino\` / \`smart_home.ino\` — Dual-core ESP32 C++ firmware with PIR, LDR, DHT22, OLED display, dual relays, buzzer alarm, and serial telemetry.
2. \`diagram.json\` — Wokwi circuit topology, components, coordinates, and color-coded wire connections.
3. \`wokwi.toml\` — Configuration for Wokwi VS Code extension and local simulation.
4. \`libraries.txt\` — Automatic dependency list for Wokwi web simulator.
5. \`platformio.ini\` — PlatformIO embedded build configuration.

---

## 🚀 How to Run in Wokwi Web Simulator (Free, No Install)
1. Open [https://wokwi.com/projects/new/esp32](https://wokwi.com/projects/new/esp32)
2. In the **sketch.ino** tab, replace the code with \`sketch.ino\`.
3. In the **diagram.json** tab, replace the JSON with \`diagram.json\`.
4. Add the libraries listed in \`libraries.txt\` in the **Library Manager** (left panel).
5. Click the green **Play (Start Simulation)** button!

---

## ⚡ Interactive Hardware Controls in Wokwi
- **PIR Sensor**: Click the round PIR sensor in Wokwi to trigger motion detection.
- **DHT22**: Click the DHT22 to adjust Temperature and Humidity with the popup slider.
- **Photoresistor (LDR)**: Click and drag the light slider to switch between Bright and Dark.
- **OLED Display**: Real-time 128x64 display reflects current states, temperature, relay statuses, and intrusion alerts.
- **Serial Monitor**: View live UART 115200 baud diagnostic telemetry stream at the bottom of the simulator.
`;

export interface WokwiPartDetail {
  id: string;
  name: string;
  type: string;
  pins: string[];
  description: string;
  color: string;
}

export const WOKWI_PARTS_CATALOG: WokwiPartDetail[] = [
  {
    id: 'esp',
    name: 'ESP32 DevKit V1 / C V4',
    type: 'board-esp32-devkit-c-v4',
    pins: ['GPIO 13 (PIR)', 'GPIO 34 (LDR)', 'GPIO 4 (DHT22)', 'GPIO 2 (Light Relay)', 'GPIO 15 (Fan Relay)', 'GPIO 25 (Buzzer)', 'GPIO 32 (Alert LED)', 'GPIO 33 (Heartbeat)', 'GPIO 21 (SDA)', 'GPIO 22 (SCL)', 'GPIO 14, 27, 26, 12 (Switches)'],
    description: 'Tensilica Xtensa Dual-Core 240MHz MCU with built-in Wi-Fi, Bluetooth, 12-bit ADC, and hardware I2C.',
    color: 'emerald'
  },
  {
    id: 'pir1',
    name: 'HC-SR501 PIR Motion Sensor',
    type: 'wokwi-pir-motion-sensor',
    pins: ['VCC -> 3V3', 'GND -> GND', 'OUT -> GPIO 13'],
    description: 'Pyroelectric infrared motion sensor for human occupancy detection.',
    color: 'green'
  },
  {
    id: 'ldr1',
    name: 'LDR Photoresistor Module',
    type: 'wokwi-photoresistor-sensor',
    pins: ['VCC -> 3V3', 'GND -> GND', 'AO -> GPIO 34 (ADC1_CH6)'],
    description: 'Light-dependent cadmium-sulfide resistor for ambient daylight measurement.',
    color: 'amber'
  },
  {
    id: 'dht1',
    name: 'DHT22 / AM2302 Precision Sensor',
    type: 'wokwi-dht22',
    pins: ['VCC -> 3V3', 'GND -> GND', 'SDA -> GPIO 4'],
    description: 'Calibrated digital temperature (-40°C to 80°C) and relative humidity (0-100%) sensor.',
    color: 'blue'
  },
  {
    id: 'oled1',
    name: 'SSD1306 0.96" I2C OLED Display',
    type: 'board-ssd1306',
    pins: ['VCC -> 3V3', 'GND -> GND', 'SDA -> GPIO 21', 'SCL -> GPIO 22'],
    description: '128x64 pixel monochrome graphical display with 0x3C I2C address.',
    color: 'cyan'
  },
  {
    id: 'relay_light',
    name: 'Room Light Relay Module',
    type: 'wokwi-relay-module',
    pins: ['IN -> GPIO 2', 'VCC -> 5V/3V3', 'GND -> GND'],
    description: 'Optocoupled SPDT relay switching 230V/110V AC lighting circuit.',
    color: 'purple'
  },
  {
    id: 'relay_fan',
    name: 'Ventilation Fan Relay Module',
    type: 'wokwi-relay-module',
    pins: ['IN -> GPIO 15', 'VCC -> 5V/3V3', 'GND -> GND'],
    description: 'Relay module triggering HVAC/cooling ventilation fan based on temperature hysteresis.',
    color: 'indigo'
  },
  {
    id: 'bz1',
    name: 'Piezo Alarm Buzzer',
    type: 'wokwi-buzzer',
    pins: ['Pin 1 -> GPIO 25', 'Pin 2 -> GND'],
    description: 'High-pitch audible transducer providing immediate siren tone on perimeter intrusion.',
    color: 'red'
  },
  {
    id: 'led_red',
    name: 'Red Alert Intruder LED',
    type: 'wokwi-led',
    pins: ['Anode -> GPIO 32 (via 330Ω)', 'Cathode -> GND'],
    description: 'High-visibility visual warning lamp for security breach state.',
    color: 'rose'
  },
  {
    id: 'led_green',
    name: 'Green System Heartbeat LED',
    type: 'wokwi-led',
    pins: ['Anode -> GPIO 33 (via 330Ω)', 'Cathode -> GND'],
    description: '1Hz blink cadence indicating MCU watch-dog loop and kernel operation.',
    color: 'lime'
  }
];

export const PINOUT_TABLE = [
  { component: 'PIR Motion Sensor', espPin: 'GPIO 13', mode: 'Digital Input', function: 'Human presence detection pulse' },
  { component: 'LDR Light Sensor', espPin: 'GPIO 34 (ADC1_6)', mode: 'Analog Input', function: 'Ambient light level (0-4095 ADC)' },
  { component: 'DHT22 Temp & Humidity', espPin: 'GPIO 4', mode: 'Digital 1-Wire', function: 'Accurate room temperature & humidity' },
  { component: 'Auto / Manual Switch', espPin: 'GPIO 14', mode: 'Digital Input (Pull-down)', function: 'Override switch: 0=Auto, 1=Manual' },
  { component: 'Manual Light Switch', espPin: 'GPIO 27', mode: 'Digital Input (Pull-down)', function: 'Direct manual control for Room Light' },
  { component: 'Manual Fan Switch', espPin: 'GPIO 26', mode: 'Digital Input (Pull-down)', function: 'Direct manual control for Fan' },
  { component: 'Security Arm Switch', espPin: 'GPIO 12', mode: 'Digital Input (Pull-down)', function: 'Arm / Disarm security alarm loop' },
  { component: 'Room Light Relay', espPin: 'GPIO 2', mode: 'Digital Output (Active HIGH)', function: 'AC 220V/110V Bulb Relay Driver' },
  { component: 'Fan Relay', espPin: 'GPIO 15', mode: 'Digital Output (Active HIGH)', function: 'AC/DC Ventilation Fan Relay Driver' },
  { component: 'Security Piezo Buzzer', espPin: 'GPIO 25', mode: 'Digital / PWM Output', function: 'Audible alarm siren on intruder detection' },
  { component: 'Red Alert LED', espPin: 'GPIO 32', mode: 'Digital Output', function: 'Visual intruder warning indicator' },
  { component: 'Green Heartbeat LED', espPin: 'GPIO 33', mode: 'Digital Output', function: 'System running & MCU health indicator' },
  { component: 'SSD1306 OLED (SDA)', espPin: 'GPIO 21 (I2C SDA)', mode: 'I2C Data', function: 'OLED Display Serial Data' },
  { component: 'SSD1306 OLED (SCL)', espPin: 'GPIO 22 (I2C SCL)', mode: 'I2C Clock', function: 'OLED Display Serial Clock' }
];


