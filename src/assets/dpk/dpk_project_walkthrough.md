# Project DPK

# Problem:

Mission Planner vs Custom Ground Control Station：
For our competitions, the most commonly used GCS is an out of the box software called mission planner. (List pros like already built so starightfoward to use etc.) However, it has many flaws (discuss cons like very clunky ui, only really works on windows while our team is primarily apple, crashes/freezes often, etc.). Thus, our team opted to build our own custom CUAIR ground control station. At the start of this project, the autonomous/path planning aspect has been already built on our GCS, however, many of the more hardware configuration features remained on mission planner, requiring us to usually start and setup everything on mission planner first, then migrate to our GCS once we’re ready to start the flight

- slow workflow needing to switch between mission planner and our gcs whenever needing to change params/hardware configurations versus autonomous flight: Especialloy important since this year’s competition rules shifted to include setup times in the 45 minute time limit. Before things can be configured/setup ahead of time, now we need to ensure we can smoothly and quickly setup everything

![image.png](image.png)

# Research/Solution/Planning

1. Since we want to improve our GCS over mission planner, instead of directly copying over the mission planner features, I also wanted to assess what were the biggest pain points with using mission planner so we can make substantial improvements. Surveying my teammates, it was determined that the biggest problems were with 
Main problems: 
    - Clunky software that crashes and freezes often
    - Bad/ugly UI
    - hard to understand and use for newer/unfamiliar members, lack of clear instructions so often needed to flip back and forth between online forums and documentation and mission planner
    - a lot of clutter of tools that we don’t regularly use on the page as well
    - slow workflow needing to switch between mission planner and our gcs whenever needing to change params/hardware configurations versus autonomous flight:
2. Researched which hardware setup needs to be included and prioritized. Determined that these are the essential/most used ones: Accelerometer calibration, compass (large vehicle macal), radio calibration, servo output page, and flightmodes configuration
3. Deciding UI layout: Since hardware setup usually occurs before flight, found it better to create a separate modal window rather than including this on the sidebars (clutters up essential flight information). 
4. Separate Goal: Adding clear instructions on what this hardware setup does/is for better onboarding

# Implementation

High-level picture

