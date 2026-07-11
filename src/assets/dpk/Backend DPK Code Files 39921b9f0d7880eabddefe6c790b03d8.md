# Backend DPK Code Files

# Accelerometer.py

```python

import json
from flask import request, Blueprint
from flask_cors import cross_origin
from MAVProxy.modules.mavproxy_dpk.dpk import get_dpk_mod

app_accelcal = Blueprint('app_accelcal', __name__)

@app_accelcal.route('/accelcal_start', methods=['POST'])
@cross_origin()
def start_accel():
    try:
        # Call the start function in your dpk module
        get_dpk_mod().start_accel_calibration() #start function in dpk.py module that sends the mavlink command to start accel calibration
        return json.dumps({"status": "ok"}), 200
    except Exception as e:
        print(f"[ACCEL ERROR] {e}")
        return json.dumps({"status": "error", "message": str(e)}), 500
    
@app_accelcal.route('/accelcal_next', methods=['POST'])
@cross_origin()
def next_accel():
    try:
        # Call the next step function in your dpk module
        get_dpk_mod().send_accel_next() #next step function in dpk.py module that sends the mavlink command to move to the next step of accel calibration
        return json.dumps({"status": "ok"}), 200
    except Exception as e:
        print(f"[ACCEL ERROR] {e}")
        return json.dumps({"status": "error", "message": str(e)}), 500
    
@app_accelcal.route('/accelcal_status', methods=['GET'])
@cross_origin()
def get_accel_cal_status():
    try:
        mod = get_dpk_mod()

        if mod is None:
            print("DPK module not initialized")
            return json.dumps({
                "status": "Press 'Start Calibration' to begin accelerometer calibration.",
                "step": 0,
                "in_progress": False
            }), 200

        status = mod.get_accel_status()
        return json.dumps(status), 200

    except Exception as e:
        print("Accel status route crashed:", e)
        return json.dumps({
            "status": "Backend error",
            "step": 0,
            "in_progress": False
        }), 200

```

# MagCal.py

```python
# views/magcal.py
import json
from flask import request, Blueprint
from flask_cors import cross_origin
from MAVProxy.modules.mavproxy_dpk.dpk import get_dpk_mod

app_mag_cal = Blueprint('app_mag_cal', __name__)

@app_mag_cal.route('/magcal_large', methods=['POST'])
@cross_origin()
def magcal_large():
    try:
        data = request.get_json()
        yaw_value = data.get("yaw")

        print(f"[MAGCAL] Received yaw from frontend: {yaw_value}")
        if yaw_value is None:
            return json.dumps({"error": "No yaw value provided"}), 400

        # Send to MAVProxy DPK module
        get_dpk_mod().largeVehicleMagCal(yaw_value)

        return json.dumps({"status": "ok"}), 200

    except Exception as e:
        print("Error in /magcal_large:", e)
        return json.dumps({"status": "error"}), 500
    
@app_mag_cal.route('/magcal_status', methods=['GET'])
@cross_origin()
def magcal_status():
    try:
        mod = get_dpk_mod()
        status = mod.get_mag_cal_status()
        detail = mod.get_mag_cal_detail()
        return json.dumps({"status": status, "detail": detail}), 200
    except Exception as e:
        print("Error in /magcal_status:", e)
        return json.dumps({"status": "error"}), 500

```

# FlightModes.py

```python
import json
from flask import request, Blueprint
from flask_cors import cross_origin

from MAVProxy.modules.mavproxy_dpk.dpk import get_dpk_mod

app_flightmodes = Blueprint('app_flightmodes', __name__)

@app_flightmodes.route('/flight_modes', methods=['POST'])
@cross_origin()
def set_flight_modes():
    try:
        data = request.get_json(silent=True)
        if not isinstance(data, list):
            return json.dumps({
                "status": "error",
                "message": "Expected a JSON list of flight mode entries"
            }), 400

        if len(data) != 6:
            return json.dumps({
                "status": "error",
                "message": "Expected exactly 6 flight mode entries"
            }), 400

        entries = []
        for index, entry in enumerate(data, start=1):
            if isinstance(entry, dict):
                mode_name = entry.get('mode')
            else:
                mode_name = entry
            if not mode_name:
                return json.dumps({
                    "status": "error",
                    "message": f"Missing mode name for slot {index}"
                }), 400
            entries.append({'slot': index, 'mode': mode_name})

        saved_modes = get_dpk_mod().set_flight_modes(entries)

        return json.dumps({
            "status": "ok",
            "flight_modes": saved_modes
        }), 200
    except ValueError as e:
        return json.dumps({"status": "error", "message": str(e)}), 400
    except Exception as e:
        print(f"[FLIGHT MODES ERROR] {e}")
        return json.dumps({"status": "error", "message": str(e)}), 500

```

