import time
from pymavlink import mavutil

# Prepare waypoints from dictionary
def prepare_ordered_waypoints(data):
    if "points" not in data or "path" not in data:
        print("❌ Invalid mission data received")
        return []

    # Create dict for fast lookup
    waypoints_dict = {wp["id"]: wp for wp in data["points"]}

    # Order waypoints based on path
    ordered_waypoints = []
    for wp_id in data["path"]:
        if wp_id in waypoints_dict:
            ordered_waypoints.append(waypoints_dict[wp_id])
        else:
            print(f"⚠️ Warning: Waypoint ID '{wp_id}' not found in points")

    return ordered_waypoints

# Connect to MAVLink (UDP for QGC)
def connect_to_mavlink():
    connection = mavutil.mavlink_connection('udpin:127.0.0.1:14551') 
    connection.wait_heartbeat()
    print(f"✅ Heartbeat received from system {connection.target_system}, component {connection.target_component}")
    return connection

# Set home position based on first waypoint {included}
def set_home_location(connection, lat, lng, alt=0):
    target_system = connection.target_system
    target_component = connection.target_component
    print(f"📍 Setting home location to lat: {lat}, lng: {lng}, alt: {alt}")

    connection.mav.command_long_send(
        target_system, target_component,
        mavutil.mavlink.MAV_CMD_DO_SET_HOME,
        1,  # use current location: 0 = false (we provide location)
        0, lat, lng, alt, 0, 0, 0
    )
    time.sleep(1)

# Send mission waypoints to QGroundControl
def send_mission_to_qgc(waypoints):
    #waypoints = prepare_ordered_waypoints(data){change made}
    
    if not waypoints:
        print("❌ No valid waypoints to send to QGC.")
        return

    connection = connect_to_mavlink()
    target_system = connection.target_system
    target_component = connection.target_component

     # Set home to first waypoint
    home_lat = waypoints[0]["lat"]
    home_lng = waypoints[0]["lng"]
    set_home_location(connection, home_lat, home_lng, 0)

    # Clear existing mission
    connection.mav.mission_clear_all_send(target_system, target_component)
    time.sleep(0.5)

    mission_count = len(waypoints)
    connection.mav.mission_count_send(target_system, target_component, mission_count)
    print(f"Sending 📤 {mission_count} waypoints to QGC...")

    for i, wp in enumerate(waypoints):
        msg = connection.recv_match(type='MISSION_REQUEST', blocking=True, timeout=5)

        if msg and msg.seq == i:
            lat = int(wp["lat"] * 1e7)
            lng = int(wp["lng"] * 1e7)
            alt = 0

            print(f"Waypoint {wp['id']} - lat: {lat}, lng: {lng}")

            connection.mav.mission_item_int_send(
                target_system, target_component,
                i, mavutil.mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT_INT,
                mavutil.mavlink.MAV_CMD_NAV_WAYPOINT, 0, 1,
                0, 0, 0, 0,  # Params 1-4
                lat, lng, alt
            )
            time.sleep(0.5)
        else:
            print(f"⛔ MISSION_REQUEST timeout or unexpected seq (expected {i}, got {msg.seq if msg else 'None'})")
            break


    # Confirm upload
    ack = connection.recv_match(type='MISSION_ACK', blocking=True, timeout=5)
    if ack and ack.type == mavutil.mavlink.MAV_MISSION_ACCEPTED:
        print("✅ Mission upload successful!")
    else:
        print("❌ No MISSION_ACK received.")

    # Ask QGC to refresh the mission list
    connection.mav.mission_request_list_send(target_system, target_component)
    print("🔄 Requested mission list refresh in QGC")

    connection.close()
    print("Connection closed.")