Svelte UI (dpk modal window)
↕ fetch() over HTTP (localhost:8001)
Flask REST API (blueprints, one per feature)
↕ get_dpk_mod() singleton
MAVProxy "dpk" module (state machine)
↕ pymavlink (command_long_send / param_set_send)
Autopilot (ArduPilot) over MAVLink
Two MAVProxy modules are autoloaded together (see the --default-modules list in [mavproxy.py:1352](http://mavproxy.py:1352/), which includes dpk,cuairapi):

cuairapi (**init**.py) — on idle_task(), spins up a Flask app in a background thread, serving on port 8001. [server.py](http://server.py/) registers all the Blueprints, including the 5 dpk-related view files.
dpk ([dpk.py](http://dpk.py/)) — the actual calibration/config logic. It's a singleton (instance global, fetched via get_dpk_mod()) that Flask views call into.
Backend: [dpk.py](http://dpk.py/) — the state machine
DPKModule (an mp_module.MPModule subclass) does two things:

Listens — mavlink_packet(m) ([dpk.py:35](http://dpk.py:35/)) is called by MAVProxy for every inbound MAVLink message and updates internal state:
MAG_CAL_PROGRESS / MAG_CAL_REPORT / COMMAND_ACK(FIXED_MAG_CAL_YAW) → mag calibration status/detail
COMMAND_ACK(PREFLIGHT_CALIBRATION) → radio calibration status
RC_CHANNELS → live stick positions, and (while calibrating) running min/max per channel
STATUSTEXT → accelerometer calibration step prompts ("Place vehicle LEVEL", etc.) and pass/fail text
Sends — methods invoked from the Flask layer that push MAVLink commands via self.master.mav:
start_accel_calibration() / send_accel_next() → MAV_CMD_PREFLIGHT_CALIBRATION then MAV_CMD_ACCELCAL_VEHICLE_POS per step
largeVehicleMagCal(yaw) → MAV_CMD_FIXED_MAG_CAL_YAW
start_radio_calibration() / finish_radio_calibration() → MAV_CMD_PREFLIGHT_CALIBRATION (param4=1), then just stops tracking and snapshots
set_flight_modes(entries) → param_set_send("FLTMODEn", ...)
set_servo_outputs(entries) → param_set_send("SERVOn_FUNCTION/MIN/TRIM/MAX/REVERSED", ...)
Backend: Flask views (thin glue)
Each feature has its own Blueprint under MAVProxy/modules/mavproxy_cuairapi/views/:

File	Routes	Delegates to
[magcal.py](http://magcal.py/)	POST /magcal_large, GET /magcal_status	largeVehicleMagCal, get_mag_cal_status/detail
[accelerometer.py](http://accelerometer.py/)	POST /accelcal_start, POST /accelcal_next, GET /accelcal_status	start_accel_calibration, send_accel_next, get_accel_status
[radio.py](http://radio.py/)	POST /radiocal_start, POST /radiocal_finish, GET /radiocal_status	start_radio_calibration, finish_radio_calibration, get_radio_status
[flightmodes.py](http://flightmodes.py/)	POST /flight_modes	set_flight_modes
[servooutputs.py](http://servooutputs.py/)	POST /servo_output	set_servo_outputs (also owns the SERVO_FUNCTION_MAP name→int table)
These views validate/shape JSON, call the singleton dpk instance, and return a JSON status. No MAVLink knowledge lives here — that's all in [dpk.py](http://dpk.py/).

Frontend: the window shell
App.svelte mounts <ModalWindow> (testingTabs/modalWindow.svelte), a draggable/resizable panel controlled by the showModal writable in stores/TestingStore.js (toggled e.g. from map/MapUtils.js).
modalWindow.svelte is the actual "dpk window": it owns drag/resize logic and a tab strip with 5 tabs, each swapping in a component:
Guide → GuideTab.svelte
Radio → RadioCalibration.svelte
Flight Modes → SetupTab.svelte ("Setup")
Servos → ServoOutput.svelte
Calibration → Calibration.svelte (accel + large-vehicle mag cal)
Frontend: state and actions
stores/DpkStore.js — plain Svelte writables for everything: accel step/status/in-progress, mag status/compass yaw, and per-channel radio current/min/max/reverse (roll/pitch/throttle/yaw) plus aux radio5–14.
testingTabs/windows/DpkActions.js — thin action wrappers (startAccel, confirmAccelPosition, startRadioCalibration, finishRadioCalibration, saveFlightModes, saveServoOutputs) that call into SendAPI.js.
utils/SendAPI.js (lines ~848–1000) — the actual fetch() POST calls to the Flask routes above, plus toast notifications via createAlert.
utils/ReceiveAPI.js — the read side. receiveAccelStatus, receiveLargeVehicleMagCalStatus, receiveRadioStatus each GET the *_status endpoints and .set() the corresponding DpkStore writables.
The polling loop that ties it together
App.svelte calls startReceive(500) on mount. That sets a setInterval on receivePlaneInfo() (ReceiveAPI.js:509), which — alongside telemetry like modes/armed status/heartbeat — calls the three dpk status pollers every 500ms. This is a polling architecture, not push/websocket: the UI components (Calibration.svelte, RadioCalibration.svelte) just subscribe reactively ($accelStatusStore, $rollCurrent, etc.) to stores that get refreshed by this loop, so progress bars/step indicators update live while a calibration is in flight on the autopilot.

SetupTab.svelte and ServoOutput.svelte (flight modes / servo config) are simpler — mostly local component state that's only sent to the backend on an explicit "Save" click, since those are one-shot parameter writes rather than a live guided sequence.

![Untitled presentation.png](Untitled_presentation.png)

# Challenges and Impact

Challanges:

1. Understanding the GCS code base. HUGE project, first time working with such a large codebase (culmination of many years of this project team). Took a long time figuring out the structure/how everything fits together, how to work with new tools like svelte and mavlink

Impact

1. Reduced flight setup time from around 10-15 minutes usually with mission planner to less than 3 minutes on our gcs
2. Surveying new members, they became a lot more familiar with the hardware setup process at test flights in a faster amount of time. Previous semesters, new members wouldn’t be comfy setting up alone without help for nearly two semesters, now they feel comfy leading ground tests alone within 3 months
3. Making a more complete GCS and no longer dependent on mission planner (external software) for all the essential flight capabilities! Now only limited to mission planner on occasional, rare features, before we used to always need both mission planner and gcs out for every mission.