# ServoOutputs.py

```python
# views/servooutputs.py
import json
from flask import request, Blueprint
from flask_cors import cross_origin
from MAVProxy.modules.mavproxy_dpk.dpk import get_dpk_mod

app_servo_output = Blueprint('app_servo_output', __name__)

# ArduPilot SERVOx_FUNCTION integer values
# Reference: SRV_Channel::Function / Aux_servo_function_t
SERVO_FUNCTION_MAP = {
    'Disabled': 0,
    'RCPassThru': 1,
    'Flap': 2,
    'FlapAuto': 3,
    'Aileron': 4,
    'Mount1Yaw': 6,
    'Mount1Pitch': 7,
    'Mount1Roll': 8,
    'Mount1Retract': 9,
    'CameraTrigger': 10,
    'Mount2Yaw': 12,
    'Mount2Pitch': 13,
    'Mount2Roll': 14,
    'Mount2Retract': 15,
    'DifferentialSpoilerLeft1': 16,
    'DifferentialSpoilerRight1': 17,
    'Elevator': 19,
    'Rudder': 21,
    'SprayerPump': 22,
    'SprayerSpinner': 23,
    'FlaperonLeft': 24,
    'FlaperonRight': 25,
    'Parachute': 27,
    'Gripper': 28,
    'LandingGear': 29,
    'EngineRunEnable': 30,
    'Motor1': 33,
    'Motor2': 34,
    'Motor3': 35,
    'Motor4': 36,
    'Motor5': 37,
    'Motor6': 38,
    'Motor7': 39,
    'Motor7/TailTiltServo': 39,
    'Motor8': 40,
    'MotorTilt': 41,
    'TiltMotorsFront': 41,
    'TiltMotorRearLeft': 46,
    'TiltMotorRearRight': 47,
    'RCIN1': 51,
    'RCIN2': 52,
    'RCIN3': 53,
    'RCIN4': 54,
    'RCIN5': 55,
    'RCIN6': 56,
    'RCIN7': 57,
    'RCIN8': 58,
    'RCIN9': 59,
    'RCIN10': 60,
    'RCIN11': 61,
    'RCIN12': 62,
    'RCIN13': 63,
    'RCIN14': 64,
    'RCIN15': 65,
    'RCIN16': 66,
    'Ignition': 67,
    'Starter': 69,
    'Throttle': 70,
    'ThrottleLeft': 73,
    'ThrottleRight': 74,
    'TiltMotorFrontLeft': 75,
    'TiltMotorFrontRight': 76,
    'ElevonLeft': 77,
    'ElevonRight': 78,
    'VTailLeft': 79,
    'VTailRight': 80,
    'Motor9': 82,
    'Motor10': 83,
    'Motor11': 84,
    'Motor12': 85,
    'DifferentialSpoilerLeft2': 86,
    'DifferentialSpoilerRight2': 87,
    'CameraISO': 90,
    'CameraAperture': 91,
    'CameraFocus': 92,
    'CameraShutterSpeed': 93,
    'Script1': 94,
    'Script2': 95,
    'Script3': 96,
    'Script4': 97,
    'Script5': 98,
    'Script6': 99,
    'Script7': 100,
    'Script8': 101,
    'Script9': 102,
    'Script10': 103,
    'Script11': 104,
    'Script12': 105,
    'Script13': 106,
    'Script14': 107,
    'Script15': 108,
    'Script16': 109,
    'NeoPixel1': 120,
    'NeoPixel2': 121,
    'NeoPixel3': 122,
    'RateRoll': 124,
    'RatePitch': 125,
    'RateYaw': 127,
    'ProfiLED1': 129,
    'ProfiLED2': 130,
    'ProfiLED3': 131,
    'SERVOn_MIN': 134,
    'SERVOn_TRIM': 135,
    'SERVOn_MAX': 136,
    'Alarm': 138,
    'RCIN1Scaled': 140,
    'RCIN2Scaled': 141,
    'RCIN3Scaled': 142,
    'RCIN4Scaled': 143,
    'RCIN5Scaled': 144,
    'RCIN6Scaled': 145,
    'RCIN7Scaled': 146,
    'RCIN8Scaled': 147,
    'RCIN9Scaled': 148,
    'RCIN10Scaled': 149,
    'RCIN11Scaled': 150,
    'RCIN12Scaled': 151,
    'RCIN13Scaled': 152,
    'RCIN14Scaled': 153,
    'RCIN15Scaled': 154,
    'RCIN16Scaled': 155,
    'Motor13': 160,
    'Motor14': 161,
    'Motor15': 162,
    'Motor16': 163,
    'Motor17': 164,
    'Motor18': 165,
    'Motor19': 166,
    'Motor20': 167,
    'Motor21': 168,
    'Motor22': 169,
    'Motor23': 170,
    'Motor24': 171,
    'Motor25': 172,
    'Motor26': 173,
    'Motor27': 174,
    'Motor28': 175,
    'Motor29': 176,
    'Motor30': 177,
    'Motor31': 178,
    'Motor32': 179,
    'GPIO1': -1,

    # Backward-compatible labels previously sent by the UI.
    'Manual': 1,
    'Flap Auto': 3,
    'Motor 1': 33,
    'Motor 2': 34,
    'Motor 3': 35,
    'Motor 4': 36,
    'Motor 5': 37,
    'Motor 6': 38,
    'Motor 7': 39,
    'Motor 8': 40,
    'RCIN 1': 51,
    'RCIN 2': 52,
    'RCIN 3': 53,
    'RCIN 4': 54,
    'RCIN 5': 55,
    'RCIN 6': 56,
    'Throttle Left': 73,
    'Throttle Right': 74,
    'Vtail Left': 79,
    'Vtail Right': 80,
    'Left Elevon': 77,
    'Right Elevon': 78,
}

@app_servo_output.route('/servo_output', methods=['POST'])
@cross_origin()
def set_servo_output():
    try:
        data = request.get_json(silent=True)
        if not isinstance(data, list):
            return json.dumps({
                "status": "error",
                "message": "Expected a JSON list of channel entries"
            }), 400

        if len(data) == 0 or len(data) > 16:
            return json.dumps({
                "status": "error",
                "message": "Expected between 1 and 16 channel entries"
            }), 400

        channel_entries = []

        for entry in data:
            if not isinstance(entry, dict):
                return json.dumps({
                    "status": "error",
                    "message": "Each channel entry must be a JSON object"
                }), 400

            try:
                channel = int(entry.get('channel'))
            except (TypeError, ValueError):
                return json.dumps({
                    "status": "error",
                    "message": f"Invalid channel number: {entry.get('channel')}"
                }), 400

            if not (1 <= channel <= 16):
                return json.dumps({
                    "status": "error",
                    "message": f"Invalid channel number: {channel}"
                }), 400

            func_name = entry.get('function', 'Disabled')
            func_value = SERVO_FUNCTION_MAP.get(func_name)
            if func_value is None:
                return json.dumps({
                    "status": "error",
                    "message": f"Unknown servo function '{func_name}' for channel {channel}"
                }), 400

            try:
                min_pwm = int(entry.get('min', 1100))
                trim_pwm = int(entry.get('trim', 1500))
                max_pwm = int(entry.get('max', 1900))
            except (TypeError, ValueError):
                return json.dumps({
                    "status": "error",
                    "message": f"Invalid PWM value for channel {channel}"
                }), 400

            if not (500 <= min_pwm <= trim_pwm <= max_pwm <= 2200):
                return json.dumps({
                    "status": "error",
                    "message": f"Invalid PWM range for channel {channel}: min <= trim <= max and values must be 500-2200"
                }), 400

            channel_entries.append({
                "channel":  channel,
                "function": func_name,
                "value":    func_value,
                "reversed": bool(entry.get('reversed', False)),
                "min":      min_pwm,
                "trim":     trim_pwm,
                "max":      max_pwm,
            })

        dpk_mod = get_dpk_mod()
        if dpk_mod is None:
            return json.dumps({
                "status": "error",
                "message": "DPK module not initialized"
            }), 500

        saved_channels = dpk_mod.set_servo_outputs(channel_entries)

        return json.dumps({
            "status": "ok",
            "channels": saved_channels
        }), 200

    except Exception as e:
        print(f"[SERVO ERROR] {e}")
        return json.dumps({"status": "error", "message": str(e)}), 500

```

# Radio.py

```python

import json
from flask import request, Blueprint
from flask_cors import cross_origin
from MAVProxy.modules.mavproxy_dpk.dpk import get_dpk_mod

app_radiocal = Blueprint('app_radiocal', __name__)

@app_radiocal.route('/radiocal_start', methods=['POST'])
@cross_origin()
def start_radio():
    try:
        mod = get_dpk_mod()
        start_fn = getattr(mod, 'start_radio_calibration', None)

        if callable(start_fn):
            start_fn()
        else:
            print('[RADIO CAL] start requested; start_radio_calibration is not wired yet')

        return json.dumps({"status": "ok"}), 200
    except Exception as e:
        print(f"[RADIO CAL ERROR] {e}")
        return json.dumps({"status": "error", "message": str(e)}), 500

@app_radiocal.route('/radiocal_finish', methods=['POST'])
@cross_origin()
def finish_radio():
    try:
        snapshot = request.get_json(silent=True) or {}
        mod = get_dpk_mod()
        finish_fn = getattr(mod, 'finish_radio_calibration', None)

        if callable(finish_fn):
            saved_snapshot = finish_fn(snapshot)
        else:
            saved_snapshot = snapshot
            print(f"[RADIO CAL] finish requested with snapshot: {snapshot}")

        return json.dumps({"status": "ok", "snapshot": saved_snapshot}), 200
    except Exception as e:
        print(f"[RADIO CAL ERROR] {e}")
        return json.dumps({"status": "error", "message": str(e)}), 500

@app_radiocal.route('/radiocal_status', methods=['GET'])
@cross_origin()
def get_radio_status():
    try:
        mod = get_dpk_mod()

        if mod is None:
            return json.dumps({
                "status": "Idle",
                "in_progress": False,
                "current": {
                    "roll": 0,
                    "pitch": 0,
                    "throttle": 0,
                    "yaw": 0
                },
                "min": {
                    "roll": 0,
                    "pitch": 0,
                    "throttle": 0,
                    "yaw": 0
                },
                "max": {
                    "roll": 0,
                    "pitch": 0,
                    "throttle": 0,
                    "yaw": 0
                },
                "reverse": {
                    "roll": False,
                    "pitch": False,
                    "throttle": False,
                    "yaw": False
                },
                "auxiliary": {
                    f"radio{i}": 0 for i in range(5, 15)
                }
            }), 200

        return json.dumps(mod.get_radio_status()), 200
    except Exception as e:
        print(f"[RADIO CAL ERROR] {e}")
        return json.dumps({"status": "error", "message": str(e)}), 500

```

# DPK.py

```python
'''
DPK Module (Accelerometer Calibration and more)
'''
import time, os
from pymavlink import mavutil

from MAVProxy.modules.lib import mp_module

class DPKModule(mp_module.MPModule):

    def __init__(self, mpstate):
        super(DPKModule, self).__init__(mpstate, "dpk", "DPK Module for CU Air")
        self.accel_step = 0
        self.accel_in_progress = False
        self.mag_status = "Not Started"
        self.last_mag_yaw = None
        self.last_mag_ack_result = None
        self.mag_detail = ""
        self.accel_status = "Idle"
        self.accel_last_result = None
        self.radio_status = "Idle"
        self.radio_in_progress = False
        self.radio_last_result = None
        self.radio_last_snapshot = None
        self.radio_current = self._empty_radio_channels()
        self.radio_min = self._empty_radio_channels()
        self.radio_max = self._empty_radio_channels()
        self.radio_reverse = {
            "roll": False,
            "pitch": False,
            "throttle": False,
            "yaw": False
        }
        
    def mavlink_packet(self, m):
        mtype = m.get_type()
        if mtype == "MAG_CAL_PROGRESS":
            self.mag_status = "IN_PROGRESS"
            self.mag_detail = f"Progress: {m.completion_pct}%"
            print(f"[MAGCAL] Calibration Progress: {m.completion_pct}%")
        elif mtype == "MAG_CAL_REPORT":
            self.last_mag_report = m
            
            status_map = {
                0: "NOT_STARTED",
                1: "WAITING_TO_START",
                2: "STEP_ONE",
                3: "STEP_TWO",
                4: "SUCCESS",
                5: "FAILED",
                6: "BAD_ORIENTATION",
                7: "BAD_RADIUS"
            }
            status = status_map.get(m.cal_status, "UNKNOWN")
            if m.cal_status == 4:
                self.mag_status = "SUCCESS"
                self.mag_detail = f"Report SUCCESS (fitness={m.fitness:.3f}, compass_id={m.compass_id})"
                print("Mag Cal Report: SUCCESS")
                if m.autosaved == 0:
                    self.accept_mag_calibration(m.compass_id)
            else:
                if m.cal_status in (5, 6, 7):
                    self.mag_status = "FAILED"
                elif m.cal_status in (1, 2, 3):
                    self.mag_status = "IN_PROGRESS"
                self.mag_detail = f"Report {status} (cal_status={m.cal_status}, fitness={m.fitness:.3f}, compass_id={m.compass_id})"
                print(f"Mag Cal Report: {status} (cal_status={m.cal_status})")
        elif mtype == "COMMAND_ACK":
            # Fixed-yaw mag cal often completes by ACK without MAG_CAL_REPORT.
            if m.command == mavutil.mavlink.MAV_CMD_FIXED_MAG_CAL_YAW:
                self.last_mag_ack_result = m.result
                ack_map = {
                    mavutil.mavlink.MAV_RESULT_ACCEPTED: "ACCEPTED",
                    mavutil.mavlink.MAV_RESULT_TEMPORARILY_REJECTED: "TEMPORARILY_REJECTED",
                    mavutil.mavlink.MAV_RESULT_DENIED: "DENIED",
                    mavutil.mavlink.MAV_RESULT_UNSUPPORTED: "UNSUPPORTED",
                    mavutil.mavlink.MAV_RESULT_FAILED: "FAILED",
                    mavutil.mavlink.MAV_RESULT_IN_PROGRESS: "IN_PROGRESS",
                    mavutil.mavlink.MAV_RESULT_CANCELLED: "CANCELLED",
                }
                ack_result_name = ack_map.get(m.result, f"UNKNOWN({m.result})")
                if m.result == mavutil.mavlink.MAV_RESULT_ACCEPTED:
                    self.mag_status = "SUCCESS"
                    self.mag_detail = f"COMMAND_ACK FIXED_MAG_CAL_YAW: {ack_result_name}"
                    print("[MAGCAL] COMMAND_ACK for FIXED_MAG_CAL_YAW: ACCEPTED")
                elif m.result == mavutil.mavlink.MAV_RESULT_IN_PROGRESS:
                    self.mag_status = "IN_PROGRESS"
                    self.mag_detail = f"COMMAND_ACK FIXED_MAG_CAL_YAW: {ack_result_name}"
                    print("[MAGCAL] COMMAND_ACK for FIXED_MAG_CAL_YAW: IN_PROGRESS")
                else:
                    self.mag_status = "FAILED"
                    self.mag_detail = f"COMMAND_ACK FIXED_MAG_CAL_YAW: {ack_result_name}"
                    print(f"[MAGCAL] COMMAND_ACK for FIXED_MAG_CAL_YAW: FAILED (result={ack_result_name})")
            elif (
                m.command == mavutil.mavlink.MAV_CMD_PREFLIGHT_CALIBRATION
                and self.radio_in_progress
            ):
                ack_map = {
                    mavutil.mavlink.MAV_RESULT_ACCEPTED: "ACCEPTED",
                    mavutil.mavlink.MAV_RESULT_TEMPORARILY_REJECTED: "TEMPORARILY_REJECTED",
                    mavutil.mavlink.MAV_RESULT_DENIED: "DENIED",
                    mavutil.mavlink.MAV_RESULT_UNSUPPORTED: "UNSUPPORTED",
                    mavutil.mavlink.MAV_RESULT_FAILED: "FAILED",
                    mavutil.mavlink.MAV_RESULT_IN_PROGRESS: "IN_PROGRESS",
                    mavutil.mavlink.MAV_RESULT_CANCELLED: "CANCELLED",
                }
                ack_result_name = ack_map.get(m.result, f"UNKNOWN({m.result})")
                self.radio_last_result = ack_result_name
                if m.result in (
                    mavutil.mavlink.MAV_RESULT_ACCEPTED,
                    mavutil.mavlink.MAV_RESULT_IN_PROGRESS,
                ):
                    self.radio_status = f"Radio calibration {ack_result_name}"
                else:
                    self.radio_status = f"Radio calibration {ack_result_name}"
                    self.radio_in_progress = False
                print(f"[RADIO CAL] COMMAND_ACK for PREFLIGHT_CALIBRATION: {ack_result_name}")
            elif m.command == mavutil.mavlink.MAV_CMD_DO_ACCEPT_MAG_CAL:
                print(f"[MAGCAL] COMMAND_ACK for DO_ACCEPT_MAG_CAL: result={m.result}")
        elif mtype == "RC_CHANNELS":
            self._update_radio_channels(m)
        elif mtype == "STATUSTEXT":
            text = str(m.text).strip()
            if text.startswith("Place vehicle"):
                self.accel_in_progress = True
                self.accel_status = text
                self.accel_step = self._step_from_prompt(text)
                self.accel_last_result = None
                return

            upper = text.upper()
            if "CALIBRATION FAILED" in upper:
                self.accel_status = "Calibration FAILED"
                self.accel_in_progress = False
                self.accel_step = 0
                self.accel_last_result = "failed"
                return

            if "CALIBRATION SUCCESS" in upper or "CALIBRATION SUCCESSFUL" in upper:
                if self.accel_in_progress:
                    self.accel_status = "Calibration SUCCESS"
                    self.accel_in_progress = False
                    self.accel_step = 0
                    self.accel_last_result = "success"
                    return
            if self.radio_in_progress and "RADIO" in upper and "CALIB" in upper:
                self.radio_status = text
                return

                
# Large Mag Calibration Functions#########################################################################################            
                        
    def accept_mag_calibration(self, compass_id):
        '''Sends the MAV_CMD_DO_ACCEPT_MAG_CAL to the plane'''
        self.master.mav.command_long_send(
            self.target_system, self.target_component,
            mavutil.mavlink.MAV_CMD_DO_ACCEPT_MAG_CAL,
            0,
            1 << compass_id, # Bitmask for which compass to accept
            0, 0, 0, 0, 0, 0
        )
        print(f"[MAGCAL] Sent MAV_CMD_DO_ACCEPT_MAG_CAL for compass_id={compass_id}")

    def get_mag_cal_status(self):
        '''Helper for the Flask API to call'''
        return self.mag_status

    def get_mag_cal_detail(self):
        '''Helper for the Flask API to call'''
        return self.mag_detail

    def largeVehicleMagCal(self, yaw):
        self.last_mag_yaw = float(yaw)
        self.mag_status = "IN_PROGRESS"
        self.mag_detail = f"Sent FIXED_MAG_CAL_YAW with yaw={self.last_mag_yaw}"
        print(f"[MAGCAL] Starting large vehicle mag cal with yaw: {self.last_mag_yaw}")
        # Command to start large vehicle mag calibration with the given yaw
        self.master.mav.command_long_send(
        self.master.target_system,
        0,  # match MAVProxy calibration module behavior
        mavutil.mavlink.MAV_CMD_FIXED_MAG_CAL_YAW,
        0,      # confirmation
        self.last_mag_yaw, 0, 0, 0, 0, 0, 0
        )
        print(f"[MAGCAL] Successfully sent large vehicle mag cal command with yaw={self.last_mag_yaw}")

# Accelerometer Calibration Functions###########################################################################           

    def start_accel_calibration(self):
        '''Sends the MAV_CMD_PREFLIGHT_CALIBRATION command to start accelerometer calibration'''
        print("Starting accelerometer calibration...")
        self.master.mav.command_long_send(
            self.master.target_system, 
            self.master.target_component,
            mavutil.mavlink.MAV_CMD_PREFLIGHT_CALIBRATION, 
            0, 0, 0, 0, 0, 1, 0, 0
        )
        self.accel_step = 1
        self.accel_in_progress = True
        self.accel_status = self.get_instruction_for_step(self.accel_step)
        self.accel_last_result = None
        print(f"Accelerometer Calibration Status: {self.accel_status}")
            
    def send_accel_next(self):
        '''Signals drone that vehicle is in position (Command 242)'''
        if not self.accel_in_progress:
            print("Accel calibration not in progress.")
            return

        print(f"Confirming step {self.accel_step}")

        # Send current orientation enum to drone
        self.master.mav.command_long_send(
            self.target_system,
            self.target_component,
            mavutil.mavlink.MAV_CMD_ACCELCAL_VEHICLE_POS,
            0,
            self.accel_step, 0, 0, 0, 0, 0, 0
        )

        # Move to next step optimistically; autopilot STATUSTEXT will correct as needed.
        self.accel_step += 1
        if self.accel_step <= 6:
            self.accel_status = self.get_instruction_for_step(self.accel_step)
                
    def get_instruction_for_step(self, step):
        instructions = {
            1: "Place vehicle LEVEL",
            2: "Place vehicle on LEFT side",
            3: "Place vehicle on RIGHT side",
            4: "Place vehicle NOSE DOWN",
            5: "Place vehicle NOSE UP",
            6: "Place vehicle on BACK"
        }
        return instructions.get(step, "Unknown step")

    def _step_from_prompt(self, prompt):
        normalized = prompt.lower()
        mapping = {
            "place vehicle level": 1,
            "place vehicle on its left side": 2,
            "place vehicle on left side": 2,
            "place vehicle on its right side": 3,
            "place vehicle on right side": 3,
            "place vehicle nose down": 4,
            "place vehicle nose up": 5,
            "place vehicle on its back": 6,
            "place vehicle on back": 6,
        }
        for key, step in mapping.items():
            if key in normalized:
                return step
        return self.accel_step
    
    def get_accel_status(self):
        '''Helper for the Flask API to call'''
        return {
            "status": self.accel_status,
            "step": self.accel_step,
            "in_progress": self.accel_in_progress
        }

    # Radio Calibration Functions###########################################################################

    def _empty_radio_channels(self):
        return {f"chan{i}": 0 for i in range(1, 15)}

    def _extract_radio_channels(self, msg):
        return {
            f"chan{i}": int(getattr(msg, f"chan{i}_raw", 0) or 0)
            for i in range(1, 15)
        }

    def _primary_radio_mapping(self, channel_map):
        return {
            "roll": channel_map.get("chan1", 0),
            "pitch": channel_map.get("chan2", 0),
            "throttle": channel_map.get("chan3", 0),
            "yaw": channel_map.get("chan4", 0),
        }

    def _aux_radio_mapping(self, channel_map):
        return {
            f"radio{i}": channel_map.get(f"chan{i}", 0)
            for i in range(5, 15)
        }

    def _update_radio_channels(self, msg):
        current = self._extract_radio_channels(msg)
        self.radio_current = current

        if not self.radio_in_progress:
            return

        for channel_name, value in current.items():
            if value <= 0 or value == 65535:
                continue

            current_min = self.radio_min[channel_name]
            current_max = self.radio_max[channel_name]

            if current_min == 0 or value < current_min:
                self.radio_min[channel_name] = value
            if current_max == 0 or value > current_max:
                self.radio_max[channel_name] = value

        self.radio_status = "Radio calibration collecting channel ranges"

    def start_radio_calibration(self):
        '''Starts radio calibration and begins tracking RC_CHANNELS min/max values.'''
        print("Starting radio calibration...")
        self.radio_in_progress = True
        self.radio_status = "Starting radio calibration"
        self.radio_last_result = None
        self.radio_last_snapshot = None
        self.radio_min = self._empty_radio_channels()
        self.radio_max = self._empty_radio_channels()

        if any(value > 0 for value in self.radio_current.values()):
            for channel_name, value in self.radio_current.items():
                if value > 0 and value != 65535:
                    self.radio_min[channel_name] = value
                    self.radio_max[channel_name] = value

        self.master.mav.command_long_send(
            self.master.target_system,
            self.master.target_component,
            mavutil.mavlink.MAV_CMD_PREFLIGHT_CALIBRATION,
            0,
            0, 0, 0, 1, 0, 0, 0
        )
        print("Entered dpk.py, sent MAV_CMD_PREFLIGHT_CALIBRATION with param4=1 for radio calibration")

    def finish_radio_calibration(self, snapshot=None):
        '''Stops radio calibration tracking and stores the final snapshot.'''
        self.radio_in_progress = False
        self.radio_status = "Radio calibration finished"
        self.radio_last_result = "saved"
        self.radio_last_snapshot = snapshot or self.get_radio_status()
        print(f"Finished [RADIO CAL] Saved snapshot: {self.radio_last_snapshot}")
        return self.radio_last_snapshot

    def get_radio_status(self):
        primary_current = self._primary_radio_mapping(self.radio_current)
        primary_min = self._primary_radio_mapping(self.radio_min)
        primary_max = self._primary_radio_mapping(self.radio_max)
        auxiliary = self._aux_radio_mapping(self.radio_current)

        return {
            "status": self.radio_status,
            "in_progress": self.radio_in_progress,
            "current": primary_current,
            "min": primary_min,
            "max": primary_max,
            "reverse": self.radio_reverse,
            "auxiliary": auxiliary,
            "raw_current": self.radio_current,
            "raw_min": self.radio_min,
            "raw_max": self.radio_max,
            "last_result": self.radio_last_result,
            "last_snapshot": self.radio_last_snapshot,
        }

# Flight Mode Functions ########################################################################

    def set_flight_modes(self, mode_entries):
        '''Set FLTMODE1-6 params via fire-and-forget param_set_send (no ack wait).
        mode_entries: list of dicts [{slot: int, mode: str}, ...], length must be 6.
        Raises ValueError for unknown mode names.'''
        mode_mapping = self.master.mode_mapping()
        if mode_mapping is None:
            raise RuntimeError("No mode mapping available from autopilot")

        canonical = {str(k).upper().replace(' ', '').replace('_', ''): (k, v)
                     for k, v in mode_mapping.items()}

        results = []
        for entry in mode_entries:
            slot = entry['slot']
            raw_name = entry['mode']
            key = str(raw_name).upper().replace(' ', '').replace('_', '')
            resolved = canonical.get(key)
            if resolved is None:
                raise ValueError(f"Unknown flight mode for slot {slot}: {raw_name}")
            canon_name, mode_value = resolved
            self.master.param_set_send(f"FLTMODE{slot}", float(mode_value))
            results.append({'slot': slot, 'mode': canon_name, 'value': mode_value})

        return results

# Servo Output Functions #######################################################################

    def set_servo_outputs(self, channel_entries):
        '''Set SERVOx output params using MAVLink PARAM_SET messages.
        channel_entries: list of dicts with channel, function, value, reversed,
        min, trim, and max fields. The Flask layer validates labels and ranges.'''
        saved_channels = []

        for entry in channel_entries:
            channel = int(entry['channel'])
            prefix = f"SERVO{channel}"
            params = [
                (f"{prefix}_FUNCTION", int(entry['value'])),
                (f"{prefix}_MIN", int(entry['min'])),
                (f"{prefix}_TRIM", int(entry['trim'])),
                (f"{prefix}_MAX", int(entry['max'])),
                (f"{prefix}_REVERSED", 1 if entry.get('reversed') else 0),
            ]

            for name, value in params:
                self.master.param_set_send(name, float(value))

            print(f"[SERVO] CH{channel}: function={entry['function']}({entry['value']}), "
                  f"reversed={entry.get('reversed', False)}, min={entry['min']}, "
                  f"trim={entry['trim']}, max={entry['max']}")

            saved_channels.append({
                "channel": channel,
                "function": entry['function'],
                "value": int(entry['value']),
                "reversed": bool(entry.get('reversed', False)),
                "min": int(entry['min']),
                "trim": int(entry['trim']),
                "max": int(entry['max']),
            })

        return saved_channels

instance = None

def get_dpk_mod():
    """Helper for Flask views to get the current module instance"""
    global instance
    return instance

def init(mpstate):
    """Called by MAVProxy when the module is loaded"""
    global instance
    instance = DPKModule(mpstate)
    return instance

```